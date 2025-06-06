const User = require('../models/userModel'); 
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const { validateProduct } = require('../validation/product'); 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Cấu hình multer (nên để ở ngoài hàm, chỉ khởi tạo 1 lần)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');

    // Tạo thư mục uploads nếu chưa tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file tránh trùng, ví dụ: 1625489012345.jpg
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Hàm xử lý upload ảnh
const uploadImage = (req, res) => {
  // Dùng middleware multer để xử lý file upload
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Lỗi khi upload ảnh:', err);
      return res.status(500).json({ message: 'Lỗi khi upload ảnh', error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }

    // Trả về đường dẫn public để frontend dùng
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ url: imageUrl });
  });
};


const getAdminDashboard = (req, res) => {
    res.json({ message: 'Welcome to the Admin Dashboard' });
};

// Lấy tất cả user
const manageUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }); 
    console.log('Lấy thành công tất cả người dùng!')
    res.json({ message: 'Get All Users', users });

  } catch (error) {
    res.status(500).json({ message: 'Error managing users', error: error.message });
  }
};

// Xóa user 
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User không tồn tại' });
    }
    console.log('Xóa thành công user: ', userId)
    res.status(200).json({ message: 'Xóa user thành công', user: deletedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi xóa user', error: error.message });
  }
};

// Lấy thông tin admin
const getAdminProfile = async (req, res) => {
  try {
      // Sử dụng req.userId đã được gán trong middleware protect
      const adminId = req.userId;

      // Truy vấn thông tin admin trong database
      const admin = await User.findOne({ _id: adminId, role: 'admin' });

      if (!admin) {
          return res.status(404).json({ message: "Không tìm thấy admin" });
      }

      // Trả về thông tin admin
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

// Cập nhật thông tin admin
const updateAdminProfile = async (req, res) => {
  try {
    // Lấy dữ liệu từ request body
    const { userName, phoneNumber, diaChi, email } = req.body;

    // Kiểm tra tên người dùng có hợp lệ không
    if (!userName || userName.trim() === '') {
        return res.status(400).json({ message: 'Tên người dùng là bắt buộc' });
    }

    // Kiểm tra số điện thoại có hợp lệ không
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ message: 'Số điện thoại phải có từ 10 đến 11 chữ số' });
    }

    // Kiểm tra địa chỉ có hợp lệ không
    if (!diaChi || diaChi.trim() === '') {
        return res.status(400).json({ message: 'Địa chỉ là bắt buộc' });
    }

    // Kiểm tra email hợp lệ (nếu cần)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
          return res.status(400).json({ message: 'Email không hợp lệ' });
      }
    }

    // Kiểm tra admin có tồn tại không
    const adminId = req.userId;
    const admin = await User.findById(adminId);
    if (!admin) {
        return res.status(404).json({ message: 'Admin không tồn tại' });
    }

    // Cập nhật các trường thông tin admin
    if (userName) admin.userName = userName;
    if (phoneNumber) admin.phoneNumber = phoneNumber;
    if (diaChi) admin.diaChi = diaChi;
    if (email) admin.email = email;

    // Lưu thông tin admin đã cập nhật
    const updatedAdmin = await admin.save();
    res.status(200).json({
        message: 'Cập nhật thông tin admin thành công',
        admin: updatedAdmin,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
      console.error('Lỗi khi cập nhật thông tin admin:', error);
      res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin admin', error: error.message });
    }
};

// Đổi mật khẩu admin
const changeAdminPassword = async (req, res) => {
  try {
      // Lấy dữ liệu từ request body
      const { currentPassword, newPassword } = req.body;

      // Kiểm tra mật khẩu hiện tại có đúng định dạng không
      if (!currentPassword || currentPassword.length < 6) {
          return res.status(400).json({ message: 'Mật khẩu hiện tại phải có ít nhất 6 ký tự' });
      }

      // Kiểm tra mật khẩu mới có đúng định dạng không
      if (!newPassword || newPassword.length < 6) {
          return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      }

      // Kiểm tra admin có tồn tại không
      const adminId = req.userId;
      const admin = await User.findById(adminId);
      if (!admin) {
          return res.status(404).json({ message: 'Admin không tồn tại' });
      }

      // Kiểm tra mật khẩu hiện tại có đúng không
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
      }

      // Mã hóa mật khẩu mới và lưu vào database
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(newPassword, salt);

      await admin.save();
      res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
      console.error('Lỗi khi đổi mật khẩu admin:', error);
      res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu', error: error.message });
  }
};

