# Sử dụng Node 20 Alpine
FROM node:20-alpine

# Cài build tools để compile native modules
RUN apk add --no-cache make gcc g++ python3

# Set working directory
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Mở port
EXPOSE 3000

# Chạy app
CMD ["npm", "start"]