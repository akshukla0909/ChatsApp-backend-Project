const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
    creator_id :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    name : {
        type : String,  //group name
        required : true     
    }, 
    profilePic : {
        type : String,
        default : '../images/grp'
    },
    limit : {
      type : Number,
      required : true
    },
    members : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'member'
    }],
    messages : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'groupChat'
    }],
 },
 {timestamps : true}
)

module.exports = mongoose.model('group', groupSchema) 