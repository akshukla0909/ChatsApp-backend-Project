const mongoose = require('mongoose');
const plm = require('passport-local-mongoose')

const userSchema = mongoose.Schema({
     username : {
      type : String 
     },
     is_online  : {
      type : String ,
      default : '0'
     },
     email : {
      type : String,
      unique : true
     },
     password : String,
     profilePic : {
      type : String,
      default : '../images/def'
     },
     contacts : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user'   //dusre user se relation 
        }
     ],
     lastSeen : {
        type : Date
     },
},
{timestamps : true } 
)


userSchema.plugin(plm)
module.exports = mongoose.model('user', userSchema)
