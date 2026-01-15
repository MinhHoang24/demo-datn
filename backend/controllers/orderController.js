// controllers/orderController.js
const mongoose = require("mongoose");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");

const { Order, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require("../models/orderModel");
const {
  notifyOrderCancelledByAdmin,
  notifyOrderCancelledByUser
} = require("../services/notificationService");

// =====================
// Helpers
// =====================

function findVariant(product, color) {
  const c = String(color || "").toLowerCase();
  return (product.variants || []).find((v) => (v.color || "").toLowerCase() === c);
}

function calcUnitPrice(product, variantColor) {
  const basePrice = Number(product.price || 0);
  const color = String(variantColor || "").trim();
  if (!color) return basePrice;

  const v = findVariant(product, color);
  if (!v) return basePrice;

  const sale = Number(v.sale || 0);
  // sale giả định % (0-100)
  if (sale > 0 && sale <= 100) {
    return Math.max(0, Math.round((basePrice * (100 - sale)) / 100));
  }
  return basePrice;
}

// =====================
// USER APIs
// =====================

/**
 * USER: lấy danh sách đơn của tôi
 * GET /orders/my
 */
const getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;

    /* ================= QUERY PARAMS ================= */
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    /* ================= QUERY ================= */
    const [orders, total] = await Promise.all([
      Order.find({ userId })
        .sort({ createdAt: -1 }) // mới nhất trước
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ userId }),
    ]);

    /* ================= RESPONSE ================= */
    return res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getMyOrders error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * USER: xem chi tiết đơn của tôi
 * GET /orders/:orderId
 */
const getMyOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "orderId không hợp lệ" });
    }

    const order = await Order.findOne({ _id: orderId, userId }).lean();
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    return res.json({ order });
  } catch (error) {
    console.error("getMyOrderById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * USER: Checkout COD từ cart selected
 * POST /orders/checkout/cod
 * Body: { receiver?: { name, phoneNumber, address, note } }
 */
const checkoutSelectedCODFromCart = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.userId;
    const { receiver } = req.body || {};

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    const receiverFinal = {
      name: receiver?.name?.trim() || user.userName?.trim() || "",
      phoneNumber: receiver?.phoneNumber?.trim() || user.phoneNumber?.trim() || "",
      address: receiver?.address?.trim() || user.diaChi?.trim() || ""
    };

    if (!receiverFinal.name || !receiverFinal.phoneNumber || !receiverFinal.address) {
      return res.status(400).json({
        message: "Thiếu thông tin người nhận (name/phone/address)",
      });
    }

    session.startTransaction();

    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    const selectedItems = cart.items.filter((it) => it.isSelected);
    if (selectedItems.length === 0) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Bạn chưa chọn sản phẩm nào để thanh toán" });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const it of selectedItems) {
      const quantity = Number(it.quantity || 0);
      const color = String(it.color || "").trim();

      if (!color) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Thiếu variant color trong giỏ hàng" });
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        await session.abortTransaction();
        return res.status(400).json({ message: "quantity không hợp lệ" });
      }

      const product = await Product.findById(it.productId).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }

      const variant = findVariant(product, color);
      if (!variant) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Variant "${color}" không tồn tại` });
      }

      const stock = Number(variant.quantity || 0);
      if (stock < quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Sản phẩm "${product.name}" (${color}) không đủ tồn kho`,
        });
      }

      // trừ kho
      variant.quantity = stock - quantity;

      const unitPrice = calcUnitPrice(product, color);
      const lineTotal = unitPrice * quantity;

      subtotal += lineTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        variant: { color, image: variant.image || "" },
        unitPrice,
        quantity,
        lineTotal,
      });

      await product.save({ session });
    }

    const shippingFee = 0;
    const total = subtotal + shippingFee;

    const orderDocs = await Order.create(
      [
        {
          userId,
          items: orderItems,
          status: ORDER_STATUS.PENDING,
          paymentMethod: PAYMENT_METHOD.COD,
          subtotal,
          shippingFee,
          total,
          receiver: receiverFinal,
        },
      ],
      { session }
    );

    // xóa selected items khỏi cart
    const selectedIds = new Set(selectedItems.map((x) => String(x._id)));
    cart.items = cart.items.filter((it) => !selectedIds.has(String(it._id)));
    await cart.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      message: "Đặt hàng (COD) thành công",
      order: orderDocs[0],
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch {}
    console.error("checkoutSelectedCODFromCart error:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

/**
 * USER: hủy đơn (chỉ khi PENDING + paymentMethod COD)
 * PATCH /orders/:orderId/cancel
 * Body: { reason?: string }
 */
const cancelOrderByUser = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.userId;
    const { orderId } = req.params;
    const { reason } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "orderId không hợp lệ" });
    }

    session.startTransaction();

    const order = await Order.findOne({ _id: orderId, userId }).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.status !== ORDER_STATUS.PENDING) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Chỉ có thể hủy khi đơn đang chờ xác nhận" });
    }

    if (order.paymentMethod !== PAYMENT_METHOD.COD) {
      await session.abortTransaction();
      return res.status(400).json({
        message:
          "Chỉ có thể hủy đơn khi phương thức thanh toán là thanh toán khi nhận hàng (COD)",
      });
    }

    // hoàn kho
    for (const it of order.items) {
      const product = await Product.findById(it.productId).session(session);
      if (!product) continue;

      const color = it.variant?.color || "";
      if (!color) continue;

      const idx = (product.variants || []).findIndex(
        (x) => (x.color || "").toLowerCase() === color.toLowerCase()
      );
      if (idx !== -1) {
        product.variants[idx].quantity =
          Number(product.variants[idx].quantity || 0) + Number(it.quantity || 0);
        await product.save({ session });
      }
    }

    order.status = ORDER_STATUS.CANCELLED;
    order.cancelReason = reason ? String(reason) : "User cancelled";
    order.cancelledAt = new Date();

    await order.save({ session });
    await session.commitTransaction();

    // 🔔 notification / realtime (sau commit)
    try {
      await notifyOrderCancelledByUser({ order });
    } catch (e) {
      console.error("cancelOrderByUser notify failed:", e);
    }

    return res.json({ message: "Hủy đơn thành công", order });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch {}
    console.error("cancelOrderByUser error:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};


/**
 * ADMIN: hủy đơn (khớp PATCH /admin/orders/:orderId/cancel)
 * - hoàn kho + set CANCELLED
 * - user nhận noti + realtime
 * - admin lưu lịch sử noti
 */
const cancelOrderByAdmin = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "orderId không hợp lệ" });
    }

    session.startTransaction();

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.DELIVERED].includes(order.status)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Đơn đã kết thúc, không thể hủy" });
    }

    // hoàn kho
    for (const it of order.items) {
      const product = await Product.findById(it.productId).session(session);
      if (!product) continue;

      const color = it.variant?.color || "";
      if (!color) continue;

      const idx = (product.variants || []).findIndex(
        (x) => (x.color || "").toLowerCase() === color.toLowerCase()
      );
      if (idx !== -1) {
        product.variants[idx].quantity =
          Number(product.variants[idx].quantity || 0) + Number(it.quantity || 0);
        await product.save({ session });
      }
    }

    order.status = ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelReason = "Admin cancelled";

    await order.save({ session });
    await session.commitTransaction();

    // 🔔 notification / realtime (sau commit)
    try {
      await notifyOrderCancelledByAdmin({ order });
    } catch (e) {
      console.error("cancelOrderByAdmin notify failed:", e);
    }

    return res.json({ message: "Admin hủy đơn thành công", order });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch {}
    console.error("cancelOrderByAdmin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};


const checkoutBuyNowCOD = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.userId;
    const { items, receiver } = req.body || {};

    if (!Array.isArray(items) || items.length !== 1) {
      return res.status(400).json({
        message: "Buy Now chỉ cho phép 1 sản phẩm",
      });
    }

    const { productId, color, quantity } = items[0];

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "productId không hợp lệ" });
    }

    if (!color || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "color / quantity không hợp lệ" });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    const receiverFinal = {
      name: receiver?.name?.trim() || user.userName?.trim() || "",
      phoneNumber:
        receiver?.phoneNumber?.trim() || user.phoneNumber?.trim() || "",
      address: receiver?.address?.trim() || user.diaChi?.trim() || "",
    };

    if (
      !receiverFinal.name ||
      !receiverFinal.phoneNumber ||
      !receiverFinal.address
    ) {
      return res.status(400).json({
        message: "Thiếu thông tin người nhận (name/phone/address)",
      });
    }

    session.startTransaction();

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const variant = findVariant(product, color);
    if (!variant) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Variant "${color}" không tồn tại`,
      });
    }

    const stock = Number(variant.quantity || 0);
    if (stock < quantity) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Sản phẩm "${product.name}" (${color}) không đủ tồn kho`,
      });
    }

    // Trừ kho
    variant.quantity = stock - quantity;

    const unitPrice = calcUnitPrice(product, color);
    const lineTotal = unitPrice * quantity;

    const orderItem = {
      productId: product._id,
      name: product.name,
      image: product.image,
      variant: { color, image: variant.image || "" },
      unitPrice,
      quantity,
      lineTotal,
    };

    await product.save({ session });

    const orderDocs = await Order.create(
      [
        {
          userId,
          items: [orderItem],
          status: ORDER_STATUS.PENDING,
          paymentMethod: PAYMENT_METHOD.COD,
          subtotal: lineTotal,
          shippingFee: 0,
          total: lineTotal,
          receiver: receiverFinal,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(201).json({
      message: "Đặt hàng (Buy Now - COD) thành công",
      order: orderDocs[0],
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch {}
    console.error("checkoutBuyNowCOD error:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};
module.exports = {
  // user
  getMyOrders,
  getMyOrderById,
  checkoutSelectedCODFromCart,
  cancelOrderByUser,
  checkoutBuyNowCOD,

  // admin cancel
  cancelOrderByAdmin
};