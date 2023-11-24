const { use } = require("passport");
const userModel = require("./models/userModel");
var chatModel = require('./models/chatModels.js')
var fileModel = require('./models/fileModel.js')

const io = require( "socket.io" )();

const socketapi = {
    io: io,
};

var usp = io.of('/user-namespace')

// usp.on('connection',  (socket) => {
//     console.log('vid a user conn ' + socket.id);

//     socket.on('join', function(roomName) {

//         var rooms = io.sockets.adapter.rooms
//         var room = rooms.get(roomName)

//         if(room == undefined ){
//             socket.join(roomName)
//             console.log('room created');
//             socket.emit('created')
//         } else if(room.size == 1){
//                socket.join(roomName)
//                console.log('joined in room');
//                socket.emit('joined')
//         }else {
//             console.log('room is full');
//             socket.emit('full')
//         }
//         console.log(rooms);

//     });

//     socket.on('ready', function(roomName){
//        console.log(ready);

//        socket.broadcast.to(roomName).emit('ready')
//     })

//     socket.on('candidate', function(candidate,roomName){
//         console.log(candidate);
//         socket.broadcast.to(roomName).emit('candidate', candidate)
//     }) 

    

// });

usp.on('connection', async (socket)=>{
    console.log('a user conected');

    try {
    let userId = socket.handshake.auth.token;
    var user = await userModel.findByIdAndUpdate( {_id : userId}, {$set : {is_online : '1'}} )
    // console.log(socket.userId  );

    socket.join(userId  )
    //  user broadcast online
     socket.broadcast.emit('getOnline', {userId})
    } catch (error) {
     console.log(error.message);   
    }
    
    socket.on('disconnect', async ()=>{
        console.log('a user disconnected');
        
        try {
         let userId = socket.handshake.auth.token;
         await userModel.findByIdAndUpdate( userId, {$set : {is_online : '0'}} )
            

        //  offline broadcast
         socket.broadcast.emit('getOffline', {userId})

        } catch (error) {
            console.log(error.message);
        }  
    })
    // chatting event for private

    socket.on('newChat', (data)=>{
       console.log(data);

       data.isRead = false;
      socket.broadcast.emit('loadNewChat', data)
    })  

    // load old chat
    socket.on('existsChat',async function(data){
        var chats =   await chatModel.find({$or:[
            {sender_id : data.sender_id, receiver_id : data.receiver_id},
            {sender_id : data.receiver_id, receiver_id : data.sender_id}
          ]});

       socket.emit('loadChats', {chats : chats})
    })

    // message read event
    socket.on('markRead', async function(data){
        try {

            let messageId = data._id;
            console.log( 'read msg' +messageId);
            await chatModel.findByIdAndUpdate(messageId, { $set : {isRead : true }})
        } catch (error) {
            console.log('Error marking message as read:', error.message);
        }
    })

    // new group chat
    socket.on('newGroupChat', function(data){
        console.log(data);

        socket.broadcast.emit('loadNewGroupChat', data)

         // Emit the updated message count to all clients in the group
    // io.to(data.group_id).emit('updateUnreadCount', { group_id: data.group_id });
    })

    // new file event
    socket.on('newFile', function(data){
        console.log(data);

        socket.broadcast.emit('loadNewFile', data)
    })

    // load old files
    socket.on('existsFile', async function(data){
        var files = await fileModel.find({ $or : [
            {sender_id : data.sender_id , receiver_id : data.receiver_id},
            {sender_id : data.receiver_id, receiver_id : data.sender_id}
        ] })

        socket.emit('loadFiles', {files})
    })


})


    // WebSocket setup using 'ws'





module.exports = socketapi