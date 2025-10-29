const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const MessageBroker = require("./utils/messageBroker");
const { router: productsRouter, productController } = require("./routes/productRoutes");
require("dotenv").config();

class App {
    constructor() {
        this.app = express();
        this.setMiddlewares();
        this.setRoutes();
    }

    // Khởi tạo an toàn, chờ DB và RabbitMQ
    async init() {
        try {
            await this.connectDB();
            await this.setupMessageBroker();
            // Bắt đầu lắng nghe tin nhắn chỉ khi broker đã kết nối
            productController.listenForOrderCompletion();
        } catch (error) {
            console.error("Product Service: Failed to initialize application:", error);
            // Thay vì exit, có thể giữ retry trong CI/CD
            // process.exit(1);
        }
    }

    async connectDB() {
        try {
            await mongoose.connect(config.mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log("Product Service: MongoDB connected");
        } catch (err) {
            console.error("Product Service: MongoDB connection failed:", err);
            throw err;
        }
    }

    setMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
    }

    setRoutes() {
        this.app.use("/", productsRouter);
    }

    async setupMessageBroker() {
        try {
            // Chờ broker với retry vô hạn (MessageBroker đã handle reconnect)
            await MessageBroker.connect(5000); // delay 5s nếu fail
            console.log("Product Service: RabbitMQ setup complete");
        } catch (err) {
            console.error("Product Service: RabbitMQ setup failed:", err);
        }
    }

    start() {
        this.server = this.app.listen(config.port, () =>
            console.log(`Product Service started on port ${config.port}`)
        );
    }

    async stop() {
        if (this.server) {
            this.server.close();
        }
        await mongoose.disconnect();
        await MessageBroker.close();
        console.log("Product Service stopped");
    }

    async disconnectDB() {
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }
}



module.exports = App;