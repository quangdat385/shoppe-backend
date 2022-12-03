const mongoose = require('mongoose');

const mongooseDelete = require('mongoose-delete');

const Schema=mongoose.Schema;

const ProductSchema=new Schema({

    rate:{type: Number,default:3},
    product_id:{type: String},
    user:{type: Number,required:true,default:1},
    quality:{type:Number},
    sold:{type:Number,default:0},
    title:{type: String,default:""},
    description:{type: String,default:""},
    img_product:{type: Array},
    sale_off:{type: String},
    ship:{type: Boolean,default:false},
    date_off:{type: String},
    label:{type: Array,default:["#ShopxuHuong","#ShopDacBiet"]},
    label_id:{type:Number,default:1},
    produc_detail:{type: Object},
    voucher:{type:Number,default:0},
    type_product:{type:String,},
    size:{type:String,default:"FREESIZE"},
    color:{type:String,default:""},
},{
    timestamps:true,
});

ProductSchema.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,

})



module.exports =mongoose.model("product",ProductSchema)