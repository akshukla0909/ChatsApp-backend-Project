const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    conversationId : {
        type : String
    },
    senderId : {
        type : String
    },
    recieverId : {
        type : String
    },
    text : {
        type : String
    },
    type : {
        type : String
    }
},
  {timestamps : true}  
)

module.exports = mongoose.model('message', messageSchema)