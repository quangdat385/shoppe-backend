const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');


const Schema=mongoose.Schema;

const Vourcher=new Schema({
    list_products:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"products",
        default:[]
    },
    user:{
        type:Number,
        required:true,
        ref:"users"
    },
    user_update:{
        type:Number,
        ref:"users"
    },
    type_of_vourcher:{
        type:String,
        required:true,
    },
    day_from:{
        type:Date, 
        required:true
    },
    day_to:{
        type:Date, 
        required:true
    },
    type_of_save :{
        type:String,
        required:true,
    },
    sale_off:{
        type :Number,
        required:true,
    },
    minimum_order:{
        type:Object,
        required:true
    },
    test:{type:Boolean,default:false}
},{
    timestamps:true,
});


Vourcher.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,

})



module.exports =mongoose.model("vourchers",Vourcher)