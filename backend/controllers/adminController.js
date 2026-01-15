// controllers/adminController.js
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Comment = require("../models/commentModel");
const { validateProduct } = require("../validation/product");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const upload = require("../config/uploadConfig");
const cloudinary = require("../config/cloudinaryConfig");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const { Notification } = require("../models/notificationModel");
const {
  notifyOrderStatusUpdated
} = require("../services/notificationService");

// Orders
const { Order, ORDER_STATUS } = require("../models/orderModel");

// =========================
// Upload image (giữ nguyên)
// =========================
const uploadImage = (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      console.error("Lỗi khi upload ảnh:", err);
      return res
        .status(500)
        .json({ message: "Lỗi khi upload ảnh", error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Không có file được upload" });
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "product_images",
        public_id: uuidv4(),
      });

      fs.unlinkSync(req.file.path);

      const imageUrl = result.secure_url;
      res.status(200).json({ url: imageUrl });
    } catch (error) {
      console.error("Lỗi khi upload ảnh lên Cloudinary:", error);
      res.status(500).json({
        message: "Lỗi khi upload ảnh lên Cloudinary",
        error: error.message,
      });
    }
  });
};

const getAdminDashboard = (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard" });
};

// =========================
// Users (giữ nguyên)
// =========================
const manageUsers = async (req, res) => {
  try {
    /* ================= QUERY PARAMS ================= */
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const {
      q,
      sort = "created_desc",
    } = req.query;

    /* ================= FILTER ================= */
    const filter = {
      role: { $ne: "admin" },
    };

    // search by name or email
    if (q) {
      const keyword = q.trim();
      filter.$or = [
        { userName: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { phoneNumber: { $regex: keyword, $options: "i" } },
      ];
    }

    /* ================= SORT ================= */
    let sortQuery = { createdAt: -1 }; // default newest

    if (sort === "name_asc") sortQuery = { name: 1 };
    if (sort === "name_desc") sortQuery = { name: -1 };
    if (sort === "email_asc") sortQuery = { email: 1 };
    if (sort === "email_desc") sortQuery = { email: -1 };

    /* ================= QUERY ================= */
    const users = await User.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    /* ================= RESPONSE ================= */
    return res.json({
      message: "Get All Users",
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("manageUsers error:", error);
    return res.status(500).json({
      message: "Error managing users",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User không tồn tại" });
    }
    console.log("Xóa thành công user: ", userId);
    res.status(200).json({ message: "Xóa user thành công", user: deletedUser });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi server khi xóa user", error: error.message });
  }
};

// =========================
// Admin profile (giữ nguyên)
// =========================
const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.userId;

    const admin = await User.findOne({ _id: adminId, role: "admin" });

    if (!admin) {
      return res.status(404).json({ message: "Không tìm thấy admin" });
    }

    res.json({
      admin: {
        _id: admin._id,
        userName: admin.userName,
        phoneNumber: admin.phoneNumber,
        diaChi: admin.diaChi,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin admin:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin admin", error });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const { userName, phoneNumber, diaChi, email } = req.body;

    if (!userName || userName.trim() === "") {
      return res.status(400).json({ message: "Tên người dùng là bắt buộc" });
    }

    const phoneRegex = /^\d{10,11}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      return res
        .status(400)
        .json({ message: "Số điện thoại phải có từ 10 đến 11 chữ số" });
    }

    if (!diaChi || diaChi.trim() === "") {
      return res.status(400).json({ message: "Địa chỉ là bắt buộc" });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Email không hợp lệ" });
      }
    }

    const adminId = req.userId;
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin không tồn tại" });
    }

    if (userName) admin.userName = userName;
    if (phoneNumber) admin.phoneNumber = phoneNumber;
    if (diaChi) admin.diaChi = diaChi;
    if (email) admin.email = email;

    const updatedAdmin = await admin.save();
    res.status(200).json({
      message: "Cập nhật thông tin admin thành công",
      admin: updatedAdmin,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }
    console.error("Lỗi khi cập nhật thông tin admin:", error);
    res.status(500).json({
      message: "Lỗi server khi cập nhật thông tin admin",
      error: error.message,
    });
  }
};

const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || currentPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu hiện tại phải có ít nhất 6 ký tự" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    const adminId = req.userId;
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin không tồn tại" });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);

    await admin.save();
    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu admin:", error);
    res.status(500).json({
      message: "Lỗi server khi đổi mật khẩu",
      error: error.message,
    });
  }
};

// =========================
// Products (giữ nguyên)
// =========================
const manageProducts = async (req, res) => {
  try {
    /* ================= QUERY PARAMS ================= */
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const {
      q,
      category,
      sort = "created_desc",
    } = req.query;

    /* ================= FILTER (MONGO) ================= */
    const filter = {};

    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    /* ================= SORT (MONGO SAFE) ================= */
    let sortQuery = { createdAt: -1 };

    if (sort === "name_asc") sortQuery = { name: 1 };
    if (sort === "name_desc") sortQuery = { name: -1 };
    if (sort === "price_asc") sortQuery = { price: 1 };
    if (sort === "price_desc") sortQuery = { price: -1 };

    /* ================= QUERY PRODUCTS ================= */
    const products = await Product.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);

    if (products.length === 0) {
      return res.json({
        products: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: 0,
        },
      });
    }

    /* ================= RATING AGG ================= */
    const productIds = products.map((p) => p._id);

    const ratings = await Comment.aggregate([
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
      ratings.map((r) => [
        r._id.toString(),
        {
          rating: Number(r.rating.toFixed(1)),
          totalRatings: r.totalRatings,
        },
      ])
    );

    /* ================= MERGE ================= */
    let result = products.map((p) => ({
      ...p,
      rating: ratingMap[p._id]?.rating || 0,
      totalRatings: ratingMap[p._id]?.totalRatings || 0,
    }));

    /* ================= SORT RATING (JS) ================= */
    if (sort === "rating_desc") {
      result.sort((a, b) => b.rating - a.rating);
    }

    /* ================= RESPONSE ================= */
    return res.json({
      products: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("manageProducts error:", err);
    return res.status(500).json({
      message: "Error fetching products",
      error: err.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    if (!Array.isArray(productData.variants) || productData.variants.length === 0) {
      return res.status(400).json({
        message: "Sản phẩm phải có ít nhất 1 biến thể",
      });
    }

    productData.description = (productData.description || []).filter((x) => x.trim() !== "");
    productData.specifications = (productData.specifications || []).filter(
      (x) => x.trim() !== ""
    );

    const hasVariants = Array.isArray(productData.variants) && productData.variants.length > 0;

    if (hasVariants) {
      productData.quantity = productData.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
    }

    const { error } = validateProduct(productData);

    if (error) {
      return res.status(400).json({
        message: "Dữ liệu sản phẩm không hợp lệ",
        missingFields: error.details.map((e) => e.message),
      });
    }

    const newProduct = new Product({
      name: productData.name,
      category: productData.category,
      image: productData.image,
      brand: productData.brand,
      description: productData.description,
      specifications: productData.specifications,
      price: productData.price,
      sale: productData.sale || 0,
      quantity: productData.quantity,
      variants: productData.variants || [],
      rating: 0,
      star1: 0,
      star2: 0,
      star3: 0,
      star4: 0,
      star5: 0,
      reviews: {},
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    res.status(500).json({
      message: "Lỗi khi tạo sản phẩm",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);
    console.log("Received request to delete product with ID:", req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    res.status(200).json({ message: "Sản phẩm đã được xóa thành công", id });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi khi xóa sản phẩm", error });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    res.status(200).json({
      message: "Sản phẩm đã được cập nhật thành công",
      product: updatedProduct,
    });
    console.log("Cập nhập sản phẩm thành công!");
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi cập nhật sản phẩm",
      error: error.message,
    });
  }
};

// =========================
// Orders (Admin list/detail/update-status + noti user + noti admin)
// =========================

const TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

// GET /admin/order?status=&page=&limit=&q=&from=&to=
const getAllOrders = async (req, res) => {
  try {
    /* ================= QUERY PARAMS ================= */
    const {
      status,
      page = 1,
      limit = 20,
      q,
      from,
      to,
      sort = "created_desc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    /* ================= FILTER ================= */
    const filter = {};

    // filter status
    if (status) {
      const st = String(status);
      if (!Object.values(ORDER_STATUS).includes(st)) {
        return res.status(400).json({ message: "status không hợp lệ" });
      }
      filter.status = st;
    }

    // filter date range
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    // search buyer
    if (q && String(q).trim()) {
      const keyword = String(q).trim();

      const userIds = await User.find({
        $or: [
          { userName: { $regex: keyword, $options: "i" } },
          { phoneNumber: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
        ],
      }).distinct("_id");

      // nếu không tìm thấy user nào → trả về rỗng
      if (!userIds.length) {
        return res.status(200).json({
          orders: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            totalPages: 0,
          },
        });
      }

      filter.userId = { $in: userIds };
    }

    /* ================= SORT ================= */
    let sortQuery = { createdAt: -1 }; // default: newest

    if (sort === "created_asc") sortQuery = { createdAt: 1 };
    if (sort === "created_desc") sortQuery = { createdAt: -1 };
    if (sort === "total_asc") sortQuery = { totalPrice: 1 };
    if (sort === "total_desc") sortQuery = { totalPrice: -1 };

    /* ================= QUERY ================= */
    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .populate("userId", "userName phoneNumber email diaChi")
        .populate("items.productId", "name image price category brand")
        .lean(),
    ]);

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    return res.status(500).json({ message: "Error fetching orders" });
  }
};

// GET /admin/orders/:orderId
const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "orderId không hợp lệ" });
    }

    const order = await Order.findById(orderId)
      .populate("userId", "userName phoneNumber email diaChi")
      .populate("items.productId", "name image price category brand variants")
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ order });
  } catch (error) {
    console.error("getOrderDetail error:", error);
    return res.status(500).json({ message: "Error fetching order detail" });
  }
};

