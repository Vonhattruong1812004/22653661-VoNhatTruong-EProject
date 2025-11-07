const express = require("express");
const ProductController = require("../controllers/productController");
const isAuthenticated = require("../utils/isAuthenticated");

const router = express.Router();
// Tạo một instance duy nhất của Controller
const productController = new ProductController();

// Tất cả các route đều dùng chung instance này
router.post("/", isAuthenticated, productController.createProduct);
router.get("/", isAuthenticated, productController.getProducts);
router.get("/:id", isAuthenticated, productController.getId);


// Các route liên quan đến việc mua hàng
router.post("/buy", isAuthenticated, productController.createOrder);
router.get("/buy/:orderId", isAuthenticated, productController.getOrderStatus);

// THAY ĐỔI QUAN TRỌNG: Export cả router và controller instance
module.exports = { router, productController };