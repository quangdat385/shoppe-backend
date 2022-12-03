const jwt =require('jsonwebtoken');

const createToken=(payload,jwt_secret,timeskip)=>{
    const token = jwt.sign(payload, jwt_secret, { expiresIn: `${timeskip}` });
    return token;
}

module.exports = createToken