// PUT /admin/order/update-status
// Body: { orderId, status }
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body || {};

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Missing/invalid orderId" });
    }

    const nextStatus = String(status || "");
    if (!Object.values(ORDER_STATUS).includes(nextStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const current = order.status;

    if (current === nextStatus) {
      return res.status(200).json({ message: "Status không đổi", order });
    }

    if (!canTransition(current, nextStatus)) {
      return res.status(400).json({
        message: `Không thể chuyển trạng thái từ ${current} sang ${nextStatus}`,
      });
    }

    order.status = nextStatus;

    if (nextStatus === ORDER_STATUS.CONFIRMED) order.confirmedAt = new Date();
    if (nextStatus === ORDER_STATUS.DELIVERED) order.deliveredAt = new Date();
    if (nextStatus === ORDER_STATUS.CANCELLED) {
      order.cancelledAt = new Date();
      order.cancelReason = "Admin cancelled";
    }

    await order.save();

    // 🔔 notification / realtime
    try {
      await notifyOrderStatusUpdated({ order, prevStatus: current });
    } catch (e) {
      console.error("updateOrderStatus notify failed:", e);
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return res.status(500).json({ message: "Error updating order status" });
  }
};

module.exports = {
  // dashboard
  getAdminDashboard,

  // profile
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,

  // users
  manageUsers,
  deleteUser,

  // products
  manageProducts,
  createProduct,
  deleteProduct,
  updateProduct,

  // orders
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,

  // upload
  uploadImage,
};