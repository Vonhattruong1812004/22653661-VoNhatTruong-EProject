const Product = require("../models/product");
const messageBroker = require("../utils/messageBroker");
const uuid = require('uuid');

const mongoose = require("mongoose");

class ProductController {
    constructor() {
        this.createOrder = this.createOrder.bind(this);
        this.getOrderStatus = this.getOrderStatus.bind(this);
        this.ordersMap = new Map();
    }

    /**
     * This method is called ONLY ONCE when the application starts.
     * It creates a single consumer to listen for completion messages from the order-service.
     */
    listenForOrderCompletion() {
        console.log("Product Controller is now listening for 'products' queue...");
        messageBroker.consumeMessage("products", (orderData) => {
            try {
                if (!orderData || !orderData.orderId) {
                    console.warn("Received invalid message from 'products' queue:", orderData);
                    return;
                }
                const { orderId } = orderData;
                const order = this.ordersMap.get(orderId);
                if (order) {
                    // Update the order status and its data in the temporary map
                    this.ordersMap.set(orderId, {...order, ...orderData, status: 'completed' });
                    console.log(`Order ${orderId} status updated to 'completed'.`);
                }
            } catch (error) {
                console.error("Error processing message from 'products' queue:", error);
            }
        });
    }

    async createProduct(req, res, _next) {
        try {
            const product = new Product(req.body);
            const validationError = product.validateSync();
            if (validationError) {
                return res.status(400).json({ message: validationError.message });
            }
            await product.save();
            res.status(201).json(product);
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    async createOrder(req, res, _next) {
        try {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: "Product IDs are required." });
            }

            const products = await Product.find({ _id: { $in: ids } });
            if (products.length !== ids.length) {
                return res.status(404).json({ message: "One or more products not found." });
            }

            const orderId = uuid.v4();

            // Store the initial state of the order
            this.ordersMap.set(orderId, {
                status: "pending",
                products,
                username: req.user.username
            });

            // Publish the message to the order-service
            await messageBroker.publishMessage("orders", {
                products,
                username: req.user.username,
                orderId,
            });

            // Start the long-polling process to wait for the result
            const startTime = Date.now();
            const timeout = 30000; // 30 seconds timeout

            let order = this.ordersMap.get(orderId);
            while (order && order.status !== 'completed' && (Date.now() - startTime < timeout)) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
                order = this.ordersMap.get(orderId);
            }

            // // Delete the order from the map after processing to save memory => phần này không cần xóa nên bỏ qua
            // this.ordersMap.delete(orderId);


            if (!order || order.status !== 'completed') {
                console.log(`Order ${orderId} timed out.`);
                return res.status(408).json({ message: "Order processing timed out." });
            }

            return res.status(201).json(order);
        } catch (error) {
            console.error("Error creating order:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    async getOrderStatus(req, res, _next) {
        const { orderId } = req.params;
        const order = this.ordersMap.get(orderId);
        if (!order) {
            // If not in map, it might have been completed and deleted, or never existed.
            return res.status(404).json({ message: 'Order not found or already completed.' });
        }
        return res.status(200).json(order);
    }

    async getProducts(req, res, _next) {
        try {
            const products = await Product.find({});
            res.status(200).json(products);
        } catch (error) {
            console.error("Error getting products:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    //phần 8: phần thêm vào đây nè xem san pham = id
    async getid(req, res) {
        const product = await Product.findById(req.params.id);

        res.status(200).json(product);
    }


    // async getProductById(req, res) {
    // const product = await Product.findById(req.params.id);

    // if(!product){
    //   return res.status(404).json({message: "product not found"});
    // }

    // res.status(200).json(product);
    // }


    // async getProductById(req, res) {
    //   try {
    //     const product = await Product.findById(req.params.id);
    //     if(!product){
    //       return res.status(404).json({message: "product not found"});
    //     } 
    //     res.status(200).json(product);
    //   } catch (err) {
    //     return res.status(400).json({ message: "Invalid product ID format" });
    //   }
    // }

}

module.exports = ProductController;