const mongoose = require("mongoose");
const crypto = require("crypto");
const qs = require("qs");

const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");

const {
  Order,
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} = require("../models/orderModel");

const {
  PaymentSession,
  PAYMENT_SESSION_STATUS,
} = require("../models/paymentSessionModel");

/* =========================
   VNPay helpers (NO moment)
========================= */
const pad2 = (n) => String(n).padStart(2, "0");

function formatVnpDateGMT7(date = new Date()) {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const vn = new Date(utcMs + 7 * 3600000);

  return (
    vn.getFullYear() +
    pad2(vn.getMonth() + 1) +
    pad2(vn.getDate()) +
    pad2(vn.getHours()) +
    pad2(vn.getMinutes()) +
    pad2(vn.getSeconds())
  );
}

const addMinutes = (date, minutes) =>
  new Date(date.getTime() + minutes * 60000);

function sortObject(obj) {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
    });
  return sorted;
}

function signParams(params, secretKey) {
  const sorted = sortObject(params);
  const signData = qs.stringify(sorted, { encode: false });
  return crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
}

function getClientIp(req) {
  let ip =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "127.0.0.1";

  if (Array.isArray(ip)) ip = ip[0];
  if (ip.includes(",")) ip = ip.split(",")[0].trim();
  if (ip === "::1") ip = "127.0.0.1";
  return ip;
}

/* =========================
   Product helpers
========================= */
function findVariant(product, color) {
  return (product.variants || []).find(
    (v) => (v.color || "").toLowerCase() === String(color).toLowerCase()
  );
}

function calcUnitPrice(product, color) {
  const base = Number(product.price || 0);
  const v = findVariant(product, color);
  if (!v) return base;

  const sale = Number(v.sale || 0);
  if (sale > 0 && sale <= 100) {
    return Math.round((base * (100 - sale)) / 100);
  }
  return base;
}

