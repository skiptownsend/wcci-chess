require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const leaveRoom = require('./utils/leave-room');
var port = process.env.PORT || 3000;


app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const CHAT_BOT = 'ChatBot';
let chatRoom = ''; //javascript, node
let allUsers = []; // All users in current chat room

io.on('connection', (socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on('move', function(msg){
      socket.broadcast.emit('move',msg);
      console.log("the return of msg is " + msg);
    })
    socket.on('restart', function(){
      socket.broadcast.emit('restart');
      console.log("the return of msg is restart");
    })

  socket.on('join_room', (data) => {
    const { username, room } = data;
    socket.join(room);
    let __createdtime__ = Date.now(); // Current time
    // sending message to all in the room
    socket.to(room).emit('receive_message', {
        message: `${username} has joined the chat room`,
        username: CHAT_BOT,
        __createdtime__,
      });
      socket.emit('receive_message', {
        message: `Welcome ${username}`,
        username: CHAT_BOT,
        __createdtime__,
      });
    // This sends a array of all the users so the frontend can tell who is in the room
    chatRoom = room;
    allUsers.push({id: socket.id, username, room});
    chatRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.emit('chatroom_users', chatRoomUsers);

    socket.on('send_message', (data) => {
        const { message, username, room, __createdtime__ } = data;
        io.in(room).emit('receive_message', data); // Send to all users in room, including sender
        // harperSaveMessage(message, username, room, __createdtime__) // Save message in db
        //   .then((response) => console.log(response))
        //   .catch((err) => console.log(err));
      });
      socket.on('leave_room', (data) => {
        const { username, room } = data;
        socket.leave(room);
        const __createdtime__ = Date.now();
        // Remove user from memory
        allUsers = leaveRoom(socket.id, allUsers);
        socket.to(room).emit('chatroom_users', allUsers);
        socket.to(room).emit('receive_message', {
          username: CHAT_BOT,
          message: `${username} has left the chat`,
          __createdtime__,
        });
        console.log(`${username} has left the chat`);
         });

        socket.on('disconnect', () => {
            console.log('User disconnected from the chat');
            const user = allUsers.find((user) => user.id == socket.id);
            if (user?.username){
                allUsers = leaveRoom(socket.id, allUsers);
                socket.to(chatRoom).emit('chatroom_users', allUsers);
                socket.to(chatRoom).emit('recieve_message', {
                    message: `${user.username} has been disconnected from the chat.`
                });
            }
        }); 

    });
});

app.get("/", (req, res) => {
  res.send("hello world");
});

server.listen(4000, () => "server is running on port 4000");