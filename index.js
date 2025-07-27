require('dotenv').config();
const express = require('express');
const cookiee_parser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8000;
const DB_URL = process.env.DB_URL


// Socket Connection Setup
const http = require('http');
const socketio = require('socket.io');
const initSocketIO = require('./service/socket');

const server = http.createServer(app); 
const io = socketio(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});

initSocketIO(io); 


// DB Connection
const connectToDB = require('./DBConnection');
connectToDB(DB_URL);


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


const { handleLogout } = require('./controllers/Chat')
app.get('/logout', checkAuthentication ,handleLogout);




server.listen(PORT, () => {
  console.log('listening on, ',PORT);
});