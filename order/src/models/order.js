const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // SỬA LẠI: Không dùng ref, mà lưu trực tiếp một bản copy của object product
    products: [{
        name: String,
        price: Number,
        // description: String,
    }],
    // THÊM VÀO: Thêm trường user để lưu lại ai đã đặt hàng
    user: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { collection: 'orders' });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;