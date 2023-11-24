const { response } = require('express');
const userModel = require('../models/userModel.js');
const chatModel = require('../models/chatModels.js');
const groupModel = require('../models/groupModel.js');
const memberModel = require('../models/memberModel.js');
const groupChatModel = require('../models/groupChatModel.js')
const socketApi = require('../socketapi.js');

const qs = require('qs')
const mongoose = require('mongoose');
const userChatModel = require('../models/userChatModel.js');

async function saveChat(req,res,next){
    try {
      var newChat =  new chatModel({
          sender_id: req.body.senderId,
          receiver_id : req.body.receiverId,
          message : req.body.message
       })

       var newUserChat =  await newChat.save()

       res.status(200).json(newUserChat)

    } catch (error) {
        res.status(400).send({success : false, msg : error.message})
        console.log(error.message)
    }
}

 async function getGroup(req,res,next){
       try {

       var groups = await groupModel.find({creator_id : req.user._id}).populate('creator_id')
    //    console.log(groups);
        res.render('group' , {groups, logInUser : req.user})

       } catch (error) {
        console.log('err while createing group' + error.message);
       }
 }

 async function createAGroup(req,res,next){
     try {
      const logUser = await req.user;
      // console.log('nice user'+ logUser);
       var newGroup = new groupModel({
        creator_id : logUser._id,
        name : req.body.groupName,
        limit : req.body.limit
       })
      
       await newGroup.save();

       res.redirect('back')
     } catch (error) {
      console.log('err while creating group' + error.message);
     }
 }

 async function getMembers(req,res,next){
    try {
    // var users = await userModel.find({_id : {$nin : [req.user._id]}})

    var users = await userModel.aggregate([
        {
          $lookup:{
            from : "members",
            localField : "_id",
            foreignField : "user_id",
            pipeline:[
                {
                    $match : {
                        $expr :{
                            $and :[
                                {$eq : ["$group_id", new mongoose.Types.ObjectId(req.body.group_id)]}
                            ]
                        }
                    }
                }
            ],
            as : "member"
          }
        },
        {
         $match : {
            '_id' : 
            {$nin : [ new mongoose.Types.ObjectId(req.user._id)]}
        }
        }
    ])

 //    console.log(groups);
     res.status(200).send({status: true, data : users, msg : 'getting data successfully'});

    } catch (error) {
     console.log('err while finding member group' + error.message);
    }
}

 async function addMembers(req,res,next){
    try {

        const formData= qs.parse(req.body)
        console.log(formData);

    if(!formData.members  || formData.members.length === 0){
        res.status(200).send({status : false, msg : 'select atleast one member'})
    }
    else if(formData.members.length > parseInt(formData.limit)){
         res.status(200).send({status : false, msg : 'member limit exceeded ' + formData.limit})
    }
    else{
        await memberModel.deleteMany({group_id : formData.group_id})

        var data = []
        let members = formData.members;
        members.forEach((elem)=>{
            data.push({
                group_id : formData.group_id,
                user_id : elem,
        })
        })
       console.log(data);
       await memberModel.insertMany(data)
       

        res.status(200).send({status: true, msg: 'member added successfully'});
    }
    } catch (error) {
     console.log('err while adding member to group' + error.message);
    }
}

async function groupChats(req,res,next){
    try {
        const myGroups = await groupModel.find({creator_id : req.user._id})
        const joinedGroups =await  memberModel.find({user_id : req.user._id}).populate('group_id')

        res.render('group-chat', {myGroups, joinedGroups, logInUser : req.user})

    } catch (error) {
        console.log(error.message);
    }
}

async function saveGroupChats(req,res,next){
    try {
        
        const newChat = new groupChatModel({
            sender_id : req.body.senderId,
            group_id : req.body.group_id,
            message : req.body.message,
        })

        // admin ki id nikalo group details se
        const group = await groupModel.findOne({_id : req.body.group_id })
        const users = await memberModel.find({group_id : req.body.group_id})

        let adminId = group.creator_id;

        let usersInGroup = users.map((user)=>{
            return user.user_id
  })

       usersInGroup.push(adminId);

       const filteredUsers = usersInGroup.filter(objId => !objId.equals(req.body.senderId));

    //    console.log(filteredUsers);

        // console.log('line 12');
        // console.log(adminId);

        filteredUsers.forEach( async (user_id)=>{
               const userMessage = new userChatModel({
                    user_id : user_id,
                    message_id : newChat._id,
                    group_id : req.body.group_id,
                    read : false
               });
               await userMessage.save();
        })

        await newChat.save()
        // socketApi.io.of('/user-namespace').emit('newGrpChat', {group_id : req.body.group_id})
        
        res.send({ success : true, chat : newChat})

    } catch (error) {
        res.send({success : false, msg : error.message})
    }
}

async function loadGroupChats(req,res){
    try {
        
    const groupChats =await groupChatModel.find({group_id : req.body.group_id}).populate('sender_id')

        res.send({success : true, groupChats})
    } catch (error) {
        res.send({success : false, msg : error.message})
    }
}

async function updateLastRead(req,res){
     try {
        const logInUser = req.user
        const group_id = req.params.group_id

        await userChatModel.updateMany(
           { group_id : group_id, user_id : logInUser._id},
           { read: true }
        )

        res.send('successfully ho gya last seen for that group')
     } catch (error) {
        res.send('err while updating last msg' + error.message)
     }
}

async function unreadMsgAndLastMsg(req,res){
     try {
        const logInUser = req.user;
        const group_id = req.params.group_id;
   
        // getting all unread msg for login user
        const unreadCount = await userChatModel.countDocuments({
             group_id,
             user_id : logInUser._id,
             read : false
        })

        // getting last unread msg for login user
        const lastMessage = await groupChatModel.findOne({group_id})
        .sort({createdAt : -1})
        .limit(1)
        .populate('sender_id')


        console.log(unreadCount+  'count');

        res.json({ unreadCount, lastMessage });

     } catch (error) {
        res.send('err while getting last msg and msg count' + error.message)
     }
}

async function allGroupID(req,res){
    try {
        let group_ids = [];
        const group = await groupModel.find()
         group.forEach((elem)=>{
            group_ids.push(elem._id);
         })
        // console.log(group_ids);
        res.send( group_ids)

    } catch (error) {
        res.send('unable to fetch group id' + error.message)
    }
}


module.exports =  {
    saveChat, 
    getGroup, 
    createAGroup,
    allGroupID,
    getMembers,
    addMembers,
    groupChats,
    saveGroupChats,
    loadGroupChats,
    updateLastRead,
    unreadMsgAndLastMsg,
    

}