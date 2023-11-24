  
 // chat yes vala code 1 display user
chatYes = document.getElementsByClassName("chat-yes")
chatNo = document.getElementsByClassName("no-chat")
chatYesName = document.getElementById("chat-yes-name")
chatYesImg = document.getElementById("chat-yes-img")

let isChatWindowOpen = false;
var messageSendInp = document.querySelector("#message");

var senderId;
var receiverId;


function scrollToBottom() {
    
    var chatContainer = document.getElementById("chat-window");
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


fetchData()
async function fetchData(){
   try {
   var response =  await axios.get('/api/user') 
   //console.log(response.data._id);
    senderId =  response.data._id 

    initSocket();
   } catch (error) {
    console.log('error data lene me' + error.message);
   }
}

// Initialize Socket.IO with authentication token
function initSocket(){
    var socket = io('/user-namespace', {
        auth: { token: senderId }
      }); 

// Click event for each user box
$(document).ready(function(){

    $('.each-user-box').click(function(){
  
      isChatWindowOpen = true;
      chatYes[0].style.opacity = '1';
      // chatNo.style.display = 'none';
      messageSendInp.focus();
  
      // Get the receiver's ID from the clicked user box
      receiverId = $(this).attr('data-id');
  
      // Emit existsChat event to check if there are existing chats
      socket.emit('existsChat', { sender_id: senderId, receiver_id: receiverId });
    });
  });
//   doc load and click each group box ends here
  
  // Online status events
  socket.on('getOnline', function(data){
    $(`#${data.userId}-status`).removeClass('offline-status').addClass('online-status');
  });
  
  // Offline status events
  socket.on('getOffline', function(data){
    $(`#${data.userId}-status`).removeClass('online-status').addClass('offline-status');
  });
  
  // Input event for the message input field
  document.querySelector("#message").addEventListener('input', function(e){
    userMessage = e.target.value;
  });
  
  // Keypress event for the chat form
  $('#chat-form').keypress(function(e){
    if (e.key === 'Enter') {
      e.preventDefault();
  
      if (userMessage) {
        const data = {
          senderId: senderId,
          receiverId: receiverId,
          message: userMessage
        };
  
        // Save the chat on the server
        axios.post('/save-chat', data)
          .then(function(resp){
            let chat = resp.data;
  
               // Format the timestamp for display
      const timestamp = new Date(chat.createdAt);
      const displayHours = timestamp.getHours() % 12 || 12;
      const displayMinutes = (timestamp.getMinutes() < 10 ? '0' : '') + timestamp.getMinutes();
      const ampm = timestamp.getHours() >= 12 ? 'pm' : 'am';
  
  
            let html = `<div class="log-chat">
              <span class="message-text">${chat.message}</span>
              <span class="message-time">${displayHours}:${displayMinutes} ${ampm}</span>
              </div>`;
            $('#chat-container').append(html);
  
            // Emit newChat event to notify the server and other clients
            socket.emit('newChat', resp.data);
  
            scrollToBottom()
  
          })
          .catch(function(err){
            console.log('Error while sending a new message: ' + err.message);
          });
  
        // Clear the message input field
        messageSendInp.value = '';
      }
    }
  });
//   messege sending and save chat ends here 
  

  // Receiving a private message
  socket.on("loadNewChat", function(data){
    // console.log("Received a new private message:", data);
    const { sender_id, message, receiver_id , createdAt, _id} = data;
    
    // message read event 
    if (isChatWindowOpen && sender_id === receiverId && receiver_id === senderId) {
      socket.emit('markRead', { sender_id, receiver_id, _id });
      console.log('han hai');
  
    }
    
  
    if (sender_id === receiverId && receiver_id === senderId) {
  
      const timestamp = new Date(createdAt);
      const displayHours = timestamp.getHours() % 12 || 12;
      const displayMinutes = (timestamp.getMinutes() < 10 ? '0' : '') + timestamp.getMinutes();
      const ampm = timestamp.getHours() >= 12 ? 'pm' : 'am';
  
      let html = `<div class="inverse-chat">
        <span class='message-text'>${message}</span>
        <span class="message-time">${displayHours}:${displayMinutes} ${ampm}</span>
  
        </div>`;
      $('#chat-container').append(html);
  
    }
    scrollToBottom()
  });
//   recieving private messeg ends here


  // Load old chats
  // will undertand much better later
  socket.on('loadChats', function(data){
    $('#chat-container').html('');
    var chats = data.chats;
    let html = '';
  
    chats.forEach((chat)=>{
        
      const timestamp = new Date(chat.createdAt);
      const displayHours = timestamp.getHours() % 12 || 12;
      const displayMinutes = (timestamp.getMinutes() < 10 ? '0' : '') + timestamp.getMinutes();
      const ampm = timestamp.getHours() >= 12 ? 'pm' : 'am';
  
      let addClass = chat.sender_id === senderId ? 'log-chat' : 'inverse-chat'
  
       html = `
        <div class='${addClass}'>
          <span class="message-text">${chat.message}</span>
          <span class="message-time">${displayHours}:${displayMinutes} ${ampm}</span>
        </div>`;
  
        $('#chat-container').append(html);
    })
    
  
    scrollToBottom();
  });
  
// chat one  to one logic ends here 
}
// init socket fn ends here




