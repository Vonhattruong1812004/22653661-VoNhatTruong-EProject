require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const authMiddleware = require("./middlewares/authMiddleware");
const AuthController = require("./controllers/authController");

class App {
    constructor() {
        this.app = express();
        this.authController = new AuthController();
        this.setMiddlewares();
        this.setRoutes();
    }

    // --- THÊM MỚI ---
    // Di chuyển các tác vụ bất đồng bộ vào hàm init()
    async init() {
        try {
            await this.connectDB();
        } catch (error) {
            console.error("Auth Service: Failed to initialize application:", error);
            process.exit(1);
        }
    }

    async connectDB() {
        await mongoose.connect(config.mongoURI);
        console.log("Auth Service: MongoDB connected");
    }

    async disconnectDB() {
        await mongoose.disconnect();
        console.log("Auth Service: MongoDB disconnected");
    }

    setMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
    }

    setRoutes() {
        this.app.post("/login", (req, res) => this.authController.login(req, res));
        this.app.post("/register", (req, res) => this.authController.register(req, res));
        this.app.get("/dashboard", authMiddleware, (req, res) => res.json({ message: "Welcome to dashboard" }));
    }

    start() {
        this.server = this.app.listen(3000, () => console.log("Auth Service started on port 3000"));
    }

    async stop() {
        if (this.server) {
            this.server.close();
        }
        await this.disconnectDB();
        console.log("Auth Service stopped");
    }
}

module.exports = App;