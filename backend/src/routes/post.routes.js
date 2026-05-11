const express = require("express");
const db = require("../db");
const asyncHandler = require("../utils/async-handler");
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { uploadPostImages, normalizePostImages } = require("../middlewares/upload.middleware");
const { postSchema, postUpdateSchema } = require("../schemas/post.schema");

const router = express.Router();

router.get("/", asyncHandler(async (request, response) => {
  const page = Math.max(Number(request.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(request.query.limit || 12), 1), 50);
  const offset = (page - 1) * limit;
  const search = `%${request.query.search || ""}%`;
  const categoryId = request.query.categoryId || null;

  const result = await db.query(
    `SELECT p.id, p.title, p.price, p.condition, p.commune, p.status,
      json_build_object('id', c.id, 'name', c.name) AS category,
      json_build_object('id', u.id, 'fullName', u.full_name) AS seller,
      (
        SELECT pi.image_url FROM post_images pi
        WHERE pi.post_id = p.id
        ORDER BY pi.is_cover DESC, pi.id ASC
        LIMIT 1
      ) AS "coverImage",
      COUNT(*) OVER()::int AS total
     FROM posts p
     JOIN categories c ON c.id = p.category_id
     JOIN users u ON u.id = p.user_id
     WHERE p.status = 'active'
       AND ($1::text = '%%' OR p.title ILIKE $1 OR p.description ILIKE $1)
       AND ($2::bigint IS NULL OR p.category_id = $2)
     ORDER BY p.created_at DESC
     LIMIT $3 OFFSET $4`,
    [search, categoryId, limit, offset]
  );

  response.json({
    data: result.rows.map(({ total, ...row }) => row),
    pagination: { page, limit, total: result.rows[0]?.total || 0 },
  });
}));

router.get("/:id", asyncHandler(async (request, response) => {
  const result = await db.query(
    `SELECT p.id, p.title, p.description, p.price, p.condition, p.commune, p.status,
      json_build_object('id', c.id, 'name', c.name) AS category,
      json_build_object('id', u.id, 'fullName', u.full_name, 'phone', u.phone) AS seller,
      COALESCE(json_agg(json_build_object(
        'id', pi.id,
        'imageUrl', pi.image_url,
        'altText', pi.alt_text,
        'isCover', pi.is_cover
      ) ORDER BY pi.is_cover DESC, pi.id ASC) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images,
      p.created_at AS "createdAt"
     FROM posts p
     JOIN categories c ON c.id = p.category_id
     JOIN users u ON u.id = p.user_id
     LEFT JOIN post_images pi ON pi.post_id = p.id
     WHERE p.id = $1 AND p.status <> 'deleted'
     GROUP BY p.id, c.id, u.id`,
    [request.params.id]
  );

  const post = result.rows[0];
  if (!post) return response.status(404).json({ message: "Publicacion no encontrada", errors: [] });
  return response.json(post);
}));

router.post("/", auth, uploadPostImages, normalizePostImages, validate(postSchema), asyncHandler(async (request, response) => {
  const post = await db.transaction(async (client) => {
    const { categoryId, title, description, price, condition, commune, status, images } = request.body;
    const result = await client.query(
      `INSERT INTO posts (user_id, category_id, title, description, price, condition, commune, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id AS "userId", category_id AS "categoryId", title, description, price, condition, commune, status`,
      [request.user.id, categoryId, title, description, price, condition, commune, status]
    );

    const createdPost = result.rows[0];
    const savedImages = [];

    for (const image of images) {
      const imageResult = await client.query(
        `INSERT INTO post_images (post_id, image_url, alt_text, is_cover)
         VALUES ($1, $2, $3, $4)
         RETURNING id, image_url AS "imageUrl", alt_text AS "altText", is_cover AS "isCover"`,
        [createdPost.id, image.imageUrl, image.altText || null, image.isCover]
      );
      savedImages.push(imageResult.rows[0]);
    }

    return { ...createdPost, images: savedImages };
  });

  response.status(201).json(post);
}));

router.put("/:id", auth, uploadPostImages, normalizePostImages, validate(postUpdateSchema), asyncHandler(async (request, response) => {
  const updatedPost = await db.transaction(async (client) => {
    const { categoryId, title, description, price, condition, commune, status, images } = request.body;
    const result = await client.query(
      `UPDATE posts
       SET category_id = $1, title = $2, description = $3, price = $4, condition = $5, commune = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING id, user_id AS "userId", category_id AS "categoryId", title, description, price, condition, commune, status`,
      [categoryId, title, description, price, condition, commune, status, request.params.id, request.user.id]
    );

    const post = result.rows[0];
    if (!post) return null;

    if (images && images.length > 0) {
      await client.query("DELETE FROM post_images WHERE post_id = $1", [post.id]);
      const savedImages = [];

      for (const image of images) {
        const imageResult = await client.query(
          `INSERT INTO post_images (post_id, image_url, alt_text, is_cover)
           VALUES ($1, $2, $3, $4)
           RETURNING id, image_url AS "imageUrl", alt_text AS "altText", is_cover AS "isCover"`,
          [post.id, image.imageUrl, image.altText || null, image.isCover]
        );
        savedImages.push(imageResult.rows[0]);
      }

      return { ...post, images: savedImages };
    }

    const imagesResult = await client.query(
      `SELECT id, image_url AS "imageUrl", alt_text AS "altText", is_cover AS "isCover"
       FROM post_images
       WHERE post_id = $1
       ORDER BY is_cover DESC, id ASC`,
      [post.id]
    );

    return { ...post, images: imagesResult.rows };
  });

  if (!updatedPost) return response.status(404).json({ message: "Publicacion no encontrada", errors: [] });
  return response.json(updatedPost);
}));

router.delete("/:id", auth, asyncHandler(async (request, response) => {
  const result = await db.query(
    `UPDATE posts
     SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [request.params.id, request.user.id]
  );

  if (!result.rows[0]) return response.status(404).json({ message: "Publicacion no encontrada", errors: [] });
  return response.json({ message: "Publicacion eliminada correctamente" });
}));

module.exports = router;
