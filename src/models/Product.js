const mongoose = require('mongoose');

const mongooseDelete = require('mongoose-delete');

const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema=mongoose.Schema;

const ProductSchema=new Schema({
    user:{type: Number,required:true,default:1,ref:"users"},
    quality:{type:Number,default:0},
    sold:{type:Number,default:0},
    title:{type: String,default:""},
    description:{type: String,default:""},
    img_product:{type: Array},
    sale_off:{type: String},
    ship:{type: String,default:""},
    ship_label:{type: String,default:""},
    date_off:{type: Date},
    label:{type: Array,default:["#ShopxuHuong","#ShopDacBiet"]},
    label_id:{type:Number,default:1},
    discount_stick:{type:String,default:""},
    price:{type:String,default:""},
    place:{type:String,default:""},
    numberical:{type:Number},
    likes:{type:Number,default:0},
    cataloryId:{ type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"catalories"},
    rateId:{ type:mongoose.Schema.Types.ObjectId,
}
    
},{
    timestamps:true,
});
ProductSchema.plugin(AutoIncrement, 
    {id: 'numberical_product', inc_field: 'numberical',start_seq:1 }
);
ProductSchema.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,

})



module.exports =mongoose.model("product",ProductSchema)