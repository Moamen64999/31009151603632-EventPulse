const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // خطأ معرف مونغوز غير صالح (CastError)
    if (err.name === 'CastError') {
        message = 'المورد غير موجود (معرف غير صالح)';
        statusCode = 404;
    }

    // خطأ تكرار قيمة فريدة في قاعدة البيانات (Duplicate Key)
    if (err.code === 11000) {
        message = 'البيانات مدخلة مسبقاً، يرجى استخدام قيمة أخرى';
        statusCode = 400;
    }

    // خطأ التحقق من صحة البيانات (Mongoose Validation Error)
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;