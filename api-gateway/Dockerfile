FROM node:20-alpine
RUN apk add --no-cache make gcc g++ python3
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3003
CMD ["npm", "start"]