// app.js
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const Order = require("./models/order");
const config = require("./config");

class App {
    constructor() {
        this.app = express();
        this.connectDB();
        this.setupOrderConsumer();
    }

    async connectDB() {
        try {
            await mongoose.connect(config.mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log("✅ MongoDB connected");
        } catch (err) {
            console.error("❌ MongoDB connection error:", err.message);
            process.exit(1);
        }
    }

    async disconnectDB() {
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }

    async setupOrderConsumer() {
        console.log("🔗 Connecting to RabbitMQ...");

        const MAX_ATTEMPTS = 5;
        const RETRY_DELAY = 5000;
        let attempt = 0;

        while (attempt < MAX_ATTEMPTS) {
            attempt++;
            try {
                // Kết nối RabbitMQ với frameMax và heartbeat
                const connection = await amqp.connect(config.rabbitMQURI, {
                    frameMax: 131072,
                    heartbeat: 10,
                });
                const channel = await connection.createChannel();

                // Tạo queue từ config
                await channel.assertQueue(config.rabbitMQQueue);
                console.log(`✅ Connected to RabbitMQ and queue '${config.rabbitMQQueue}' is ready`);

                // Consume messages
                channel.consume(config.rabbitMQQueue, async(msg) => {
                    if (!msg) return;

                    console.log("📥 Consuming ORDER message");
                    const { products, username, orderId } = JSON.parse(msg.content.toString());

                    const newOrder = new Order({
                        products,
                        user: username,
                        totalPrice: products.reduce((acc, product) => acc + product.price, 0),
                    });

                    await newOrder.save();
                    channel.ack(msg);
                    console.log("✅ Order saved to DB and ACK sent to queue");

                    // Send fulfilled order to PRODUCTS queue (tên queue có thể config thêm nếu cần)
                    const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
                    const productsQueue = "products"; // hoặc config.productsQueue
                    channel.sendToQueue(
                        productsQueue,
                        Buffer.from(JSON.stringify({ orderId, user, products: savedProducts, totalPrice }))
                    );
                    console.log(`➡️ Message sent to '${productsQueue}' queue`);
                });

                break; // exit loop khi connect thành công
            } catch (err) {
                console.error(`❌ Attempt ${attempt} failed: ${err.message}`);
                if (attempt < MAX_ATTEMPTS) {
                    console.log(`⏳ Retrying in ${RETRY_DELAY / 1000}s...`);
                    await new Promise(r => setTimeout(r, RETRY_DELAY));
                } else {
                    console.error("❌ Failed to connect to RabbitMQ after maximum attempts");
                    process.exit(1);
                }
            }
        }
    }

    start() {
        this.server = this.app.listen(config.port, () =>
            console.log(`🚀 Server started on port ${config.port}`)
        );
    }

    async stop() {
        await this.disconnectDB();
        if (this.server) this.server.close();
        console.log("🛑 Server stopped");
    }
}

module.exports = App;