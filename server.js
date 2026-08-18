const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// تحميل متغيرات البيئة
dotenv.config();

// الاتصال بقاعدة البيانات
connectDB();

const app = express();

// إعداد الـ Middlewares الأساسية
app.use(express.json());
app.use(cors());

// نقطة التحقق الرئيسية للخادم
app.get('/', (req, res) => {
    res.json({ message: 'EventPulse API is running successfully!' });
});

// تفعيل المسارات (Routes)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

// معالجة الأخطاء المركزية
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});