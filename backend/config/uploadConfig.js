const multer = require('multer');
const path = require('path');

// Cấu hình Multer để lưu ảnh vào thư mục 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Định nghĩa thư mục lưu trữ (nên tạo thư mục 'uploads' trước khi sử dụng)
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất bằng cách kết hợp thời gian hiện tại và tên file gốc
    cb(null, Date.now() + '-' + file.originalname); 
  }
});

const upload = multer({ storage });  // Middleware multer cho phép tải lên 1 tệp

module.exports = upload;