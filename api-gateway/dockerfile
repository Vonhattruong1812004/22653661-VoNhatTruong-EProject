# Sử dụng Node.js phiên bản nhẹ
FROM node:22.14.0-alpine

# Chỉ định thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép file package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt thư viện cần thiết
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Lệnh chạy app khi container khởi động
CMD ["node", "index.js"]
