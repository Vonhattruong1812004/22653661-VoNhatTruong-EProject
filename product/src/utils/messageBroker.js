const amqp = require("amqplib");
require("dotenv").config();

class MessageBroker {
    constructor() {
        this.channel = null;
        this.connection = null;
        this.connected = false;
    }

    /**
     * Kết nối RabbitMQ với retry / reconnect tự động
     * @param {number} delay Thời gian delay giữa các lần thử (ms)
     */
    async connect(delay = 5000) {
        const amqpServer = process.env.RABBITMQ_URI || "amqp://guest:guest@rabbitmq:5672";

        while (!this.connected) {
            try {
                console.log("Product Service: Connecting to RabbitMQ...");
                this.connection = await amqp.connect(amqpServer);
                this.channel = await this.connection.createChannel();

                // Tạo durable queues
                await this.channel.assertQueue("products", { durable: true });
                await this.channel.assertQueue("orders", { durable: true });

                console.log("Product Service: RabbitMQ connected and queues asserted.");
                this.connected = true;

                // Tự động reconnect khi connection close
                this.connection.on("close", async() => {
                    console.warn("Product Service: RabbitMQ connection closed. Will reconnect...");
                    this.connected = false;
                    await new Promise(r => setTimeout(r, delay));
                    this.connect(delay);
                });

                this.connection.on("error", async(err) => {
                    console.error("Product Service: RabbitMQ connection error:", err.message);
                    this.connected = false;
                    await new Promise(r => setTimeout(r, delay));
                    this.connect(delay);
                });

                return; // kết nối thành công, thoát vòng loop
            } catch (err) {
                console.warn(`Product Service: Connection failed: ${err.message}. Retrying in ${delay}ms...`);
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }

    async publishMessage(queue, message) {
        if (!this.channel) {
            console.error("Product Service: No channel to publish message.");
            return;
        }
        try {
            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
            console.log(`Product Service: Message sent to queue ${queue}`);
        } catch (err) {
            console.error(`Product Service: Error publishing message to ${queue}:`, err);
        }
    }

    consumeMessage(queue, callback) {
        if (!this.channel) {
            console.error("Product Service: No channel to consume message.");
            return;
        }
        try {
            this.channel.consume(queue, (message) => {
                if (message) {
                    const content = JSON.parse(message.content.toString());
                    callback(content);
                    this.channel.ack(message);
                }
            });
            console.log(`Product Service: Listening for messages on queue: ${queue}`);
        } catch (err) {
            console.error(`Product Service: Error consuming message from ${queue}:`, err);
        }
    }

    async close() {
        if (this.connection) {
            await this.connection.close();
            console.log("Product Service: RabbitMQ connection closed.");
            this.connected = false;
        }
    }
}

module.exports = new MessageBroker();