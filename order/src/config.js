require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://localhost/orders',
    rabbitMQURI: process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672', // <-- SỬA DÒNG NÀY!
    rabbitMQQueue: 'orders',
    port: 3002
};