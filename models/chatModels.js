const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    sender_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    receiver_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    message : {
        type : String,
        require : true,
    },
    isRead : {
        type : Boolean,
        default : false
    }
},
{timestamps : true }
)

module.exports = mongoose.model('chat', chatSchema)