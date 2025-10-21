// src/utils/messageBroker.js
const amqp = require("amqplib");
require("dotenv").config();

class MessageBroker {
    constructor() {
        this.channel = null;
    }

    async connect() {
        // Lấy URI từ env (ưu tiên), fallback mặc định guest:guest@rabbitmq:5672 (cho docker), hoặc localhost cho local
        const amqpUri =
            process.env.RABBITMQ_URI ||
            "amqp://guest:guest@localhost:5672"; // đổi thành localhost nếu chạy máy thật
        console.log("Connecting to RabbitMQ:", amqpUri);

        // Delay để chờ RabbitMQ container khởi động (khi chạy docker compose)
        setTimeout(async() => {
            try {
                const connection = await amqp.connect(amqpUri, { frameMax: 131072 });
                this.channel = await connection.createChannel();
                await this.channel.assertQueue("products");
                console.log("RabbitMQ connected");
            } catch (err) {
                console.error("Failed to connect to RabbitMQ:", err.message);
            }
        }, 10000); // Delay 10s, có thể giảm nếu máy nhanh
    }

    async publishMessage(queue, message) {
        if (!this.channel) {
            console.error("No RabbitMQ channel available.");
            return;
        }

        try {
            await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        } catch (err) {
            console.log(err);
        }
    }

    async consumeMessage(queue, callback) {
        if (!this.channel) {
            console.error("No RabbitMQ channel available.");
            return;
        }

        try {
            await this.channel.consume(queue, (message) => {
                const content = message.content.toString();
                const parsedContent = JSON.parse(content);
                callback(parsedContent);
                this.channel.ack(message);
            });
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = new MessageBroker();