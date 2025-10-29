require("dotenv").config();
const App = require("./src/app");

async function startServer() {
    const app = new App();
    await app.init(); // Chờ khởi tạo xong
    app.start(); // Mới bắt đầu chạy
}

startServer();