/* =========================================================
   1) CREATE PAYMENT (VNPay)
   ❌ KHÔNG tạo Order
========================================================= */
const createVNPayPayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { receiver } = req.body || {};

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    const receiverFinal = {
      name: receiver?.name?.trim() || user.userName || "",
      phoneNumber: receiver?.phoneNumber?.trim() || user.phoneNumber || "",
      address: receiver?.address?.trim() || user.diaChi || "",
      note: receiver?.note?.trim() || "",
    };

    if (!receiverFinal.name || !receiverFinal.phoneNumber || !receiverFinal.address) {
      return res.status(400).json({ message: "Thiếu thông tin người nhận" });
    }

    const cart = await Cart.findOne({ userId }).lean();
    if (!cart?.items?.length) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    const selectedItems = cart.items.filter((i) => i.isSelected);
    if (!selectedItems.length) {
      return res.status(400).json({ message: "Chưa chọn sản phẩm" });
    }

    let subtotal = 0;
    const sessionItems = [];

    for (const it of selectedItems) {
      const product = await Product.findById(it.productId).lean();
      if (!product) throw new Error("Sản phẩm không tồn tại");

      const variant = findVariant(product, it.color);
      if (!variant) throw new Error("Variant không tồn tại");

      if (variant.quantity < it.quantity) {
        throw new Error(`Không đủ tồn kho: ${product.name}`);
      }

      const unitPrice = calcUnitPrice(product, it.color);
      subtotal += unitPrice * it.quantity;

      sessionItems.push({
        productId: product._id,
        color: it.color,
        quantity: it.quantity,
      });
    }

    // 🔥 tạo ObjectId trước → txnRef hợp lệ ngay
    const sessionId = new mongoose.Types.ObjectId();

    await PaymentSession.create({
      _id: sessionId,
      txnRef: sessionId.toString(),
      userId,
      items: sessionItems,
      receiver: receiverFinal,
      subtotal,
      total: subtotal,
      status: PAYMENT_SESSION_STATUS.PENDING,
    });

    const now = new Date();
    const vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: process.env.VNP_TMNCODE,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: sessionId.toString(),
      vnp_OrderInfo: `Thanh toan don hang ${sessionId}`,
      vnp_OrderType: "other",
      vnp_Amount: subtotal * 100,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL,
      vnp_IpAddr: getClientIp(req),
      vnp_CreateDate: formatVnpDateGMT7(now),
      vnp_ExpireDate: formatVnpDateGMT7(addMinutes(now, 5)),
    };

    const secureHash = signParams(vnpParams, process.env.VNP_HASH_SECRET);
    const finalParams = sortObject(vnpParams);
    finalParams.vnp_SecureHash = secureHash;

    const paymentUrl =
      process.env.VNP_URL + "?" + qs.stringify(finalParams, { encode: false });

    return res.json({ paymentUrl, txnRef: sessionId.toString() });
  } catch (err) {
    console.error("createVNPayPayment:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* =========================================================
   2) IPN – DUY NHẤT nơi tạo Order
========================================================= */
const vnpayIPN = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let params = { ...req.query };
    const secureHash = params.vnp_SecureHash;

    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    if (secureHash !== signParams(params, process.env.VNP_HASH_SECRET)) {
      return res.json({ RspCode: "97", Message: "Invalid checksum" });
    }

    if (
      params.vnp_ResponseCode !== "00" ||
      params.vnp_TransactionStatus !== "00"
    ) {
      await PaymentSession.findOneAndUpdate(
        { txnRef: params.vnp_TxnRef },
        { status: PAYMENT_SESSION_STATUS.FAILED }
      );
      return res.json({ RspCode: "00", Message: "OK" });
    }

    session.startTransaction();

    const ps = await PaymentSession.findOne({ txnRef: params.vnp_TxnRef }).session(session);
    if (!ps || (ps.status === PAYMENT_SESSION_STATUS.SUCCESS && ps.orderId)) {
      await session.commitTransaction();
      return res.json({ RspCode: "00", Message: "OK" });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const it of ps.items) {
      const product = await Product.findById(it.productId).session(session);
      const variant = findVariant(product, it.color);

      if (variant.quantity < it.quantity) throw new Error("Hết hàng");

      variant.quantity -= it.quantity;
      const unitPrice = calcUnitPrice(product, it.color);
      subtotal += unitPrice * it.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        variant: { color: it.color, image: variant.image || "" },
        unitPrice,
        quantity: it.quantity,
        lineTotal: unitPrice * it.quantity,
      });

      await product.save({ session });
    }

    const [order] = await Order.create(
      [
        {
          userId: ps.userId,
          items: orderItems,
          status: ORDER_STATUS.CONFIRMED,
          paymentMethod: PAYMENT_METHOD.QR,
          paymentStatus: PAYMENT_STATUS.PAID,
          paymentGateway: "VNPAY",
          paymentTxnRef: ps.txnRef,
          paidAt: new Date(),
          paymentMeta: params,
          subtotal,
          total: subtotal,
          receiver: ps.receiver,
        },
      ],
      { session }
    );

    ps.status = PAYMENT_SESSION_STATUS.SUCCESS;
    ps.orderId = order._id;
    ps.vnpayMeta = params;
    await ps.save({ session });

    await Cart.updateOne(
      { userId: ps.userId },
      { $pull: { items: { isSelected: true } } },
      { session }
    );

    await session.commitTransaction();
    return res.json({ RspCode: "00", Message: "OK" });
  } catch (err) {
    await session.abortTransaction();
    console.error("vnpayIPN:", err);
    return res.json({ RspCode: "99", Message: "Internal error" });
  } finally {
    session.endSession();
  }
};

/* =========================================================
   3) RETURN – chỉ redirect FE
========================================================= */
const vnpayReturn = async (req, res) => {
  try {
    let params = { ...req.query };
    const secureHash = params.vnp_SecureHash;

    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    if (secureHash !== signParams(params, process.env.VNP_HASH_SECRET)) {
      return res.redirect("http://localhost:3000/payment-fail");
    }

    const txnRef = params.vnp_TxnRef;

    // 🔥 DEV MODE: TẠO ORDER TẠI RETURN NẾU IPN KHÔNG CHẠY
    if (
      process.env.NODE_ENV !== "production" &&
      params.vnp_ResponseCode === "00"
    ) {
      const ps = await PaymentSession.findOne({ txnRef });

      if (ps && ps.status !== PAYMENT_SESSION_STATUS.SUCCESS) {
        // ❗ GỌI LẠI LOGIC TẠO ORDER (TÁI SỬ DỤNG IPN)
        await vnpayIPN(
          { query: { ...req.query } },
          { json: () => {} } // fake response
        );
      }
    }

    const FE_SUCCESS = "http://localhost:3000/payment-success";
    const FE_FAIL = "http://localhost:3000/payment-fail";

    return res.redirect(
      params.vnp_ResponseCode === "00"
        ? `${FE_SUCCESS}?txnRef=${txnRef}`
        : `${FE_FAIL}?txnRef=${txnRef}`
    );
  } catch (err) {
    console.error("vnpayReturn:", err);
    return res.redirect("http://localhost:3000/payment-fail");
  }
};

module.exports = {
  createVNPayPayment,
  vnpayIPN,
  vnpayReturn,
};