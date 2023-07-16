const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const mongooseDelete = require('mongoose-delete');

const Schema=mongoose.Schema;

const UserSchema=new Schema({
    _id:{type :Number},
    phone_number:{type :String,trim :true,minlength:10},
    avatar:{type :[String],default:[]},
    user_name:{type :String,trim:true,required:true},
    facebook:{type :String,default:"",},
    google:{type :String,default:""},
    roles:{type :[String],default:["USER"]},
    password:{type:String,trim:true},
    email:{type:String,default:""},
    birthday:{type:String,default:""},
    gender:{type:String,default:""},
    isVerified:{type:Boolean,default:false},
    full_name:{type:String,default:""},
    name_shop:{type:String},
    like_product:{type:[mongoose.Schema.Types.ObjectId],default:[]}
},{
    _id:false,
    timestamps:true,
})
UserSchema.plugin(AutoIncrement)
UserSchema.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,

})

module.exports =mongoose.model("users",UserSchema);