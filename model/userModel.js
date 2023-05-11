const mongoose=require('mongoose')




const mongoSchema= new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true 
    },
    userName:{
        type:String,
        required:true 
    },
    email:{
        type:String,
        required:true 
    },
    password:{
        type:String,
        required:true 
    },
    confirmPassword:{
        type:String,
        required:true
    },
    cart:[{
        type:String,
        required:false
    }],
    wishList:[{
        type:String,
        required:false
    }],
    orders:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'productDatas'
        },
        orderId:{
            type:String,

        },
        
        payment:{
            type:Number
        },
        orderDate:{
            type:Date,
            default:Date.now
        }
        
        
    }]
})

module.exports=mongoose.model("UserData",mongoSchema)

