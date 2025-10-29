require("dotenv").config();
const App = require("./src/app");

// --- ĐÃ SỬA ---
// Bọc trong hàm async để đảm bảo init() chạy xong trước khi start()
async function startServer() {
    const app = new App();
    await app.init(); // Chờ kết nối DB xong
    app.start(); // Mới bắt đầu nhận request
}

startServer();