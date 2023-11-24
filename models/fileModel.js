const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    filename : String,
    size : Number,
    mimetype : String,
    filePath : String,
    sender_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    receiver_id :{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
},
  {timestamps : true}
)

module.exports = mongoose.model('file', fileSchema)

