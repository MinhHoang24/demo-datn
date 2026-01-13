const ProductModel = require('../models/productModel');
const Comment = require('../models/commentModel');

const withVariantMeta = (product) => {
  if (!product) return product;

  const variants = product.variants || [];

  const totalQuantity = variants.reduce(
    (sum, v) => sum + (v.quantity || 0),
    0
  );

  const maxSale = variants.reduce(
    (max, v) => Math.max(max, v.sale || 0),
    0
  );

  // 👇 QUAN TRỌNG
  const base =
    typeof product.toObject === "function"
      ? product.toObject()
      : product;

  return {
    ...base,
    quantity: totalQuantity,
    sale: maxSale,
  };
};

// Route to get all products
const getProducts = async (req, res) => {
  try {
    const products = await ProductModel.find().lean();

    // Lấy danh sách productId
    const productIds = products.map(p => p._id);

    // Aggregate rating từ comments
    const ratingAgg = await Comment.aggregate([
      { $match: { productId: { $in: productIds } } },
      {
        $group: {
          _id: "$productId",
          rating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    // Map rating theo productId
    const ratingMap = Object.fromEntries(
      ratingAgg.map(r => [
        r._id.toString(),
        {
          rating: Number(r.rating.toFixed(1)),
          totalRatings: r.totalRatings,
        },
      ])
    );

    // Format product + gắn rating
    const formattedProducts = products.map(p => {
      const meta = withVariantMeta(p);

      return {
        ...meta,
        rating: ratingMap[p._id]?.rating || 0,
        totalRatings: ratingMap[p._id]?.totalRatings || 0,
      };
    });

    return res.status(200).json({
      message: "Products fetched successfully",
      formattedProducts,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching products",
      error: err.message,
    });
  }
};

// get product by id
const getProductById = async (req, res) => {
  const product = await ProductModel.findById(req.params.productId).lean();
  if (!product) return res.status(404).json({ message: "Not found" });

  const agg = await Comment.aggregate([
    { $match: { productId: product._id } },
    {
      $group: {
        _id: "$productId",
        rating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  const ratingData = agg[0] || { rating: 0, totalRatings: 0 };

  res.json({
    product: {
      ...product,
      rating: Number(ratingData.rating.toFixed(1)),
      totalRatings: ratingData.totalRatings,
    },
  });
};

// Add a review (rating)
const addReview = async (req, res) => {
  const { productId, userId, stars, text } = req.body;

  //console.log(productId);
  //console.log(userId);
  //console.log(stars);
  //console.log(text);

  if (!productId || !userId || !stars || stars < 1 || stars > 5) {
    return res.status(400).json({ message: "All fields are required, and 'stars' must be between 1 and 5." });
  }

  try {
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }


    // Add the review
    product.reviews.set(userId, stars, text);

    // Update the star-level count
    if (stars === 1) product.star1++;
    if (stars === 2) product.star2++;
    if (stars === 3) product.star3++;
    if (stars === 4) product.star4++;
    if (stars === 5) product.star5++;

    // Recalculate the average rating
    const totalReviews = product.star1 + product.star2 + product.star3 + product.star4 + product.star5;

    if (totalReviews === 0) {
      product.rating = 0; // Default to 0 if there are no reviews
    } else {
      const totalStars = product.star1 * 1 + product.star2 * 2 + product.star3 * 3 + product.star4 * 4 + product.star5 * 5;
      product.rating = totalStars / totalReviews;
    }

    await product.save();

    res.status(200).json({ message: "Review added successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Error adding review", error: err.message });
  }
};


const getComments = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.reviews || product.reviews.size === 0) {
      return res.status(200).json({ message: 'No comments found', comments: [] });
    }

    // If reviews is a Map, convert it to an array of values
    const comments = Array.from(product.reviews.values()).map((review) => review.text);

    res.status(200).json({ message: 'Comments fetched successfully', comments });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments', error: err.message });
  }
};

const getRelatedProducts = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const relatedProducts = await ProductModel.find({
      category: product.category,
      _id: { $ne: productId },
    }).limit(10).lean();

    const relatedIds = relatedProducts.map(p => p._id);

    const ratingAgg = await Comment.aggregate([
      { $match: { productId: { $in: relatedIds } } },
      {
        $group: {
          _id: "$productId",
          rating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const ratingMap = Object.fromEntries(
      ratingAgg.map(r => [
        r._id.toString(),
        {
          rating: Number(r.rating.toFixed(1)),
          totalRatings: r.totalRatings,
        },
      ])
    );

    const formattedRelated = relatedProducts.map(p => {
      const meta = withVariantMeta(p);

      return {
        ...meta,
        rating: ratingMap[p._id]?.rating || 0,
        totalRatings: ratingMap[p._id]?.totalRatings || 0,
      };
    });

    return res.status(200).json(formattedRelated);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm liên quan:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi máy chủ" });
  }
};

const getAllProducts = async (req, res) => {
  const products = await ProductModel.find().lean();

  const productIds = products.map(p => p._id);

  const ratingAgg = await Comment.aggregate([
    { $match: { productId: { $in: productIds } } },
    {
      $group: {
        _id: "$productId",
        rating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  const ratingMap = Object.fromEntries(
    ratingAgg.map(r => [
      r._id.toString(),
      {
        rating: Number(r.rating.toFixed(1)),
        totalRatings: r.totalRatings,
      },
    ])
  );

  const formatted = products.map(p => {
    const meta = withVariantMeta(p);

    return {
      ...meta,
      rating: ratingMap[p._id]?.rating || 0,
      totalRatings: ratingMap[p._id]?.totalRatings || 0,
    };
  });

  res.json({ products: formatted });
};

module.exports = { getProducts, getProductById, addReview, getComments, getRelatedProducts, getAllProducts };