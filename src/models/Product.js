const mongoose = require('mongoose');

const mongooseDelete = require('mongoose-delete');

const Schema=mongoose.Schema;

const ProductSchema=new Schema({

    rate:{type: Number,default:3},
    product_id:{type: String},
    user:{type: Number,required:true,default:1},
    quality:{type:Number,default:0},
    sold:{type:Number,default:0},
    title:{type: String,default:""},
    description:{type: String,default:""},
    img_product:{type: Array},
    sale_off:{type: String},
    ship:{type: String,default:""},
    date_off:{type: String},
    label:{type: Array,default:["#ShopxuHuong","#ShopDacBiet"]},
    label_id:{type:Number,default:1},
    produc_detail:{type: String},
    voucher:{type:String,default:""},
    type_product:{type:Array,},
    size:{type:String,default:"FREESIZE"},
    color:{type:Array},
},{
    timestamps:true,
});

ProductSchema.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,

})



module.exports =mongoose.model("product",ProductSchema)