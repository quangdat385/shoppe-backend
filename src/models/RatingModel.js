const mongoose = require('mongoose');




const Schema=mongoose.Schema;

const RatingSchema=new Schema({
    usersRating:[new Schema({userId:Number,rate:Number},{_id:false})],
    productId:{type: mongoose.Schema.Types.ObjectId,required:true,ref:"products"},
    fiveStar:{type: Number,default:0,min:0},
    fourStar:{type: Number,default:0,min:0},
    threeStar:{type: Number,default:0,min:0},
    twoStar:{type: Number,default:0,min:0},
    oneStar:{type: Number,default:0,min:0},
    totalStar:{type: Number,default:0,min:0},
    rating:{type: Number,default:0,min:0,max:5},
},{
    timestamps:true,
    
    
});



module.exports =mongoose.model("rating",RatingSchema);