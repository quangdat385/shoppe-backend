const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const ProductDetails=new Schema({
    productId:{type: mongoose.Schema.Types.ObjectId,required:true,ref:"products"},
    color:{type: [String],default:[]},
    size:{type: [String],default:[]},
    deliver_fee:{type: Number,required:true},
    give_money_back:{type: Boolean,default:false},
    detail_gmb:{type: Number},
    material:{type: String},
    styles:{type: String},
    origin:{type: String,required:true},
    season:{type: String},
    samples:{type: String},
    croptop:{type:Boolean,default:false},
    warehouse:{type:String,required:true},
    comefrom:{type:String},
    details:{type:String},
    description:{type:String},
    retun_polici:{type:String},
    end_dow:{type:String},
    hashtag:{type:String}
},{
    timestamps:true,
    
});



module.exports =mongoose.model("productdetails",ProductDetails);