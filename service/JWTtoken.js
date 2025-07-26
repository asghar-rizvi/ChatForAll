const jwt = require('jsonwebtoken');
const SECRET_KEY = '$asghar$009911%87'

function createJWT(user){
    const payload = {
        userid: user.id,
        email : user.email,
        fullname : user.fullName,
        friends : user.friends,
        sentRequests: user.sentRequests,
        pendingRequests : user.pendingRequests,
        isOnline : user.isOnline,
        socketId: user.socketId
    }

    return jwt.sign(payload, SECRET_KEY)
}

function validateJWT(token){
    return jwt.verify(token, SECRET_KEY);
}

module.exports = {
    createJWT,
    validateJWT
}