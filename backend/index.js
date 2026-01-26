require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

const cors = require("cors");
const path = require("path");

const http = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("./socket/socketServer");
const { registerSocketHandlers } = require("./socket/socketAuth");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

const corsOptions = {
  origin: ["https://demo-datn-xi.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

connectDB();

app.use("/", userRoutes);
app.use("/admin", adminRoutes);
app.use("/product", productRoutes);
app.use("/comments", commentRoutes);

app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/notifications", notificationRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;

// ✅ Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods,
    credentials: true,
  },
});

initSocket(io);
registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
