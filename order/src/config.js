require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://mongodb:27017/order',
    rabbitMQURI: process.env.RABBITMQ_URI || 'amqp://guest:guest@rabbitmq:5672',
    rabbitMQQueue: 'orders',
    productQueue: 'products',
    port: process.env.PORT_ORDER || 3002
};