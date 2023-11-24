// const app = require('./app.js');
// const http = require('http');

// const server = http.createServer(app);

const WebSocket = require('ws').Server; // Include WebSocket library

// const wss = new WebSocket.Server({ server }); 
var wss = new WebSocket({
    port : 8000
})

var users = {}

wss.on('connection', function connection(conn) {
  console.log('A user connected via WebSocket');

  conn.on('message', function(message) {

    var data;

    try {
       data = JSON.parse(message)
    } catch (error) {
        console.log(error.message);
    }
    switch(data.type){

        case 'online' : 
        users[data.name] = conn;
        conn.name = data.name;

        sendToOtherUser(conn, {
            type : 'online',
            success : true
        })
        break;
        case 'offer' :

            var connect = users[data.name];

           if(connect !== undefined){
 
            // console.log('conn' , connect);
            // console.log("prnt" , users);
            if(connect !== null ){
                conn.otherUser = data.name;  //ex- rahul
                // console.log(data.offer);
                sendToOtherUser(connect, {
                    type : 'offer',
                    offer : data.offer,
                    name : conn.name ,
                    image : data.image,  //jo offer create krega
                } )
            } 
            // else{
            //     sendToOtherUser(conn, {
            //         type : 'not_available',
            //         name : data.name
            //     })
            // }

           }else {
            console.log('User not found or not connected:', data.name);
            // sendToOtherUser(conn, {
            //     type: 'not_available',
            //     name: data.name
            //   });
           }
            break;

            case 'answer' :
               var connect  = users[data.name]
            //    login user ka offer answer
              if(connect !== null){
                conn.otherUser = data.name;

                sendToOtherUser(connect,{
                    type : 'answer',
                    answer : data.answer
                });
              }
                break;

              case 'candidate' :
               
                  var connect = users[data.name];
                  if(connect !== null){
                    sendToOtherUser(connect, {
                        type : 'candidate',
                        candidate : data.candidate
                    })
                  }
               
              break;

              case 'reject' : 
                  var connect = users[data.name];
                  if(connect !== null){
                    sendToOtherUser(connect, {
                        type : 'rejct',
                        name : conn.name
                    })
                  }
              break;

              case 'accept' : 
                  var connect = users[data.name];
                  if(connect !== null){
                    sendToOtherUser(connect, {
                        type : 'accept',
                        name : conn.name
                    })
                  }
              break;

              case 'leave' : 
                  var connect = users[data.name];
                  connect.otherUser = ''
                  if(connect !== null){
                    sendToOtherUser(connect, {
                        type : 'leave',
                    })
                  }
              break;
              default : 
              sendToOtherUser(connect, {
                type : 'error',
                message : data.type + "not found"
            })

    }
  });

//   when user disconnect
  conn.on('close', function() {
    console.log('A user disconnected from WebSocket');
  });

});

function sendToOtherUser(connection, message){
    try {
        connection.send(JSON.stringify(message));
    } catch (error) {
        console.error('Error sending message:', error.message);
    }

}



module.exports = wss;
