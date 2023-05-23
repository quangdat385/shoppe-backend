const Users=require('../models/Users');
const Product=require('../models/Product');
const Rating=require('../models/RatingModel');
const countRading= require('../middleware/counRating')


class RatingController {
    async show(req, res, next){
        Rating.find({}).lean()
        .then(rating => {
            if(rating.length){
                
                res.status(200).json(rating)
            }else{
                res.status(400).json({message:"Not Found Rating"})
            }
            
        })
        .catch(next)
    }
    async create(req, res, next){
        const {productId}=req.body;
        if (!productId) {
            return res.status(400).json({message:"All field are required"});
        }
        const product = await Product.findById(productId).exec();
        if(!product) {
            res.status(404).json({message:"Not Found Product"});
        }
        const rating = await Rating.create ({...req.body});
        rating.save(err=>{
            console.log(rating._id)
            if(err) {return res.status(err.status).json({message:err})}
            return res.status(201).json({message:"Rating created"})
        })
    }
    async update(req, res){
        const {productId,userId,rate}=req.body;
        
        if (!productId&&!userId&&!rate){
            return res.status(400).json({message:"All field are required"});
        }
        const product = await Product.findById(productId).exec();
        const user = await Users.findById({_id:Number(userId)}).exec();
        
        
        if(!product&&!user) {
            res.status(404).json({message:"Not Found Product"});
        }
        const result = Rating.findOne({productId: productId}).exec();
        
        if(!result){
            res.status(404).json({message:"Not Found Rating Record"});
        };
        result.then((result) => {
            let indexSlice=[];
            result.usersRating.forEach((user,index) => {
                if(user.userId===Number(userId)){
                    indexSlice.push({userId:user.userId,index:index})
                }
            });

            if(indexSlice.length>0){
                result.usersRating.splice(indexSlice[0].index,1)
            };
            result.usersRating.push({userId:Number(userId),rate:Number(rate)});
            result.totalStar=result.usersRating.length;
            const rates=result.usersRating;
            
            const data =countRading(rates);
            const {one,two,three,four,five} = data;
            result.oneStar=one;
            result.twoStar=two;
            result.threeStar=three;
            result.fourStar=four;
            result.fiveStar=five;
            
            result.save();
            res.status(200).json({message:"update successfully"});
        }).catch(err => {res.status(404).json({message:err})});
        
    }
    delete(req, res, next){
        const id = req.params.id;
        if(!id){
            return res.status(400).json({message:"All field are required"})
        };
        Rating.deleteOne({_id:id}).then(() => {
            res.status(200).json({message:"deleted successfully"});
        }).catch(err => {
            next(err);
        })
    }
}


module.exports = new RatingController;