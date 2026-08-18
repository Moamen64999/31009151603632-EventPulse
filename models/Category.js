const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'يرجى إدخال اسم التصنيف'],
        unique: true,
        trim: true
    },
    description: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);