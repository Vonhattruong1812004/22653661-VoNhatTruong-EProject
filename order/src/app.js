const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const Order = require("./models/order");
const config = require("./config");

class App {
    constructor() {
        this.app = express();
        // Không gọi hàm async trong constructor nữa
    }

    // Tạo hàm init để xử lý các tác vụ bất đồng bộ một cách an toàn
    async init() {
        try {
            await this.connectDB();
            await this.setupOrderConsumer();
        } catch (error) {
            console.error("Failed to initialize Order Service:", error);
            process.exit(1); // Thoát ứng dụng nếu không kết nối được
        }
    }

    async connectDB() {
        await mongoose.connect(config.mongoURI);
        console.log("Order Service: MongoDB connected");
    }

    async disconnectDB() {
        await mongoose.disconnect();
        console.log("Order Service: MongoDB disconnected");
    }

    async setupOrderConsumer() {
        console.log("Order Service: Connecting to RabbitMQ...");

        // Đọc URI từ config, không hardcode
        const connection = await amqp.connect(config.rabbitMQURI);
        const channel = await connection.createChannel();
        console.log("Order Service: RabbitMQ connected");

        // Khai báo cả 2 queue với durable: true để đảm bảo nhất quán
        await channel.assertQueue(config.rabbitMQQueue, { durable: true }); // 'orders' queue
        await channel.assertQueue(config.productQueue, { durable: true }); // 'products' queue

        console.log(`Order Service: Waiting for messages in queue '${config.rabbitMQQueue}'...`);

        channel.consume(config.rabbitMQQueue, async(data) => {
            if (data === null) return;

            console.log("Order Service: Received a new order request.");
            const { products, username, orderId } = JSON.parse(data.content.toString());

            const newOrder = new Order({
                products,
                user: username,
                totalPrice: products.reduce((acc, product) => acc + product.price, 0),
            });

            await newOrder.save();
            console.log("Order Service: Order saved to DB.");

            // Gửi ACK (Acknowledgement) để báo cho RabbitMQ biết tin nhắn đã được xử lý xong
            channel.ack(data);

            // Gửi tin nhắn "hoàn thành" trở lại cho product-service
            // Dùng tên queue từ config
            channel.sendToQueue(
                config.productQueue,
                Buffer.from(JSON.stringify({ orderId, ...newOrder.toJSON() }))
            );
            console.log(`Order Service: Sent completion message back to queue '${config.productQueue}'.`);
        });
    }

    start() {
        this.server = this.app.listen(config.port, () =>
            console.log(`Order Service started on port ${config.port}. This service has no HTTP routes.`)
        );
    }

    async stop() {
        if (this.server) {
            this.server.close();
        }
        await this.disconnectDB();
        console.log("Order Service stopped");
    }
}

module.exports = App;