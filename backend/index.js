const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes'); 
const cartRoutes = require('./routes/cartRoutes'); 
const commentRoutes = require('./routes/commentRoutes')
const cors = require('cors');
const app = express();
const path = require('path');
const cloudinary = require('./config/cloudinaryConfig');
require('dotenv').config();

const corsOptions = {
    origin: ['https://web-hitech.web.app', 'http://localhost:3000'],  
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));


app.use(express.json());

// Kết nối đến MongoDB Atlas
connectDB();

// Sử dụng routes người dùng
app.use('/', userRoutes);

// Sử dụng rotes admin
app.use('/admin', adminRoutes);

// Sử dụng routes product
app.use('/product', productRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sử dụng routes order
app.use('/orders', orderRoutes); 

// Sử dụng routes cart
app.use('/cart', cartRoutes); 

// Sử dụng routes comments
app.use('/comments', commentRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});