

const Product = require('../models/Product');
const Users=require('../models/Users');
const Rating=require('../models/RatingModel');
const loadfile = require('../middleware/loadFilemiddleware');

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
    
    if(duplicate){
        return res.status(409).json({message:"Product duplicate"})   ;     
    }

    const product = await Product.create({...req.body});
    product.save(async(err) => {
        if(err) return res.status(err.status).json({message:err})
        console.log(product._id)
        
        const rating=new Rating({productId:product._id});
        
        rating.save(async(err) => {
            if(err) return res.status(err.status).json({message:err})
            product.rateId=rating._id;
            product.save()
            return res.status(201).json({message:"Product created"})
        }
        );
        
    })
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
const postImg =async (req, res) => {
    
    const files=req.files;
    if (!files){
        res.status(400).json({message: 'All field are required'})
    }
    
    const result=files.map(file =>{
        return [`${req.protocol}://${req.headers.host}/img/${file.filename}`,
        `./src/public/img/${file.filename}`]
    })
    console.log(result)
    res.status(200).json({data:result})
}
const postImgbyUrl =async (req, res) => {
    
    const {files} = req.body;
    
    if (!files){
        res.status(400).json({message: 'All field are required'})
    }
    const urls= files.map((file) =>{
        const filename=file.split('/')
        const fileName=filename[filename.length - 1];
        loadfile(file,`imgProduct${fileName}`)
        .then(res=>res).catch((err) =>next(err));

        return [`${req.protocol}://${req.headers.host}/img/imgProduct${fileName}`,
        `./src/public/img/imgProduct${fileName}`
    ];
        
    })
    setTimeout(() => {
        return res.status(200).json({data:urls})
    },2000 );
    
    
    
}
module.exports ={
    getAllProducts,
    getDeletedProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteForever,
    productRestore,
    postImg,
    postImgbyUrl
}