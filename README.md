# 22653661-VoNhatTruong-EProject

## Mục đích
Dự án là một hệ thống E-Commerce Microservice với nhiều service tách biệt gồm **Auth Service**, **Product Service**, **Order Service**, **API Gateway**, **MongoDB** và **RabbitMQ**.  
Mỗi service đảm nhận chức năng riêng biệt và giao tiếp thông qua RabbitMQ. Hệ thống sử dụng **JWT** để xác thực người dùng và có thể chạy hoàn toàn trên **Docker**.  
Các service đều triển khai **REST API** để client hoặc Postman có thể kiểm tra các chức năng.

---

## Chi tiết các service

### 1. Auth Service
- Quản lý đăng ký, đăng nhập và xác thực token JWT.
- Endpoint chính:
  - `POST /register` — đăng ký người dùng mới
  - `POST /login` — đăng nhập
  - `GET /dashboard` — kiểm tra JWT hợp lệ
- Xác thực token sử dụng header `x-auth-token`.
- Lưu dữ liệu người dùng trong MongoDB collection `auth`.

### 2. Product Service
- Quản lý danh sách sản phẩm, thêm mới, cập nhật và đặt mua sản phẩm.
- Endpoint chính:
  - `GET /api/products` — lấy danh sách sản phẩm
  - `POST /api/products` — thêm sản phẩm mới
  - `POST /api/products/buy` — đặt mua sản phẩm
  - `GET /api/products/id` — hiển thị hóa đơn theo ID
- JWT được gửi qua header `Authorization: Bearer`.
- Lưu dữ liệu sản phẩm trong MongoDB collection `products`.
- Khi người dùng mua sản phẩm, thông tin được gửi tới queue `orders` trong RabbitMQ.

### 3. Order Service
- Quản lý đơn hàng.
- Lắng nghe queue `orders` từ RabbitMQ, lưu trữ đơn hàng vào MongoDB collection `orders`.
- Gửi thông tin sản phẩm đã mua tới queue `products` để Product Service xử lý hiển thị đơn hàng.

### 4. API Gateway
- Điều phối toàn bộ request từ client tới các service.
- Chạy trên port 3003.
- Là điểm duy nhất client gọi, các service khác không cần lộ port ra ngoài.

---

## Công nghệ sử dụng
- **MongoDB**: lưu trữ dữ liệu người dùng, sản phẩm và đơn hàng.
- **RabbitMQ**: Message Broker cho giao tiếp giữa các service.
- **Node.js & Express.js**: triển khai REST API.
- **JWT**: xác thực người dùng.
- **Docker & Docker Compose**: container hóa và quản lý toàn bộ hệ thống.
- **Mocha & Chai**: dùng cho unit test.

---

## Cấu trúc Docker
- Mỗi service có **Dockerfile riêng**: định nghĩa base image Node.js, cài đặt dependencies, copy mã nguồn và chạy bằng `npm start`.
- **Docker Compose** cấu hình toàn bộ container, mạng nội bộ và volume cho MongoDB, đảm bảo các service kết nối dễ dàng.
- Các container:
  - `mongo`: MongoDB
  - `rabbitmq`: RabbitMQ Management
  - `auth-service`
  - `product-service`
  - `order-service`
  - `api-gateway`

---

## Cấu trúc thư mục dự án :
EProject-Phase-1/
├─ auth/
│  ├─ Dockerfile
│  ├─ src/
│  ├─ package.json
├─ product/
│  ├─ Dockerfile
│  ├─ src/
│  ├─ package.json
├─ order/
│  ├─ Dockerfile
│  ├─ src/
│  ├─ package.json
├─ api-gateway/
│  ├─ Dockerfile
│  ├─ src/
│  ├─ package.json
├─ docker-compose.yml
├─ README.md
---

## Quy trình thực hiện dự án
1. Clone repository về máy:
git clone https://github.com/Vonhattruong1812004/22653661-VoNhatTruong-EProject.git

2.	Tạo file .env cho từng service với các biến môi trường cần thiết (MONGODB_URI, JWT_SECRET, RABBITMQ_URI).
3.	Build các Docker image:
docker-compose build
4.	Khởi động toàn bộ hệ thống:
docker-compose up -d
5. Kiểm tra các API qua Postman hoặc bất kỳ client HTTP nào thông qua API Gateway:
- **Auth Service**: http://localhost:3003/auth/register, http://localhost:3003/auth/login, http://localhost:3003/auth/dashboard
- **Product Service**: http://localhost:3003/products, http://localhost:3003/products/buy, http://localhost:3003/products/id
6.	Hệ thống sẵn sàng để xử lý dữ liệu, giao tiếp qua RabbitMQ và lưu vào MongoDB. Mọi request đều đi qua API Gateway trên port 3003 nếu muốn gọi API từ client.

Ghi chú về code
	•	Mỗi service tuân theo mô hình module, tách biệt rõ ràng.
	•	Order Service và Product Service giao tiếp qua queue RabbitMQ (orders và products).
	•	Các Dockerfile đảm bảo container hóa dễ dàng, base image Node.js, copy mã nguồn và chạy bằng npm start.
	•	API Gateway quản lý routing, chỉ cần truy cập port 3003 để gọi API của các service khác.
	•	Sử dụng JWT để xác thực, token header khác nhau giữa Auth (x-auth-token) và Product/Order (Authorization: Bearer).