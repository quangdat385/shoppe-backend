const Users=require('../models/Users');
const createToken=require("../middleware/createToken")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')


class AuthController {
    //router POST auth/register
    register(req,res,next){
        const {phone_number,email,google,facebook,user_name}=req.body;
        
        const method_login=phone_number&&{phone_number:phone_number}||email&&{email:email}
                            ||google&&{google:google}||facebook&&{facebook:facebook};
        
        if(!method_login){
            return res.status(400).json({message:'All fields are required'})
        };
        const key=Object.keys(method_login)[0];
        
        const value=Object.values(method_login)[0];
        const duplicate = Users.findOne({[key]:value});
        
        duplicate
        .then(duplicate=>{
            console.log(duplicate);
            if(duplicate) {
                if (!duplicate.isVerified){
                    
                    return res.status(200).json({
                        type: 'duplicate',
                        netx_step:"update",
                        method_login:`${key}`,
                        message:`Duplicate ${key} user and not verifyed`,
                        data:{
                            userId:duplicate._id
                        }
                    })
                }else{
                    
                    const accessToken=createToken({
                        "user":{
                            "UserId":duplicate._id,
                            "roles":duplicate.roles,
                            "user_name":duplicate.user_name
                        }
                    },process.env.ACCESS_TOKEN_SECRET,"15m");
    
                    const refreshToken=createToken({
                        "user":{
                            "userId":duplicate._id
                        }
                    },process.env.REFRESH_TOKEN_SECRET,"7d");
                    res.cookie('jwt',refreshToken,{
                        httpOnly: true, //accessible only by web server 
                        secure:true, //https
                        sameSite: 'None', //cross-site cookie 
                        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match r
                    });
                    res.cookie('method_login',`${key}`,{   
                        httpOnly: true, //accessible only by web server 
                        secure:true, //https
                        sameSite: 'None', //cross-site cookie 
                        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match r
                    });
                    res.status(201).json({
                        type: "success",
                        next_step:"views",
                        message: "Login successfully",
                        accessToken,
                        
                    });
                }
                
        
            }else {
                let result 
                if (key==="phone_number"){
                    result =key === process.env.ADMIN_PHONE? ["ADMIN","USER"]:["USER"]
                }else if (key==="email"){
                    result=key === process.env.MAIL? ["ADMIN","USER"]:["USER"]
                }else if (key==="google"){
                    result=key === process.env.GOOGLE? ["ADMIN","USER"]:["USER"]
                }else {
                    result=key === process.env.FACE_BOOK? ["ADMIN","USER"]:["USER"]
                }
            
                const user=new Users({
                    [key]:value,
                    roles :result ,
                    user_name:user_name?user_name:require('crypto').randomBytes(6).toString('hex'),
                    name_shop:`auto_gen_${require('crypto').randomBytes(10).toString('hex')}`
                    
                })
                
                
                user.save()
                    .then(() => {

                        res.status(200).json({

                                type: "success",
                                next_step: "update",
                                method_login:`${key}`,
                                message: "Register Successfully",
                                data: {
                                    userId: user._id,
                                },
            
                            
                        })

                    })
                    .catch(err=>{
                        res.status(404).json({ message: 'Invalid user data received' })
                        next(err)
                    }) 
                    }
                })
                
        .catch(next)
        
        
    }        
    //router PUT auth/:id/update/login?method=key(key get from responsive)
    updateAndLogin(req, res, next){
        (async ()=> {
            
            
            
            const {id,method,password} = req.body;
            console.log(method,id,password);
            if(!id||!password) {
                return res.status(401).json({ message: 'All fields are required'});
            };
            const hashedPwd=await bcrypt.hash(password,10)

            if(!hashedPwd) {
                return res.status(403).json({ message: 'Password not hash' })
            }
            
            await Users.findByIdAndUpdate({_id:id},{
                password:hashedPwd,
                isVerified:true
            })
                .then((user) => {
                    const accessToken=createToken({
                        "user":{
                            "UserId":user._id,
                            "roles":user.roles,
                            "user_name":user.user_name
                        }
                    },process.env.ACCESS_TOKEN_SECRET,"15m");
    
                    const refreshToken=createToken({
                        "user":{
                            "userId":user._id
                        }
                    },process.env.REFRESH_TOKEN_SECRET,"7d");
                    res.cookie('jwt',refreshToken,{
                        httpOnly: true, //accessible only by web server 
                        secure:true, //https
                        sameSite: 'None', //cross-site cookie 
                        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match r
                    });
                    res.cookie('method_login',`${method}`,{   
                        httpOnly: true, //accessible only by web server 
                        secure:true, //https
                        sameSite: 'None', //cross-site cookie 
                        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match r
                    });
                    res.status(201).json({
                        type: "success",
                        next_step:"views",
                        message: "Login successfully",
                        accessToken,
                        
                    });
                })
                .catch((err) => {
                    res.status(401).json({ message: 'Unauthorized' })
                    next(err)
                });    
            }

        )()    
    }
    //route POST auth/login
    login(req, res){
        (async ()=>{
            const {phone_number,user_name,email,google,facebook,password}=req.body;

            const method_login=phone_number&&{phone_number:phone_number}||email&&{email:email}
                                ||google&&{google:google}||facebook&&{facebook:facebook}||user_name&&{user_name:user_name};
            
            if (!method_login|| !password) {
                return res.status(400).json({message:'All fields are required' })
            }
            const key=Object.keys(method_login)[0];
            const value=Object.values(method_login)[0];

            const foundUser= await Users.findOne({[key]:value}).exec()
            if(!foundUser||!foundUser.isVerified){
                return res.status(401).json({message: 'Unauthorized'})
            }
            const match= await bcrypt.compare(password,foundUser.password)
            if(!match) return res.status(401).json({message: 'Password mismatch'})
            
            const accessToken=createToken({
                "user":{
                    "UserId":foundUser._id,
                    "roles":foundUser.roles,
                    "user_name":foundUser.user_name
                }
            },process.env.ACCESS_TOKEN_SECRET,"15m");

            const refreshToken=createToken({
                "user":{
                    "userId":foundUser._id,
                    
                }
            },process.env.REFRESH_TOKEN_SECRET,"7d");
            res.cookie('jwt',refreshToken,{
                httpOnly: true, //accessible only by web server 
                secure:true, //https
                sameSite: 'None', //cross-site cookie 
                maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match r
            });
            res.cookie('method_login',`${key}`,{   
                httpOnly: true, //accessible only by web server 
                secure:true, //https
                sameSite: 'None', //cross-site cookie 
                maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match r
            });
            res.status(201).json({
                type: "success",
                next_step:"views",
                message: "User Login Successfully",
                accessToken,
            }) 
        })()
    }
    //route GET auth/refresh
    refreshToken(req, res) {
        const cookies= req.cookies;
        
        if(!cookies?.jwt) return res.status(401).json({message: 'Unauthorized'});


        const refreshToken =cookies.jwt;
        

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if(err) return res.status(403).json({message:"Forbidden"})
                console.log(decoded)
                
                const foundUser= await Users.findById(decoded.user.userId).exec()
                
                if(!foundUser) return res.status(401).json({message:"Unauthorized"});
                const accessToken=createToken({
                    "user":{
                        "UserId":foundUser._id,
                        "roles":foundUser.roles,
                        "user_name":foundUser.user_name,
                    }
                },process.env.ACCESS_TOKEN_SECRET,"15m");
                res.json({accessToken})
            }
        )

    }
    //router POST auth/logout
    logout(req, res) {
        const cookies= req.cookies;

        if(!cookies){res.status(400).json("Not found cookies")};
        
        res.clearCookie('jwt',{httpOnly:true,sameSite:'None',secure:true})
        res.clearCookie('method_login',{httpOnly:true,sameSite:'None',secure:true})
        res.json({ message:'Cookie cleared'})
    }
    //router POST auth/confirm
    confirm(req, res){
        (async ()=> {
            const {phone_number,email}=req.body;

            if(!phone_number ){
                return res.status(400).json({message:'Missing phone number or email'}) ;
            }

            const confirm_method=phone_number&&{phone_number:phone_number}||email&&{email:email};
            const key= Object.keys(confirm_method)[0];
            const value=Object.values(confirm_method)[0];
            const user=await Users.findOne({[key]:value}).exec()
            
            if (!user||!user?.isVerified) {
                res.status(401).json({message: 'Unauthorized' })
            }else {
                res.status(200).json({
                    userId:user.id,
                    phone_number:user.phone_number,
                })
            }
            
            
        })()
        
        
    }
    //put auth/forgot/password
    forgotPassword(req, res, next){
        (async ()=> {
            const {id,method,password}=req.body;
        if(!id||!method||!password) {
            return res.status(400).json({ message: 'All fields are required'});
        };
        const hashedPwd=await bcrypt.hash(password,10)

        if(!hashedPwd) {
            return res.status(403).json({ message: 'Password not hash' })
        }
        
        await Users.findByIdAndUpdate({_id:id},{
            password:hashedPwd,
        })
            .then((user) => {
                

                const accessToken=createToken({
                    "user":{
                        "UserId":user._id,
                        "roles":user.roles,
                        "user_name":user.user_name
                    }
                },process.env.ACCESS_TOKEN_SECRET,"15m");
    
                const refreshToken=createToken({
                    "user":{
                        "userId":user._id,
                        
                    }
                },process.env.REFRESH_TOKEN_SECRET,"7d");
                res.cookie('jwt',refreshToken,{
                    httpOnly: true, //accessible only by web server 
                    secure: true, //https
                    sameSite: 'None', //cross-site cookie 
                    maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match r
                });
                res.cookie('method_login',`${method}`,{   
                    httpOnly: true, //accessible only by web server 
                    secure:true, //https
                    sameSite: 'None', //cross-site cookie 
                    maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match r
                });
                res.status(201).json({
                    type: "success",
                    next_step:"views",
                    message: "Login successfully",
                    accessToken
                });
            })
            .catch((err) => {
                res.status(401).json({ message: 'Unauthorized' })
                next(err)
            });   
        })()
    }
    
    loginOtp(req, res, next){
        //D:\khoak03\Project\Shoope\shoopee-backend\src\doc
    }
}


module.exports =new AuthController;