const mongoose = require('mongoose');

const variantInputSchema = new mongoose.Schema({
  color: { type: String },
  sale: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  image: { type: String } 
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },

  image: { type: String, required: true }, 
  brand: {
    name: { type: String, required: true },
  },

  description: { type: [String], required: true },
  specifications: { type: [String], required: true },

  price: { type: Number, required: true },

  variants: { type: [variantInputSchema], default: [], required: true },

  rating: { type: Number, default: 0 },
  star1: { type: Number, default: 0 },
  star2: { type: Number, default: 0 },
  star3: { type: Number, default: 0 },
  star4: { type: Number, default: 0 },
  star5: { type: Number, default: 0 },
  reviews: { type: Map, of: Number, default: {} },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);