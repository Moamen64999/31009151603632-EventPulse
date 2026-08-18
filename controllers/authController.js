const User = require('../models/User');
const jwt = require('jsonwebtoken');

// دالة لتوليد التوكن (JWT)
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecretkey123', {
    expiresIn: '30d',
  });
};

// تسجيل مستخدم جديد
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // التأكد هل الإيميل مسجل من قبل ولا لا
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // إنشاء المستخدم الجديد (سيتم تشفير الباسورد أوتوماتيك بفضل الـ pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تسجيل الدخول
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // البحث عن المستخدم بالإيميل
    const user = await User.findOne({ email });

    // التحقق من وجود المستخدم ومطابقة الباسورد
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("REGISTER ERROR:", error); // زود السطر ده
    res.status(500).json({ message: error.message });
  }
};