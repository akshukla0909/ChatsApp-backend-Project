const mongoose = require('mongoose');
const { read } = require('node-id3');

const userChatSchema = mongoose.Schema({
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    message_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'groupChat'
    },
    group_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'group'
    },
    read : {
        type : Boolean,
        default : true
    }
    
},
{timestamps : true }
)

module.exports = mongoose.model('userChat', userChatSchema)