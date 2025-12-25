const Joi = require('joi');

// Variant chỉ required khi tồn tại trong mảng
const variantSchema = Joi.object({
  color: Joi.string().required(),
  sale: Joi.number().min(0).default(0),
  quantity: Joi.number().integer().min(0).default(0),
  image: Joi.string().required(),
});

// Product Schema
const productSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().required(),

  // ⭐ Ảnh chính của sản phẩm
  image: Joi.string().required(),

  brand: Joi.object({
    name: Joi.string().required(),
  }).required(),

  description: Joi.array()
    .items(Joi.string().allow(""))
    .min(1)
    .required(),

  specifications: Joi.array()
    .items(Joi.string().allow("")) 
    .min(1)
    .required(),

  price: Joi.number().required(),

  sale: Joi.number().min(0).default(0),
  quantity: Joi.number().integer().min(0).default(0),

  variants: Joi.array()
    .items(variantSchema)
    .default([]), // ⭐ không bắt buộc phải có

  rating: Joi.number().min(0).default(0),
  star1: Joi.number().min(0).default(0),
  star2: Joi.number().min(0).default(0),
  star3: Joi.number().min(0).default(0),
  star4: Joi.number().min(0).default(0),
  star5: Joi.number().min(0).default(0),

  reviews: Joi.object().pattern(Joi.string(), Joi.number().min(0)),
});

const validateProduct = (product) => {
  return productSchema.validate(product, { abortEarly: false });
};

module.exports = { validateProduct };
