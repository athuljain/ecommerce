const express = require("express");
const bodyparser = require("body-parser");
// const cookieParser=require('cookie-parser')
const app = express();

const admin = require("../controller/admin");
const checkAdminToken = require("../middileware/adminMiddileware");

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.post("/login", admin.adminLogin);
app.post("/products", checkAdminToken, admin.createProduct);
app.get("/users", checkAdminToken, admin.getUsers);
app.get("/users/:id", checkAdminToken, admin.getSpecificUser);
app.get("/products", checkAdminToken, admin.getProducts);
app.put("/products/:id", checkAdminToken, admin.updateProduct);
app.delete("/products/:id", checkAdminToken, admin.deleteProduct);
app.get("/products/category/:category", checkAdminToken, admin.getCategoryWise);
app.get("/products/:id", checkAdminToken, admin.getSpecificProduct);
app.get("/order", checkAdminToken, admin.getAllOrders);
app.get("/revenue", checkAdminToken, admin.getRevenue);

module.exports = app;
