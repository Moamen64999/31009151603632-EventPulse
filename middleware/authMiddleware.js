const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. التحقق من تسجيل الدخول (Authentication)
exports.requireAuth = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // استخراج التوكن من الـ Header
            token = req.headers.authorization.split(' ')[1];

            // فك تشفير والتحقق من صحة التوكن باستخدام JWT_SECRET
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // جلب بيانات المستخدم وإرفاقها بـ req.user (بدون كلمة المرور)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'المستخدم غير موجود' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'غير autorizado، التوكن غير صالح' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'غير مسموح، لا يوجد توكن مصادقة' });
    }
};

// 2. التحقق من الصلاحيات والأدوار (Authorization)
exports.requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `عذراً، دور المستخدم (${req.user ? req.user.role : 'غير معروف'}) ليس لديه صلاحية للقيام بهذا الإجراء`
            });
        }
        next();
    };
};