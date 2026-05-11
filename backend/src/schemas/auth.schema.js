const Joi = require("joi");

const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(120).required(),
  email: Joi.string().email().max(160).required(),
  phone: Joi.string().max(30).allow("", null),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
