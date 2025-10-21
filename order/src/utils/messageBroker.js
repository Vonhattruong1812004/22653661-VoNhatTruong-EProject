// services/messageBroker.js
const amqp = require("amqplib");
const config = require("../config");
const OrderService = require("./orderService");

class MessageBroker {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.MAX_ATTEMPTS = 5;
        this.RETRY_DELAY = 5000; // 5 giây
    }

    async connect() {
        let attempt = 0;

        while (attempt < this.MAX_ATTEMPTS) {
            attempt++;
            console.log(`Attempt ${attempt}: Connecting to RabbitMQ...`);
            try {
                // Connect với frameMax và heartbeat
                this.connection = await amqp.connect(config.rabbitMQURI, { frameMax: 131072, heartbeat: 10 });
                this.channel = await this.connection.createChannel();

                // Declare the queue
                await this.channel.assertQueue(config.rabbitMQQueue, { durable: true });

                console.log(" RabbitMQ Connected OK!");
                this.consumeOrders();
                break;
            } catch (err) {
                console.error(` Connection failed: ${err.message}`);
                if (attempt < this.MAX_ATTEMPTS) {
                    console.log(`Retrying in ${this.RETRY_DELAY / 1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
                } else {
                    console.error("Failed to connect to RabbitMQ after maximum attempts.");
                    process.exit(1);
                }
            }
        }
    }

    async consumeOrders() {
        if (!this.channel) {
            console.error("Channel not established. Cannot consume messages.");
            return;
        }

        console.log(`Waiting for messages in queue: ${config.rabbitMQQueue}`);
        this.channel.consume(config.rabbitMQQueue, async(message) => {
            if (message === null) return;
            try {
                const orderData = JSON.parse(message.content.toString());
                console.log(" Received order:", orderData.orderId || orderData);

                const orderService = new OrderService();
                await orderService.createOrder(orderData);

                this.channel.ack(message);
                console.log(" Order processed and ACK sent");
            } catch (error) {
                console.error(" Failed to process order:", error);
                this.channel.reject(message, false); // Không requeue
            }
        });
    }

    async close() {
        try {
            if (this.channel) await this.channel.close();
            if (this.connection) await this.connection.close();
            console.log("RabbitMQ connection closed");
        } catch (err) {
            console.error("Error closing RabbitMQ connection:", err.message);
        }
    }
}

module.exports = new MessageBroker();