const DetailProducts=require("../models/ProductDetails");
const Products=require("../models/Product");
const Users=require("../models/Users");
// const Delivery=require("../models/deliveryAgency");


class ProductDetails {
    show(req,res,next) {
        DetailProducts.find({}).lean()
        .then((result) => {
            if(!result.length) {
                return res.status(404).json({message:"Not Found"});
            }else {
                // result.map(async(item)=>{
                //     const result=await  Delivery.create({details_productId:item._id})
                //     await result.save()
                // })
                return res.status(200).json(result);
            }
        }).catch(next);
    }
    async create(req, res) {
        const {productId,user}= req.body;
        if (!productId||!user) {
            return res.status(400).json({message:"All field are required"});
        }
        
        const product= await Products.findById({_id: productId}).exec();
        const find_user= await Users.findById({_id: user}).exec();
        if(!product) {
            res.status(404).json({message:"Not Found Product"});
        };
        if(!find_user) {
            res.status(404).json({message:"Not Found User"});
        }
        const duplicate=await DetailProducts.findOne({productId: productId}).collation({ locale: 'en', strength: 2 }).lean().exec();
        if(!duplicate) {
            const details= await DetailProducts.create({...req.body});

            details.save(err => {
                if(err) {
                    return res.status(500).json({message:err});
                    
                };
                console.log(details);

                res.status(200).json({message:"Product Details Created"});

            })
        }else{
            res.status(401).json({message:"Duplicate Product Details"})
        }
        
        

        
    }
    async update(req, res, next) {
        const id=req.params.id;
        const {user,...rest} = req.body;
        console.log(id)
        if(!id,!user){
            return res.status(400).json({message:"All field are required"})
        }
        const details= await DetailProducts.findById(id).exec();
        const find_user= await Users.findById(user).exec();
        if(!details){
            return res.status(404).json({message:"Product Details Not Found"})
        }
        if(!find_user){
            return res.status(404).json({message:"User Not Found"})
        }

        const result =await details.updateOne({...rest,user_update:user}).exec();
        if(!result){
            return res.status(400).json({message:"Product Details Updated Failed"})
        }
        res.status(200).json({message:"Product Details Updated Successfully"})
    }
    async delete(req, res, next) {
        const id = req.params.id;
        if(!id) {
            res.status(400).json({message:"Id Feild are required"});
        }

        const details=await DetailProducts.findById(id).exec();
        if(!details) {return res.status(404).json({message:"Details Product Not Found"})};
        
        await details.deleteOne();


        res.status(200).json({message:`Details product deleted  successfully` });
        }
    updateMany=async (req, res) => {
            const {user}=req.body;
        
            const results=await DetailProducts.updateMany({user:user});
            if(!results) {
                res.status(404).json({message:"Updated Not Successfully"})
            }
            res.status(200).send({message:"Updated Successfully"})
            
        
        }
}


module.exports= new ProductDetails;