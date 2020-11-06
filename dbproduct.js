const mongoose =require("mongoose")

const productSchema= new mongoose.Schema({
    name:String,
    price:Number,
    image_URL:String
})
mongoose.model('products', productSchema)