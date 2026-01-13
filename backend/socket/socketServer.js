let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;
};

const getIO = () => {
  if (!ioInstance) throw new Error("Socket.io chưa được khởi tạo");
  return ioInstance;
};

const emitToUser = (userId, event, payload) => {
  if (!ioInstance) return;
  ioInstance.to(`user:${String(userId)}`).emit(event, payload);
};

const emitToAdmins = (event, payload) => {
  if (!ioInstance) return;
  ioInstance.to("admins").emit(event, payload);
};

module.exports = { initSocket, getIO, emitToUser, emitToAdmins };