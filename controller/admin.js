const express = require("express");

//const app =express()
const jwt = require("jsonwebtoken");
const schema = require("../model/userModel");
const productDatas = require("../model/productModel");

const checkAdminToken = require("../middileware/adminMiddileware");

// admin login

const adminLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // check admin email and password
    if (email !== "admin@gmail.com" || password !== "admin123") {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    res.cookie("token", token);
    res.setHeader("Authorization", token); //  token response to headers

    res.json({ message: "Welcome, Admin!", token });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

// create product

const createProduct = async (req, res) => {
  try {
    await productDatas.insertMany([
      {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        image: req.body.image,
        category: req.body.category,
      },
    ]);
    res.status(201).json({ message: "Product created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create product", error: error.message });
  }
};

// get users details

const getUsers = async (req, res) => {
  try {
    const allUsers = await schema.find();
    res.status(200).json({ users: allUsers });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
};

// get specific user
const getSpecificUser = async (req, res) => {
  try {
    const specificUser = await schema.findById(req.params.id);
    if (!specificUser) {
      res.status(404).json({ message: "User not found", error: error.message });
      return;
    }
    res.status(200).json({ message: "Specific User :", specificUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// find all product details

const getProducts = async (req, res) => {
  try {
    const allProducts = await productDatas.find();
    res.status(200).json({ message: "All Product List", allProducts });
  } catch (error) {
    res
      .status(404)
      .json({ message: "All Product List Not Found: ", error: error.message });
    console.log(error);
  }
};

const getSpecificProduct = async (req, res) => {
  try {
    const specificProduct = await productDatas.findById(req.params.id);
    if (!specificProduct) {
      res
        .status(404)
        .json({ message: "Specific Product not Found", error: error.message });
      return;
    }
    res
      .status(200)
      .json({ message: "Specific Product details:", specificProduct });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// update product

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, price, image, category } = req.body;

    const updatedProduct = await productDatas.findOneAndUpdate(
      { _id: id },
      { title, description, price, image, category }
    );
    // console.log(updatedProduct)
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product updated", updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
};

// delete product by id

const deleteProduct = async (req, res) => {
  const id = req.params.id;
  console.log(req.params.id);
  try {
    const deletedProduct = await productDatas.deleteOne({ _id: id });
    console.log(deletedProduct);
    if (deletedProduct) {
      res
        .status(200)
        .json({ message: "Product deleted", product: deletedProduct });
      return;
    }
    res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// find category wise

const getCategoryWise = async (req, res) => {
  const categoryList = req.params.category;
  // console.log( 'fgfgfg')

  try {
    let categoryProducts;
    // seperate if conditions
    if (categoryList.toLowerCase() === "formal") {
      categoryProducts = await productDatas.find({
        category: { $in: "formal" },
      });
      res.json(categoryProducts);
      return;
    }
    if (categoryList.toLowerCase() === "casual") {
      categoryProducts = await productDatas.find({
        category: { $in: "casual" },
      });
      res.json(categoryProducts);
      return;
    }
    categoryProducts = await productDatas.find({
      category: { $in: categoryList },
    });
    res.json(categoryProducts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message, message: "Server Error" });
  }
};

// get all orders list

const getAllOrders = async (req, res) => {
  try {
    const orders = await schema.find({}, { orders: 1 });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: "Server Error", error: error.message });
  }
};

// get revenue
const getRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query; //using for filtering date
    const users = await schema.find();
    let totalAmount = 0;
    let revenue = 0;

    users.forEach((user) => {
      user.orders.forEach((order) => {
        if (
          order.orderDate >= new Date(startDate) &&
          order.orderDate <= new Date(endDate)
        ) {
          totalAmount += order.payment;
          revenue += order.payment * 0.2;
        }
      });
    });
    res
      .status(200)
      .json({ message: "total orders amount & revenue", totalAmount, revenue });
  } catch (error) {
    res.status(500).json({ error: "server Error", error: error.message });
  }
};

module.exports = {
  adminLogin,
  createProduct,
  getUsers,
  getSpecificUser,
  getProducts,
  updateProduct,
  deleteProduct,
  getCategoryWise,
  getSpecificProduct,
  getAllOrders,
  getRevenue,
};
