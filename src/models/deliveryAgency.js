const mongoose = require('mongoose');




const Schema=mongoose.Schema;

const DeliveryAgency=new Schema({
    details_productId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"productdetails"},
    agency:{type:Array,default:[
        {
            type_of:"Tiết Kiệm",
            fee:22000
        },
        {
            type_of:"Nhanh",
            fee:35000
        },
        {
            type_of:"Hỏa Tốc",
            fee:70000
        },
    ]},
    more_details:{type:String,default:"Tiết Kiệm",},
    name_deliver_agency:{type:String},
    user:{
        type:Number,
        ref:"users",
        default:1
    },
    user_update:{
        type:Number,
        ref:"users"
    }

},{
    timestamps:true,
});



module.exports =mongoose.model("delivers",DeliveryAgency);