const messageModel = require('../models/messageModel.js');
const conversationModel = require('../models/conversationModel.js');



const addNewMessage = async (req,res)=>{
    try {
        const newMessage = new messageModel(req.body)
        await newMessage.save()
        const conversationId = req.body.conversationId
        const newText = req.body.text

        // ye last vala message dikhayega
        await conversationModel.findByIdAndUpdate( conversationId , { message : newText}, {new : true})

        return res.status(200).json('message save sucecssfully')
    } catch (error) {
        console.log('error while newMessage' + error.message)
    }
}

const getMessages = async (req,res)=>{
    try {
        const messages = await messageModel.find({conversationId : req.params.id})
      //  console.log(messages)
        res.status(200).json(messages)

    } catch (error) {
        return res.status(500).json(error.message)
    }
}

module.exports = {
     addNewMessage, getMessages
}