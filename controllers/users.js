const User = require('../models/User');
const bcrypt = require('bcrypt');
const { createJWT } = require('../service/JWTtoken');

async function handleUserSignUp(req, res){
    const {   fullName, username, email, password } = req.body;

    const record = await User.findOne({ username });
    if(record){ 
        return res.render('signup', {
            message : 'Account Is Already Created'
        })  
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        fullName,
        username,
        email,
        password : hashedPassword
    })
    return res.redirect('/user/signin');
}

async function handleUserSignIn(req, res){
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if(!user){ 
        return res.render('signin', {
            message : 'No Such Account'
        })  
    }
    const match = bcrypt.compare(password, user.password);
    if(match){ 
        user.isOnline = true;
        const token = createJWT(user);
        res.cookie('token', token);
        res.redirect('/chat');
    }
    else{ return res.render('signin', {message : 'Invalid Details '})};

}


module.exports = {
    handleUserSignUp,
    handleUserSignIn,
}
