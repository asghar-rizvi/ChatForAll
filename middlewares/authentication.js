const jwt = require('jsonwebtoken')
const { validateJWT } = require('../service/JWTtoken');

function checkAuthentication(req, res, next){
    const token = req.cookies.token;
    if(!token){ 
        return res.redirect('/user/signin')
    }

    try{
        const user = validateJWT(token);
        req.user = user;
        next();
    }catch(e){
        return res.status(403).send('Invalid token');
    }
}   


module.exports = checkAuthentication;