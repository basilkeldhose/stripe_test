const mongoose =require('mongoose')

const sellerschema =new mongoose.Schema({
    name:String,
    email:String,
    description:String
 
})

mongoose.model('sellers',sellerschema);