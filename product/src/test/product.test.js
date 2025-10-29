const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();

chai.use(chaiHttp);


describe("Products", () => {
    let app;

    before(async function() {
        app = new App();
        await Promise.all([app.connectDB(), app.setupMessageBroker()]);
        this.timeout(40000);

        const authBase = process.env.AUTH_SERVICE || "http://auth_service:3000";

        // Ensure test user exists on auth service (ignore if already created)
        try {
            await chai
                .request(authBase)
                .post('/register')
                .send({ username: process.env.LOGIN_TEST_USER || 'testuser', password: process.env.LOGIN_TEST_PASSWORD || 'password' });
        } catch (e) {
            // ignore registration failures (e.g. username already taken)
        }

        // Authenticate with the auth microservice to get a token
        const authRes = await chai
            .request(authBase)
            .post('/login')
            .send({ username: process.env.LOGIN_TEST_USER || 'testuser', password: process.env.LOGIN_TEST_PASSWORD || 'password' });

        authToken = authRes.body.token;
        console.log('AUTH TOKEN:', authToken);
        // app.start();
    });

    after(async() => {
        await app.disconnectDB();
        // app.stop();
    });

    describe("POST /products", () => {
        it("should create a new product", async() => {
            const product = {
                name: "Product 1",
                description: "Description of Product 1",
                price: 10,
            };
            const res = await chai
                .request("http://api_gateway:3003/products")
                .post("/")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Product 1",
                    price: 10,
                    description: "Description of Product 1"
                });


            createdProductId = res.body._id;
            expect(res).to.have.status(201);
            expect(res.body).to.have.property("_id");
            expect(res.body).to.have.property("name", product.name);

            expect(res.body).to.have.property("price", product.price);
        });

        it("should return an error if name is missing", async() => {
            const product = {
                description: "Description of Product 1",
                price: 10.99,
            };
            const res = await chai
                .request("http://api_gateway:3003/products")
                .post("/")
                .set("Authorization", `Bearer ${authToken}`)
                .send(product);

            expect(res).to.have.status(400);
        });
    });

    describe("GET /products", () => {
        it("should return a list of products", async() => {
            const res = await chai
                .request("http://api_gateway:3003/products")
                .get("/")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res).to.have.status(200);
        });
    });

    describe("POST /products/buy", () => {
        const product_url = "http://api_gateway:3003/products";
        it("Buy comleted", async() => {
            const res = await chai
                .request(product_url)
                .post("/buy")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    ids: [createdProductId]
                });

            expect(res).to.have.status(201);
            expect(res.body.status).to.equal("completed");
        });
    });


});