// Hiển thị tất cả sản phẩm
const manageProducts = async (req, res) => {
  try {
    const products = await Product.find(); 

    console.log('Lấy thành công tất cả sản phẩm!');
    res.json({ message: 'Get All Products', products }); 

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error managing products', error: error.message });
  }
};

// Tạo sản phẩm mới
const createProduct = async (req, res) => {
  try {
    // Lấy dữ liệu từ request body
    const productData = req.body;

    // Sử dụng Joi để xác thực dữ liệu
    const { error } = validateProduct(productData);

    if (error) {
      // Nếu có lỗi xác thực, trả về thông báo lỗi với chi tiết
      const missingFields = error.details.map(detail => detail.message);
      console.log('Dữ liệu không hợp lệ:', missingFields);

      return res.status(400).json({
        message: 'Dữ liệu sản phẩm không hợp lệ',
        missingFields
      });
    }

    // Tạo sản phẩm mới từ thông tin đã được xác thực
    const newProduct = new Product({
      name: productData.name,
      category: productData.category,
      brand: productData.brand,
      description: productData.description,
      specifications: productData.specifications,
      price: productData.price,
      sale: productData.sale || 0,
      quantity: productData.quantity || 0,
      rating: productData.rating || 0,
      star1: productData.star1 || 0,
      star2: productData.star2 || 0,
      star3: productData.star3 || 0,
      star4: productData.star4 || 0,
      star5: productData.star5 || 0,
      reviews: productData.reviews || {},
      variants: productData.variants,
    });

    // Lưu sản phẩm vào cơ sở dữ liệu
    const savedProduct = await newProduct.save();

    console.log('Tạo sản phẩm thành công!', savedProduct);
    res.status(201).json({ message: 'Tạo sản phẩm thành công', product: savedProduct });
  } catch (error) {
    console.error('Lỗi hệ thống:', error);
    res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error: error.message });
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id; // Lấy id của sản phẩm từ URL
    const product = await Product.findByIdAndDelete(id); // Xóa sản phẩm từ database
    console.log('Received request to delete product with ID:', req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    res.status(200).json({ message: 'Sản phẩm đã được xóa thành công', id });
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa sản phẩm', error });
  }
};

// Chỉnh sửa sản phẩm
const updateProduct = async (req, res) => {
  try {
    const id = req.params.id; 
    const updateData = req.body; 

    // Kiểm tra nếu id không hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
    }

    // Tìm và cập nhật sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    res.status(200).json({ message: 'Sản phẩm đã được cập nhật thành công', product: updatedProduct });
    console.log('Cập nhập sản phẩm thành công!');
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật sản phẩm', error: error.message });
  }
};

// Lấy tất cả đơn hàng
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId')  // Lấy thông tin người dùng từ model User
      .populate('items.productId')  // Lấy thông tin sản phẩm từ model Product
      .exec();

    if (!orders) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Chỉnh sửa trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  const { orderId, newStatus } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!orderId || !newStatus) {
      return res.status(400).json({ message: 'Missing orderId or newStatus' });
    }

    // Kiểm tra xem trạng thái mới có hợp lệ không
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Cập nhật trạng thái đơn hàng
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId, 
      { orderStatus: newStatus }, 
      { new: true } // Trả về document sau khi đã cập nhật
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};



module.exports = { 
  getAdminDashboard, getAdminProfile, updateAdminProfile, 
  changeAdminPassword, manageUsers, manageProducts, 
  deleteUser, createProduct, deleteProduct, 
  updateProduct, getAllOrders, updateOrderStatus,
  uploadImage,
};