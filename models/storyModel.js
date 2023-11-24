const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
    filename : String,
    size : Number,
    mimetype : String,
    filePath : String,
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    expiryTime: {   
        type: Date,
        default: () => new Date(+new Date() + 24 * 60 * 60 * 1000), // 24 hours by default
        // 24 * 60 * 60 * 1000
    },
    likes : [
         {type : mongoose.Schema.Types.ObjectId,
             ref  : "user"}
        ],
    privacy: {
        type: String,
        enum: ['public', 'private', 'custom'], // Example privacy settings
        default: 'public',
    },
   
},
  {timestamps : true}
)

module.exports = mongoose.model('story', storySchema)

