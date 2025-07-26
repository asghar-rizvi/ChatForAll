const { Router } = require('express');
const route = Router();
const { handleUserSignUp, handleUserSignIn, handleLogout} = require('../controllers/users');


route.get('/signin', async(req, res) => {
    return res.render('signin');
})

route.get('/signup', async(req, res) => {
    return res.render('signup');
})

route.get('/logout', handleLogout)

route.post('/signup', handleUserSignUp);
route.post('/signin', handleUserSignIn);

module.exports =route;