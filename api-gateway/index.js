const express = require("express");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer();
const app = express();

app.use("/auth", (req, res) => {
    proxy.web(req, res, { target: "http://auth:3000" });
});

app.use("/products", (req, res) => {
    proxy.web(req, res, { target: "http://product:3001" });
});

app.use("/orders", (req, res) => {
    proxy.web(req, res, { target: "http://order:3002" });
});

const port = process.env.PORT || 3003;
app.listen(port, () => console.log(`API Gateway listening on port ${port}`));