const Users=require('../models/Users');
const Product=require('../models/Product');
const Rating=require('../models/RatingModel');
const countRading= require('../middleware/counRating');



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
        const product = await Product.findById(productId,"name length").exec();
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
        console.log(productId,userId,rate)
        if (!productId||!userId||!rate){
            return res.status(400).json({message:"All field are required"});

        };
        
        const product = await Product.findOneWithDeleted({_id:productId}).exec();
        const user = await Users.findWithDeleted({_id:Number(userId)}).exec();
        
        if(!product||!user){
            return res.status(404).json({message: "Not Found User Or Product"});
        }
        const result = Rating.findOne({productId:product._id}).exec();
        
        if(!result){
            res.status(404).json({message:"Not Found Rating Record"});
        };
        result.then((result) => {
            
            const term=  result.usersRating.filter(item=>{
                console.log(item)
                return item.userId!==userId
            })
            console.log("term :",term);

            result.usersRating=[...term,{userId:userId,rate:rate}];
            result.totalStar=result.usersRating.length;
            const rates=result.usersRating;
            
            const data =countRading(rates);
            const {one,two,three,four,five} = data;

            const rating=result.totalStar===0?0:((one*50+two*50+three*100+four*400+five*500)/(result.totalStar*500))*5;

            result.oneStar=one;
            result.twoStar=two;
            result.threeStar=three;
            result.fourStar=four;
            result.fiveStar=five;
            result.rating=rating.toFixed(1);
            result.save();
            res.status(200).json({message:"update successfully"});
        }).catch(()=> {res.status(404).json({message:"Don't update successfully"})});
        
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