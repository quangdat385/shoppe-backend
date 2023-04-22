const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');


const Schema=mongoose.Schema;

const UserCart=new Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"product"
    },
    user:{
        type:Number,
        required:true,
        ref:"users"
    },
    quality:{
        type:Number,
        default:0
    },
    status:{
        type:String, 
        default:"waiting",
    }

},{
    timestamps:true,
});

UserCart.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,

})



module.exports =mongoose.model("usercart",UserCart)