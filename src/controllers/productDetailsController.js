const DetailProducts=require("../models/ProductDetails");
const Products=require("../models/Product");


class ProductDetails {
    show(req,res,next) {
        DetailProducts.find({}).lean()
        .then((result) => {
            if(!result.length) {
                return res.status(404).json({message:"Not Found"});
            }else {
                return res.status(200).json(result);
            }
        }).catch(next);
    }
    async create(req, res) {
        const {productId}= req.body;
        if (!productId) {
            return res.status(400).json({message:"All field are required"});
        }
        
        const product= await Products.findById({_id: productId}).exec();
        if(!product) {
            res.status(404).json({message:"Not Found Produtc"});
        };
        
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
        console.log(id)
        if(!id){
            return res.status(400).json({message:"All field are required"})
        }
        const details= await DetailProducts.findById({_id:id}).exec();
        if(!details){
            return res.status(400).json({message:"Product Details Not Found"})
        }
        const formupdate={...req.body};

        const result =await details.updateOne(formupdate).exec();
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
}


module.exports= new ProductDetails;