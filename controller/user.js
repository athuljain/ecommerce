

// const app=express()
const jwt=require('jsonwebtoken')
const cookiParser=require('cookie-parser')
const session=require('express-session')
const productDatas=require('../model/productModel')
const validator=require('validator')
const Razorpay=require('razorpay')
const schema=require('../model/userModel')

const checkUserToken=require('../middileware/userMiddileware')


// user login

const userLogin =async (req,res)=>{
    // console.log(login.email);
    try{
        const login =await schema.findOne({email: req.body.email})
        // check user email and password
        if(login.email==req.body.email && login.password==req.body.password){
            req.session.user=login;
            const token=jwt.sign({email:login.email},'secretkey')
            res.cookie('token',token)
            res.status(200).json({message:'user logged successfully.....' })
            return
    }
        res.status(401).json({message:'wrong name or password'})   
} catch(err){
    console.log(err);
    res.status(500).json({error:'server error', error:error.message})
}
};

// user registration

const userRegister= async(req,res)=>{
    
    //validator check email as email format use in isEmail

    if(!validator.isEmail(req.body.email)){
        return res.status(400).json({error: 'Invalid email format'})
    }

    // validate password as 5 character
    if(req.body.password.length < 5){
        return res.status(400).json({error : 'Password must be at least 5 character'})
    }

    if(req.body.password !== req.body.confirmPassword){
        return res.status(400).json({error:"Password do not match"})
    }
    

    console.log(req.body);
    try{

        
            // check if email already exists in the database
            const existingUser = await schema.findOne({ email: req.body.email });
            if (existingUser) {
              return res.status(400).json({ message: "Email already exists" });
            }


    await schema.insertMany({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        userName:req.body.userName,
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword
    })
    res.status(200).json({message:'user registered successfully !!...'})
    
}catch(error){
    res.status(500).json({error : 'Server Error', error:error.message})
}
}


// user can get products details 

const getProducts= async (req,res)=>{
    try{
        const allProducts=await productDatas.find();
        res.json(allProducts);
    }catch(error){
        res.status(404).json({error:"didnt load"})
        console.log(error);
    }
}

// user can get specific product details

const specificProduct= async(req,res)=>{
try{
    console.log(req.params.id);
    const specificProduct=await productDatas.findById(req.params.id)

    if(specificProduct){
      return res.status(200).json({message:'Specific Product :', specificProduct})
    }
       return res.status(404).json({error:'product not found'})
    
}catch(error){
    console.log(error);
    res.status(500).json({message:'server error',error:error.message})
}
}

// user can get product by category wise
const getCategoryWise= async (req, res) => {
    const categoryList = req.params.category;
    try {
        let categoryProducts;
        if (categoryList.toLowerCase() === "formal") {
          categoryProducts = await productDatas.find({ category:{$in: "formal"}});
          return res.json(categoryProducts)
        } 
        if (categoryList.toLowerCase() === "casual") {
          categoryProducts = await productDatas.find({ category: { $in: "casual"} });
          return res.json(categoryProducts)
        } 
          categoryProducts = await productDatas.find({ category: { $in: categoryList } });
          return res.json(categoryProducts)
        
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error", error:error.message });
      }
    
};


// const addCart = async (req, res) => {

//     const productId = req.params.id;
//     try {
//       const product = await productDatas.findById(productId);
//       if (!product) {
//         return res.status(404).json({ error: "Product not found" });
//       }
//       const updatedUser = await schema.findOneAndUpdate(
//         { _id: req.user._id },
//         { $push: { cart: product._id } },
//         { new: true }
//       );
//     //   console.log(req.headers.cookie);
        
//       return res.json({ message: "Product added to cart", user: updatedUser });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Server error" });
//     }
//   };

// user add product to cart


const addToCart=async (req,res)=>{
    try{
        const productId = req.params.id;
        const product = await productDatas.findById(productId);
        if(!product){
            return res.status(404).json({message: 'Product not found'});
        }
        const token = req.cookies.token;
        const decoded = jwt.verify(token, 'secretkey');
        const user = await schema.findOne({email: decoded.email});

    
        // add the product to the cart
        user.cart.push(productId);
        await user.save();

        res.status(200).json({message:'Product added to cart successfully',product});
    } catch(err){
        console.log(err);
        res.status(500).json({error:'server error', error:err.message})
    }
};

