# Dự án Microservices E-commerce Cơ bản

Dự án minh họa kiến trúc **microservices** bằng Node.js, Express, MongoDB, và RabbitMQ, kèm **CI/CD** với GitHub Actions và Docker.

---

## Giới thiệu

Hệ thống mô phỏng **e-commerce microservices**:

- **Auth Service**: Quản lý đăng ký, đăng nhập, xác thực JWT.  
- **Product Service**: Quản lý sản phẩm (tạo, xem danh sách, chi tiết) và khởi tạo quy trình đặt hàng.  
- **Order Service**: Xử lý và lưu trữ đơn hàng, gửi thông báo xác nhận.  
- **API Gateway**: Cổng vào duy nhất, định tuyến request tới các service tương ứng.  

**Giao tiếp giữa Product và Order Service** sử dụng RabbitMQ để xử lý bất đồng bộ, tăng khả năng phục hồi.

---

## Công nghệ sử dụng

- **Backend**: Node.js, Express.js  
- **Database**: MongoDB (Mongoose)  
- **Message Broker**: RabbitMQ (amqplib)  
- **Authentication**: JWT, bcryptjs  
- **Containerization**: Docker, Docker Compose  
- **CI/CD**: GitHub Actions  
- **Testing**: Mocha, Chai  
- **Linting**: ESLint  

---

## Bắt đầu

### Yêu cầu

- Docker: [Cài đặt Docker](https://docs.docker.com/get-docker/)  
- Docker Compose: Thường có sẵn trong Docker Desktop  

### Clone repository


git clone <your-repository-url>
cd <your-repository-name>

### Tạo file .env cho từng service
auth/.env :
MONGODB_AUTH_URI=mongodb://mongodb:27017/auth_service
JWT_SECRET=secret
RABBITMQ_URI=amqp://guest:guest@rabbitmq:5672
product/.env:
MONGODB_PRODUCT_URI=mongodb://mongodb:27017/products
JWT_SECRET=secret
RABBITMQ_URI=amqp://guest:guest@rabbitmq:5672
order/.env:
MONGODB_ORDER_URI=mongodb://mongodb:27017/order_service
JWT_SECRET=secret
RABBITMQ_URI=amqp://guest:guest@rabbitmq:5672
api-gateway/.env:
	•	Không cần biến môi trường đặc biệt, tùy cấu hình nếu cần.

### Khởi chạy hệ thống 
docker-compose up -d --build
	•	API Gateway: http://localhost:3003
	•	Hostnames nội bộ Docker: auth_service, product_service, order_service, mongodb, rabbitmq
### Chạy Tests (Docker) :
# Auth Service
docker exec -it auth_service npm test

# Product Service
docker exec -it product_service npm test

# Order Service
docker exec -it order_service npm test
### Quy trình CI/CD (GitHub Actions)
	•	Trigger: push hoặc pull request vào nhánh main.
	•	Job test:
	1.	Khởi động MongoDB & RabbitMQ bằng Docker.
	2.	Cài đặt dependencies (npm ci) & chạy tests cho auth và order.
	3.	Chạy auth & order service nền.
	4.	Chạy integration test cho product (bao gồm RabbitMQ).
	5.	Chạy ESLint kiểm tra code style.
	•	Job build-docker:
	1.	Đăng nhập Docker Hub.
	2.	Build & push Docker image cho từng service (auth, product, order, api-gateway).

### API Endpoints (qua API Gateway - http://localhost:3003)

Auth Service
	•	POST /auth/register - Đăng ký: { "username": "...", "password": "..." }
	•	POST /auth/login - Đăng nhập: { "username": "...", "password": "..." }
	•	GET /auth/dashboard - Ví dụ endpoint cần JWT: Header Authorization: Bearer <token>

Product Service
	•	POST /products - Tạo sản phẩm: Header Authorization: Bearer <token>, Body { "name": "...", "price": ..., "description": "..." }
	•	GET /products - Lấy danh sách sản phẩm: Header Authorization: Bearer <token>
	•	GET /products/:id - Lấy chi tiết sản phẩm: Header Authorization: Bearer <token>
	•	POST /products/buy - Đặt hàng: Header Authorization: Bearer <token>, Body { "ids": ["productId1", "productId2"] }
	•	GET /products/buy/:orderId - Lấy trạng thái đơn hàng: Header Authorization: Bearer <token>

Tiền tố /auth, /products có thể thay đổi tùy cấu hình API Gateway.

Kết quả Minh họa (Postman)

Dưới đây là hình ảnh minh họa kết quả thực hiện các API endpoint chính bằng Postman:

1. Đăng ký tài khoản (/auth/register)
![Register](./public/results/dangky.png)

2. Đăng nhập (/auth/login)
![Login](./public/results/dangnhap.png)

3. Truy cập Dashboard (Cần Token) (/auth/dashboard)
![Dashboard](./public/results/dashboard.png)

4. Thêm sản phẩm mới (/products)
![add_sp](./public/results/themsp.png)

5. Xem danh sách sản phẩm (/products)
![all_sp](./public/results/xemsp.png)

6. Xem chi tiết sản phẩm bằng ID (/products/:id)
![id_sp](./public/results/xemsp_id.png)

7. Đặt hàng (/products/buy)
![dathang](./public/results/dathang.png)

8. Xem trạng thái đơn hàng (/products/buy/:orderId)
![id_donhang](./public/results/xemhoadon.png)