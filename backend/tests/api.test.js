const request = require("supertest");
const createApp = require("../src/app");
const db = require("../src/db");
const { signToken } = require("../src/utils/token");

jest.mock("../src/db", () => ({
  query: jest.fn(),
  transaction: jest.fn(),
  pool: { end: jest.fn() },
}));

const app = createApp();

describe("Mercado Vecino API Hito 4", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/health responde 200", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  test("GET /health responde 200 sin prefijo api", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  test("GET / responde 200 y lista rutas disponibles", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.body.endpoints).toContain("/api/productos");
  });

  test("GET /api/categories responde 200 y devuelve categorias desde Neon PostgreSQL", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: "1", name: "Tecnologia", description: "Notebooks y accesorios" }],
    });

    const response = await request(app).get("/api/categories");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("SELECT id, name, description FROM categories"));
  });

  test("GET /categorias responde 200 como alias publico", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: "1", name: "Tecnologia", description: "Notebooks y accesorios" }],
    });

    const response = await request(app).get("/categorias");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("POST /api/auth/login responde 401 con credenciales invalidas", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "demo@mercadovecino.cl", password: "incorrecta" });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Credenciales invalidas");
  });

  test("GET /api/users/me responde 401 sin token", async () => {
    const response = await request(app).get("/api/users/me");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Token requerido");
  });

  test("GET /api/posts/:id responde 404 cuando no existe", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).get("/api/posts/999");

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Publicacion no encontrada");
  });

  test("GET /api/productos responde 200 como alias de publicaciones", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).get("/api/productos");

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(0);
  });

  test("POST /api/posts responde 201 con token valido y archivo de imagen", async () => {
    const token = signToken({ id: 1, email: "demo@mercadovecino.cl", fullName: "Usuario Demo" });
    let client;

    db.transaction.mockImplementationOnce(async (callback) => {
      client = {
        query: jest
          .fn()
          .mockResolvedValueOnce({
            rows: [{
              id: "10",
              userId: 1,
              categoryId: 1,
              title: "Notebook de prueba",
              description: "Notebook publicado desde test",
              price: "250000",
              condition: "Usado - bueno",
              commune: "Santiago",
              status: "active",
            }],
          })
          .mockResolvedValueOnce({
            rows: [{
              id: "99",
              imageUrl: "/uploads/posts/notebook.png",
              altText: "Notebook",
              isCover: true,
            }],
          }),
      };
      return callback(client);
    });

    const response = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .field("categoryId", "1")
      .field("title", "Notebook de prueba")
      .field("description", "Notebook publicado desde test")
      .field("price", "250000")
      .field("condition", "Usado - bueno")
      .field("commune", "Santiago")
      .attach("images", Buffer.from("fake image content"), {
        filename: "notebook.png",
        contentType: "image/png",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.id).toBe("10");
    expect(response.body.images).toHaveLength(1);
    expect(client.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("INSERT INTO post_images"),
      expect.arrayContaining(["10", expect.stringContaining("/uploads/posts/"), "Notebook de prueba", true])
    );
  });
});
