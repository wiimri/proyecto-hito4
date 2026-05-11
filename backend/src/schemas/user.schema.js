const Joi = require("joi");

const profileSchema = Joi.object({
  fullName: Joi.string().min(3).max(120).required(),
  phone: Joi.string().max(30).allow("", null),
  avatarUrl: Joi.string().uri().allow("", null),
});

module.exports = {
  profileSchema,
};
