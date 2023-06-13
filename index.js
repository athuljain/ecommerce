const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const app = express();

dotenv.config();

//const route = express.Router();

mongoose
  .connect("mongodb://127.0.0.1:27017/EcommerceDB")
  .then(() => {
    console.log("data base connect");
  })
  .catch(() => {
    console.log("connection failed");
  });

app.use(cookieParser());

// for admin routes
const adminRoute = require("./routes/adminRoute");
app.use("/api/admin", adminRoute);

//for user route

const userRoute = require("./routes/userRoute");
app.use("/api/users", userRoute);

app.listen(3001, () => {
  console.log("server connectec at 3001");
});
