const conversationModel = require('../models/conversationModel.js');

 const initiateConversation = async(req,res)=>{
    try {
        const senderId = req.body.senderId;
        const recieverId = req.body.recieverId;
     //   console.log('sender: '+ senderId)
       // console.log(recieverId)

        const exist  = await conversationModel.findOne({members  : {$all : [recieverId,senderId]} })

        if(exist){
            console.log('conversation al exist');
            return res.status(200).json('conversation al exist');
        } else {
            const newConversation = new conversationModel({
                members : [senderId, recieverId],
                message : []
            })
            await newConversation.save()
            return res.status(200).json('conversation saved alright');

        }
    } catch (error) {
        console.log(error);
    }
}

const  getConversation = async (req,res)=>{
      try {
        const senderId = req.body.senderId;
        const recieverId = req.body.recieverId;
        
        let conversation = await conversationModel.findOne({members : {$all : [recieverId, senderId]}})
        return res.status(200).json(conversation)
      } catch (error) {
        return res.status(500).json(error.message)
      }
}



module.exports = {
     initiateConversation, getConversation
}