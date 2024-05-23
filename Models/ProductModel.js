const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    Product_name:{
        type:String,
    },
    price:{
        type:Number,
    },
    rating:{
        type:Number,
    },
    description:{
        type:String,
    },
    comment:{
        type:String,
    },
    category:{
        type:String,
    },
    images:[{
        public_id:{
            type:String,
        },
        url:{
            type:String,
        },
    }]
});

const Product = mongoose.model('Product',productSchema);

module.exports = Product;