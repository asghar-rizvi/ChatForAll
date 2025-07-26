const mongoose = require('mongoose');

function connectToDB(url){
    return mongoose.connect(url).then(()=> console.log('MONGO DB CONNECTED'))
}

module.exports = connectToDB ;