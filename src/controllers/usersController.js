const Users= require('../models/Users')
const Product = require('../models/Product');
const bcrypt=require('bcrypt')




class UsersController {
    // get api/user
    show(req, res,next){
        Users.find({}).select('-password').lean()
        .then(users => {
            if(users.length){
                console.log(req.cookies)
                res.status(200).json(users)
            }else{
                res.status(400).json({message:"users not found"})
            }
            
        })
        .catch(next)
    }
    // get api/user/show/delete
    showDeleted(req, res,next){
        Users.findDeleted({}).select('-password').lean()
        .then(users => {
            if(users.length){
                res.status(200).json(users)
            }else{
                res.status(401).json({message:"user not found"})
            }
        })    
        .catch(next)
    }
    //post api/user/create
    async create(req, res){
        const {user_name,password,roles} = req.body;
        //confirm data;
        if (!user_name || !password || !roles){
            return res.status(400).json({message:"All field are required"});
        };
        //check for duplicate user_name and password
        const duplicate= await Users.findOne({user_name:user_name}).collation({ locale: 'en', strength: 2 }).lean().exec();
        if (duplicate) {
            return res.status(401).json({message: 'Duplicate username'});
        };
        //Hash password;
        const hashedPwd= await bcrypt.hash(password,10)//salt rounds;
        
        
        //create and store new user

        const user = await Users.create({
            isVerified:true,
            user_name,
            roles :(!Array.isArray(roles) || !roles.length)?["USER"]:roles,
            name_shop:`auto_gen_${require('crypto').randomBytes(10).toString('hex')}`,
            password:hashedPwd,
        })
        
        if(user) {
            res.status(201).json({message:`New user ${user_name} created`})
        }else{
            res.status(400).json({message:'Invalid user data received'})
        }

    }
    //patch user/update
    async updateManager(req, res, next){
        const {id,avatar,user_name,email,phone_number,birthday,gender,full_name,name_shop} = req.body;
        if(!id||!user_name){
            return res.status(400).json({message:"All fields are require"});
        };
            //duplicate 
        const dup_email= await Users.findOne({email});
        const dup_phone= await Users.findOne({phone_number});
        const dup_username= await Users.findOne({user_name});
        
        const dup_nameshop=await Users.findOne({name_shop})
        
        

        const user = await Users.findById(id).select('-password');
        if(!user){res
            res.status(404).json({message:"Unauthorized"})
        };
        
        if (dup_phone&&dup_phone._id!==user._id){
            return res.status(401).json({message:"Duplicate phone"})
        };
        if (dup_email&&dup_email._id!==user._id){


            return res.status(401).json({message:"Duplicate email"})
        };
        if (dup_username&&dup_username._id!==user._id){
            return res.status(401).json({message:"Duplicate user name"})
        };
        if (dup_nameshop&&dup_nameshop._id!==user._id){
            return res.status(401).json({message:"Duplicate name shop"})
        };
        
        
        
        await user.updateOne(req.body);
        const result =await user.save()
        if(result){
            res.status(200).json({message:"user updated successfully"})
        }else{
            res.status(404).json({message:"Error updating"})
        }

    }
    //patch user/:id/update
    async updateUser(req, res, next){
        const {id,phone_number,email,user_name,full_name,gender,birthday,name_shop,avatar} = req.body;
        if(!id||!phone_number) {
            return res.status(400).json({message:'All fields are required'})
        }

        const dup_email=await Users.findOne({email});
        const dup_phone=await Users.findOne({phone_number});

        const user =await Users.findById(id).select('-password');

        if(!user){res
            res.status(404).json({message:"Unauthorized"})
        };
        
        if (dup_phone&&dup_phone._id!==user._id){
            return res.status(401).json({message:"Duplicate phone"})
        };
        if (dup_email&&dup_email._id!==user._id){
            return res.status(401).json({message:"Duplicate email"})
        };
        await user.updateOne(req.body);
        const result =await user.save()
        if(result){
            res.status(200).json({message:"user updated successfully"})
        }else{
            res.status(404).json({message:"Error updating"})
        }
    }
    //put user/:id/change/password
    changePassworded(req, res, next){
        Users.findByIdAndUpdate({_id:req.params.id},req.body)
            .then(()=>{res.status(200).json({message:"Password changed successfully"})})
            .catch(next)
    }
    // delete /:id/soft/delete
    async softDelete(req, res){
        const user= await Users.findById({_id:req.params.id}).exec();
        if(!user) return res.status(401).json({message:"User not found"});
        
        const product=await Product.findOne({user:req.params.id}).exec();
        
        if (product){
            product.user=1;
            await product.save()
            await user.delete()
            res.status(200).json({message:"User deleted successfully"})
        }
    }
    //delete /:id/delete
    async delete(req, res){
        const user= await Users.findById({_id:req.params.id}).exec();
        if(!user) return res.status(401).json({message:"User not found"});

        const product=await Product.findOne({user:req.params.id}).exec();
        if (product){
            product.user=1;
            await product.save()
            await user.deleteOne()
            res.status(200).json({message:"User deleted forever successfully"})
        }

    }
    //put /:id/restore
    restore(req, res, next){
        Users.restore({_id:req.params.id})
            .then(()=>res.status(200).json({message:"User is got back successfully"}))
    }
}

module.exports = new UsersController