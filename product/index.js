require("dotenv").config();
const App = require("./src/app");

// SỬA ĐỔI: Bọc trong hàm async để dùng await
async function startServer() {
    const app = new App();
    await app.init(); // Chờ cho việc khởi tạo (kết nối DB, RabbitMQ) hoàn tất
    app.start(); // Sau đó mới bắt đầu lắng nghe request
}

// Gọi hàm để khởi động server
startServer();