Node.js E-Commerce Microservice Project

Dự án là một hệ thống E-Commerce Microservice với nhiều service tách biệt gồm Auth Service, Product Service, Order Service, API Gateway, MongoDB và RabbitMQ. Mỗi service đảm nhận chức năng riêng biệt và giao tiếp thông qua RabbitMQ. Hệ thống sử dụng JWT để xác thực người dùng và có thể chạy hoàn toàn trên Docker. Các service đều triển khai REST API để client hoặc Postman có thể kiểm tra các chức năng.

Auth Service quản lý đăng ký, đăng nhập và xác thực token JWT. Các endpoint chính bao gồm POST /register để đăng ký người dùng mới, POST /login để đăng nhập và GET /dashboard để kiểm tra JWT hợp lệ. Xác thực token sử dụng header x-auth-token.

Product Service quản lý danh sách sản phẩm, thêm mới, cập nhật và đặt mua sản phẩm. Các endpoint chính bao gồm GET /api/products để lấy danh sách sản phẩm, POST /api/products để thêm sản phẩm mới, POST /api/products/buy để đặt mua sản phẩm, và GET /api/products/id để hiển thị hóa đơn theo ID. JWT được gửi qua header Authorization: Bearer .

Order Service quản lý đơn hàng, lắng nghe queue orders từ RabbitMQ, lưu trữ đơn hàng vào MongoDB và gửi thông tin sản phẩm đã mua tới queue products để các service khác sử dụng.

API Gateway điều phối toàn bộ request từ client tới các service, chạy trên port 3003.

Hệ thống sử dụng MongoDB để lưu trữ dữ liệu của các service, RabbitMQ làm Message Broker cho giao tiếp giữa các service, Node.js và Express.js để xây dựng API. Mỗi service có Dockerfile riêng, định nghĩa base image Node.js, cài đặt dependencies, copy mã nguồn và chạy bằng npm start. Docker Compose được dùng để cấu hình tất cả container, mạng nội bộ và volume cho MongoDB, đảm bảo các service có thể kết nối với nhau dễ dàng.

Quy trình thực hiện dự án bắt đầu từ việc clone repository về máy và tạo file .env với các biến môi trường cần thiết bao gồm MONGODB_ORDER_URI, JWT_SECRET, và RABBITMQ_URI. Sau đó, tạo Dockerfile cho từng service gồm Auth Service, Product Service, Order Service và API Gateway với cấu trúc base image Node.js, WORKDIR /app, copy package.json, chạy npm install, copy toàn bộ source code và CMD [“npm”, “start”]. Tiếp theo, viết Docker Compose file docker-compose.yml định nghĩa các service, container_name, ports, volumes, network, MongoDB volume persist, RabbitMQ ports 5672 và 15672, đồng thời khai báo các service phụ thuộc nhau bằng depends_on.

Sau khi hoàn tất cấu hình, toàn bộ hệ thống được build và chạy trên Docker bằng lệnh docker compose up -d –build. Kiểm tra các container đang chạy bằng docker ps, và nếu cần dừng toàn bộ hệ thống có thể dùng docker compose down hoặc docker stop $(docker ps -aq) && docker rm $(docker ps -aq).

Các API có thể test trực tiếp bằng Postman, bao gồm Auth Service với POST http://localhost:3000/register, POST http://localhost:3000/login và GET http://localhost:3000/dashboard, Product Service với GET http://localhost:3001/api/products, POST http://localhost:3001/api/products, POST http://localhost:3001/api/products/buy và GET http://localhost:3001/api/products/id. Order Service tự động nhận message từ queue orders và lưu vào MongoDB.

Lưu ý là các file .env, node_modules và .DS_Store không nên commit vào Git. Nếu gặp lỗi port chiếm dụng như EADDRINUSE, cần dừng container cũ hoặc đổi port. Khi chạy lần đầu, việc build image có thể mất thời gian do pull base image Node.js và RabbitMQ. Mỗi service kết nối MongoDB và RabbitMQ thông qua network Docker Compose, đảm bảo hệ thống chạy mượt mà và đồng bộ.