// get cart product details
const cartProducts=async (req,res)=>{
    try{
        const token=req.cookies.token;
        const decoded=jwt.verify(token, 'secretkey')
        const user=await schema.findOne({email : decoded.email}).populate({
            path:'cart',
            model:'productDatas',
            select:'title description price category'
        })
        res.status(200).json({message: 'Your cart products', cart:user.cart})
    }catch(error){
        console.log(error);
        res.status(500).json({error:'Server Error',error:error.message})
    }
}

// remove cart products

const RemoveCartProduct = async (req, res) => {
    try {
      const productId = req.params.id;
      const token = req.cookies.token;
      const decoded = jwt.verify(token, 'secretkey');
  
      const user = await schema.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // find the index of the product to remove from the wishlist
      const index = user.cart.indexOf(productId);
      if (index === -1) {
        return res.status(404).json({ message: 'Product not found in Cart' });
      }
  
      // remove the product from the wishlist and save the updated user document
      user.cart.splice(index, 1);
      await user.save();
  
      res.status(200).json({ message: 'Product removed from cart successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'server error', error: error.message });
    }
  }


// product add to wish list
const addToWishList= async (req,res)=>{
    try{
        const productId=req.params.id;
        const product=await productDatas.findById(productId)
        if(!product){
            return res.status(404).json({message:'product not found'})

        }
        const token=req.cookies.token;
        const decoded=jwt.verify(token,'secretkey')
        const user= await schema.findOne({email: decoded.email})

        user.wishList.push(productId)
        await user.save()
        res.status(200).json({message:'Product added to wish list successfully',product})
    }catch(err){
        console.log(err);
        res.status(500).json({error:'server error',error:err.message})
    }
}

// get wish list product
const wishListProducts=async (req,res)=>{
    try{
        const token=req.cookies.token;
        const decoded=jwt.verify(token, 'secretkey')
        const user=await schema.findOne({email : decoded.email}).populate({
            path:'wishList',
            model:'productDatas',
            select:'title description price category'
        })
        res.status(200).json({message: 'Your Wish List Products', wishList:user.wishList})
    }catch(error){
        console.log(error);
        res.status(500).json({error:'Server Error',error:error.message})
    }
}

// prodcut remove from wishlist
const RemoveWishlist = async (req, res) => {
    try {
      const productId = req.params.id;
      const token = req.cookies.token;
      const decoded = jwt.verify(token, 'secretkey');
  
      const user = await schema.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // find the index of the product to remove from the wishlist
      const index = user.wishList.indexOf(productId);
      if (index === -1) {
        return res.status(404).json({ message: 'Product not found in wishlist' });
      }
  
      // remove the product from the wishlist and save the updated user document
      user.wishList.splice(index, 1);
      await user.save();
  
      res.status(200).json({ message: 'Product removed from wishlist successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'server error', error: error.message });
    }
  }
  


// user order product
const oderProduct= async(req,res)=>{
    try{
        const productID=req.params.id;
        const product=await productDatas.findById(productID)
        if(!product){
            return res.status(404).json({message:'product not found'})
        }
        const token=req.cookies.token;
        const decoded=jwt.verify(token,'secretkey')
        const user=await schema.findOne({email: decoded.email})
        
        const orderDate= new Date()
        const {price}=product;

        if (price !== req.body.price) {
            return res
              .status(400)
              .json({ message: "The entered price does not match the product price" });
          }


        const instance=new Razorpay({key_id:"rzp_test_0LUKufjaMK2vf1",key_secret:"ZiRr7BkM06hjOw8sx5V3tT7Q"})
        
        const order=await instance.orders.create({
            amount:price*100,
            currency:"INR",
            receipt:'Receipt#1'
        })

        user.orders.push({
            product: productID,
            orderId: order.id,
            payment:price,
            orderDate
        })  
        await user.save()
        res.status(200).json({message:'payment successful!...  Order confirmed...',product})
    }catch(error){
        console.log(error);
        res.status(500).json({error:'server error',error:error.message})
    }
}

// get order products

const getOrderProduct=async(req,res)=>{
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, 'secretkey');
        const user = await schema.findOne({ email: decoded.email }).populate('orders.product');
    
        res.status(200).json({ orders: user.orders });
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'server error', error: error.message });
      }

}




  

module.exports={
    userLogin,
    userRegister,
    getProducts,
    specificProduct,
    getCategoryWise,
    addToCart,
    addToWishList,
    cartProducts,
    wishListProducts,
    oderProduct,
    getOrderProduct,
    RemoveWishlist,
    RemoveCartProduct

}

