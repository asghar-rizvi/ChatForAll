const express = require('express');
const cookiee_parser = require('cookie-parser');

const app = express();
PORT = 3000;
const http = require('http');
const server = http.createServer(app);


const { Server } = require('socket.io');
const io = new Server(server); 
io.on('connection', (socket) => {
    console.log('user connected');
});


// DB Connection
const connectToDB = require('./DBConnection');
connectToDB('mongodb://127.0.0.1:27017/chat-APP');


// Socket Connection











// Middle wares
const path = require('path');
app.use(express.urlencoded({ extended:false }));
app.use(express.json());
app.use(express.static(path.resolve('./public')));
app.set('view engine', 'ejs')
app.use(cookiee_parser());

const checkAuthentication = require('./middlewares/authentication');

//Routes
app.get('/', async(req, res) =>{
    return res.render('index');
})
const routerUser = require('./routes/users');
const routerNetwork = require('./routes/Network');
const routerChat = require('./routes/Chatroutes');

app.use('/user', routerUser);
app.use('/network',checkAuthentication, routerNetwork);
app.use('/chat',checkAuthentication, routerChat);



server.listen(PORT, () => {
  console.log('listening on, ',PORT);
});