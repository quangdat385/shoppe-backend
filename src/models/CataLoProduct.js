const mongoose = require('mongoose');

const mongooseDelete = require('mongoose-delete');


const Schema=mongoose.Schema;

const CataloProduct=new Schema({
    user:{type: Number,required:true,ref:"users"},
    type_of_product:{type:String,required:true,},
    details:{type:String,default:""},
    listProduct:{type:[mongoose.Schema.Types.ObjectId],default:[]},
    
},{
    timestamps:true,
});

CataloProduct.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,

});

module.exports =mongoose.model("catalory",CataloProduct);