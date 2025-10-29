// const mongoose = require('mongoose');

const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
require("dotenv").config();


chai.use(chaiHttp);
const { expect } = chai;

describe("User Authentication", () => {
  let app;

  before(async () => {
    app = new App();
    await app.connectDB();
    // app.start();
  });

  after(async () => {
    await app.authController.authService.deleteTestUsers();
    await app.disconnectDB();
    // app.stop();
  });

  describe("POST /register", () => {
    it("should register a new user", async () => {
      const res = await chai
        .request(app.app)
        .post("/register")
        .send({ username: "testuser", password: "password" });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("username", "testuser");
    });

    it("should return an error if the username is already taken", async () => {
      const res = await chai
        .request(app.app)
        .post("/register")
        .send({ username: "testuser", password: "password" });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Username already taken");
    });
  });

  describe("POST /login", () => {
    it("should return a JWT token for a valid user", async () => {
      const res = await chai
        .request(app.app)
        .post("/login")
        .send({ username: "testuser", password: "password" });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("token");
    });

    it("should return an error for an invalid user", async () => {
      const res = await chai
        .request(app.app)
        .post("/login")
        .send({ username: "invaliduser", password: "password" });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Invalid username or password");
    });

    it("should return an error for an incorrect password", async () => {
      const res = await chai
        .request(app.app)
        .post("/login")
        .send({ username: "testuser", password: "wrongpassword" });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Invalid username or password");
    });
  });

    // Thêm vào cuối file auth/src/test/authController.test.js

  describe("GET /dashboard", () => {
      let token;

      // Trước khi chạy test cho dashboard, hãy đăng nhập để lấy token
      before(async () => {
          const res = await chai
              .request(app.app)
              .post("/login")
              .send({ username: "testuser", password: "password" });
          token = res.body.token;
      });

      it("should allow access with a valid token", async () => {
          const res = await chai
              .request(app.app)
              .get("/dashboard")
              .set("authorization", `Bearer ${token}`); // Gửi token trong header

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message", "Welcome to dashboard");
      });

      it("should deny access without a token", async () => {
          const res = await chai
              .request(app.app)
              .get("/dashboard");

          // Mong đợi lỗi 401 Unauthorized vì không có token
          expect(res).to.have.status(401); 
      });

      it("should deny access with an invalid token", async () => {
          const res = await chai
              .request(app.app)
              .get("/dashboard")
              .set("authorization", "Bearer anhtailatinh"); // Một token bậy

          // Mong đợi lỗi 400 Bad Request (vì token không hợp lệ)
          expect(res).to.have.status(400); 
      });
  });
});


