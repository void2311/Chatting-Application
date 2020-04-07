const path= require('path');
const express = require('express');
const http = require('http');
const formatMessage=require('./utils/messages');
const { userJoin, getCurrentuser,userLeave,getRoomUsers }=require('./utils/users');
const socketio = require('socket.io');
const app= express();
const server=http.createServer(app);
const io=socketio(server);


//set static foler
app.use(express.static(path.join(__dirname,'Public')));

//Run when a client connect 
const botName='Chatbot'
io.on('connection', socket => {
   socket.on('joinRoom',({ username, room}) => {
       const user=userJoin(socket.id, username, room);
       socket.join(user.room);
    socket.emit('message',formatMessage(botName,'Welcome to the ChatBot'));  //sending this from server and message is catched in main.js
    //broadcast when a user connects except himself
    socket.broadcast.to(user.room)
    .emit('message',formatMessage(botName,`${user.username} has joined the chat`));

    //sedn user and room info 
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
    })
   });
    
     
     //Listen to chat-message from client 
     socket.on('chatMessage', (msg) => {
         const user=getCurrentuser(socket.id);
         io.to(user.room).emit('message',formatMessage(user.username,msg));
     });
     //Runs when a user disconnect
     socket.on('disconnect', () => {
         const user=userLeave(socket.id);
         if(user)
         {
            io.to(user.room).emit('message'
            ,formatMessage(botName,
            `${user.username} has disconnect the chat`));  //emit to everyone this message
        io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
        
     });

    });

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=> console.log(`Server Running on port ${PORT}`));


