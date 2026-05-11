const Joi = require("joi");

const postSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required(),
  title: Joi.string().min(5).max(140).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().min(1).required(),
  condition: Joi.string().valid("Nuevo", "Usado - excelente", "Usado - bueno", "Usado - regular").required(),
  commune: Joi.string().min(2).max(80).required(),
  status: Joi.string().valid("active", "paused", "sold").default("active"),
  images: Joi.array().items(
    Joi.object({
      imageUrl: Joi.string().required(),
      altText: Joi.string().max(160).allow("", null),
      isCover: Joi.boolean().default(false),
    })
  ).min(1).required(),
});

const postUpdateSchema = postSchema.fork(["images"], (schema) => schema.optional());

module.exports = {
  postSchema,
  postUpdateSchema,
};
