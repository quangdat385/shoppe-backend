const Product = require('../models/Product');
const Users=require('../models/Users');
// @desc Get all product 
// @route GET /product
// @access Private

const getAllProducts = async (req, res) => {
    const products=await  Product.find().lean();


    if(!products.length){
        return res.status(404).json({message:"Product not found"})
    };

    const productWithUser= await Promise.all(products.map(async(product) => {
        const user = await Users.findById(product.user).lean().exec()
        return {...product,user_name:user.user_name}

    }))
    res.status(200).json(productWithUser)
}
// @desc Get soft deleted product
// @route GET /product
// @access Private

const getDeletedProduct = async (req, res) => {
    const products=await  Product.findDeleted({}).lean();
    console.log(products)


    if(!products.length){
        return res.status(404).json({message:"Product not found"})
    };

    const productWithUser= await Promise.all(products.map(async(product) => {
        const user = await Users.findById(product.user).lean().exec()
        return {...product,user_name:user.user_name}

    }))
    res.status(200).json(productWithUser)
}
// @desc post product 
// @route post /product/create
// @access Private

const createProduct = async (req, res)  => {
    const {user,title} = req.body;
    //confirm data

    if(!user||!title) {
        return res.status(400).json({message:"All fields are required"})
    };
    //check for duplicate

    const duplicate =await Product.findOne({title:title}).collation({ locale: 'en', strength: 2 }).lean().exec();
    console.log(duplicate);
    if(duplicate){
        return res.status(409).json({message:"Product duplicate"})   ;     
    }

    const product = await Product.create({...req.body})
    if(product) {
        return res.status(201).json({message:"Product created"}) 
    }else {
        return res.status(400).json({message:"Invalid Product data received"})
    }
}
// @desc update product 
// @route post /product/:id/update
// @access Private
const updateProduct = async (req, res) => {
    const {id,user,title}=req.body;
    

    
    //confirm data 

    if(!id||!user||!title) {
        return res.status(400).json({message: 'All fields are required'});
    };
    //confirm note exists to update product

    const product = await Product.findById(id).exec();
    
    if(!product) {
        return res.status(400).json({message: 'Product not found'});
    };
    //check for duplicate title

    const duplicate= await Product.findOne({title:title}).collation({ locale: 'en', strength: 2 }).lean().exec();
    
    //Allow renaming of the original title
    
    if(duplicate&&duplicate._id.toString()!==id){
        return res.status(409).json({message:"Duplicate title"});
    }

    await product.updateOne(req.body);

    const result = await product.save()

    
    if(result) {
        return res.status(201).json({message:"Product is updated"}) 
    }else {
        return res.status(400).json({message:"Invalid Product data received"})
    }
    
}   
// @desc soft delete product 
// @route post /product/:id/soft/delete
// @access Private
const deleteProduct = async (req, res) => {
    const id = req.params.id;
    
    if(!id) {
        return res.status(400).json({message: 'Product ID required'});
    }
    const product = await Product.findById(id).exec();
    if(!product) {
        res.status(400).json({message: 'Product not found'});
    };

    const result = await product.delete();

    res.status(200).json({message:` Product ${result.title} deleted soft successfully` });
}
// @desc  delete product 
// @route post /product/:id/delete


// @access Private
const deleteForever = async (req, res) => {
    const id = req.params.id;
    if(!id) {
        return res.status(400).json({message: 'Product ID required'});
    }
    const product = await Product.findById(id).exec();
    if(!product) {
        res.status(400).json({message: 'Product not found'});
    };

    const result = await product.deleteOne();

    res.status(200).json({message:` Product ${result.title} deleted  successfully` });
}
// @desc  restore product 
// @route post /product/:id/restore


// @access Private
const productRestore = async (req, res) => {
    const id = req.params.id;
    if(!id) {
        return res.status(400).json({message: 'Product ID required'});
    }
    const product = await Product.restore({_id:id}).exec();
    if(!product) {
        res.status(400).json({message: 'Product not found'});
    };

    res.status(200).json({message:"Product is got back successfully"});
}
module.exports ={
    getAllProducts,
    getDeletedProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteForever,
    productRestore,
}