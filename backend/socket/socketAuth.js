const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // ✅ thêm

const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const tryAuth = async (rawToken) => {
      try {
        if (!rawToken) return { ok: false, message: "Missing token" };

        const token = rawToken.startsWith("Bearer ")
          ? rawToken.split(" ")[1]
          : rawToken;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        socket.join(`user:${String(userId)}`);
        socket.data.userId = userId;

        // ✅ join admin room nếu role admin
        const user = await User.findById(userId).select("role").lean();
        if (user?.role === "admin") {
          socket.join("admins");
          socket.data.isAdmin = true;
        }

        socket.emit("auth:success", { userId, role: user?.role || "user" });
        return { ok: true, userId };
      } catch (err) {
        socket.emit("auth:failed", { message: "Invalid token" });
        return { ok: false, message: "Invalid token" };
      }
    };

    if (socket.handshake?.auth?.token) {
      // ✅ vì tryAuth giờ là async
      tryAuth(socket.handshake.auth.token);
    }

    socket.on("authenticate", async ({ token }) => {
      await tryAuth(token);
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = { registerSocketHandlers };