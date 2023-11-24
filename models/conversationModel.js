const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
    members : {
        type : Array //isme sender and reciever dono ki id
    },
    message : [{
        type : String
    }] ,
    timeStamp : {
        type : Date,
        default : Date.now
    },
    isRead : {
        type : Boolean,
        default : false
    },
    media : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'attachment'
        //alg se bana lo schema attachment
       }
    ]   
}, {timestamps : true}) //last vale top pe aisa kuch

module.exports = mongoose.model('conversation', conversationSchema)
