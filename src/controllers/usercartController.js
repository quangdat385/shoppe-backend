const UserCart= require('../models/Usercart');
const Users= require('../models/Users');
const Product= require('../models/Product');


// @desc Get all product purchased by user
// @route GET /usercart
// @access Private
const show = async (req, res) => {
    const usercart=await UserCart.find({}).lean().exec();
    if(!usercart) {
        res.status(404).json({message:"Cart is empty"});
    }
    const productWithUser= await Promise.all(usercart.map(async(cart) => {
        const user= await Users.findById(cart.user).lean().exec();
        const product = await Product.findById(cart.product).lean().exec();
        return {
            ...cart,
            user_name:user.user_name,
            product_title:product.title,
        }

    }))
    res.status(200).json(productWithUser)

};

// @desc Get all product purchased by user with status waiting
// @route GET /usercart/soft
// @access Private
const softShow= async (req, res) => {
    const usercart=await UserCart.findDeleted({}).lean().exec();
    if(!usercart) {
        res.status(404).json({message:"Cart is empty"});
    }
    const productWithUser= await Promise.all(usercart.map(async(cart) => {
        const user= await Users.findById(cart.user).lean().exec();
        const product = await Product.findById(cart.product).lean().exec();
        return {
            ...cart,
            user_name:user.user_name,
            product_title:product.title,
        }

    }))
    res.status(200).json(productWithUser)

};
// @desc post purchase product
// @route POST /purchase
// @access Private
const purchase = async (req, res) => {
    const {product,user} = req.body;


    if(!product||!user) {
        return res.status(400).json({message:"All fields are required"})
    }

    const dup_user= await Users.findById(user).exec();
    const dup_product = await Product.findById(product).exec();

    if(!dup_user || !dup_product) {
        return res.status(404).json({message:"Data Resources Not Found"});

    };
    if(dup_product&&dup_product?.quality<0) {
        return res.status(409).json({message:"Product sold out"})
    };

    const usercart=await UserCart.create({...req.body});
    await usercart.delete();
    await usercart.save()
    if(usercart) {
        return res.status(200).json({message:"Product added into cartsuccessfully"})
    }else {
        return res.status(404).json({message:"Invalid Product data received"});
    }


};
// @desc update usercart
// @route POST /:id/update
// @access Private
const updateCart = async (req, res) => {
    const {id,product,user} = req.body;

    if(!id||!product||!user){
        return res.status(400).json({message:"All fields are required"})
    };

    const dup_user= await Users.findById({user}).lean().exec();
    const dup_product= await Users.findById({user}).lean().exec();

    const usercart=await UserCart.findById(id).exec();

    if(!usercart){
        return res.status(400).json({message:"Cart Not Found"})
    };
    if(!dup_user||!dup_product){
        return res.status(404).json({message:"Data Resources Not Found"});
    };

    if(dup_product&&dup_product?.quality<0) {
        return res.status(409).json({message:"Product sold out"})
    };
    try {
        await UserCart.updateMany({...req.body});
        await UserCart.save();
        res.status(200).json({message:"Cart Updated Successfully"});

    }catch(err){
        return res.status(404).json({message:err})
    }
    
    
};
// @desc restore usercart
// @route delete /:id/restore
// @access Private
const restore = async (req, res) => {
    const {id,product,user} = req.body;

    if(!id||product||user){
        return res.status(400).json({message:"All fields are required"})
    };

    const dup_user= await Users.findById({user}).lean().exec();
    const dup_product= await Users.findById({user}).lean().exec();

    const usercart=await UserCart.findById(id).exec();

    if(!usercart){
        return res.status(400).json({message:"Cart Not Found"})
    };
    if(!dup_user||!dup_product){
        return res.status(404).json({message:"Data Resources Not Found"});
    };
    await usercart.restore();

    res.status(200).json({message:"Oder Product is Confirm"})
}

// @desc delete usercart
// @route delete /:id/delete
// @access Private

const deleteOne = async (req, res)=>{
    const id = req.params.id;
    if(!id){
        res.status(400).json({message:"All fields are required"});
    };
    const usercart=await UserCart.findById(id).exec();

    const result=await usercart.deleteOne();

    if(result){
        res.status(200).json({message:"Oder deleted"})
    }

};
// @desc delete usercart
// @route delete /:id/delete
// @access Private
const deleteMany = async (req, res) => {
    const id=req.params.id;
    const ids= req.body;
    if(!id){
        res.status(404).json({message:"All fields are required"})
    };
    const usercart= await usercart.findOne(id).exec();

    const result = await usercart.deleteMany({user:{$in:ids}},);
    if(result){
        res.status(200).json({message:"Oder deleted"})
    }


}
module.exports = {
    show,
    softShow,
    purchase,
    updateCart,
    deleteOne,
    restore,
    deleteMany,
}