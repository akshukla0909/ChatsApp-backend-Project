var express = require('express');
var router = express.Router();
var userModel = require('../models/userModel.js');
const passport = require('passport');
var GoogleStrategy = require('passport-google-oidc');
const { default: mongoose } = require('mongoose');
require('dotenv').config()
const cookieParser = require('cookie-parser');
router.use(cookieParser())
const fileModel = require('../models/fileModel.js');
const storyModel = require('../models/storyModel.js');


const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(userModel.authenticate()))

const userController = require('../controllers/userController.js');

// multer var init
const crypto = require('crypto');
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const fs = require('fs');
const { Readable } = require('stream')


mongoose.connect('mongodb+srv://akashshukla0887:8yTSWoz1Uy208vzl@cluster0.9ruacd0.mongodb.net/?retryWrites=true&w=majority')
.then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
  console.log(err);
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// create group
router.get('/groups', isLoggedIn, userController.getGroup)
router.post('/newGroup', isLoggedIn, userController.createAGroup)

router.post('/get-members', isLoggedIn, userController.getMembers)
router.post('/add-members', isLoggedIn, userController.addMembers)

// it will show all join and created in front end side
router.get('/group-chat', isLoggedIn, userController.groupChats)

router.post('/group-chat-save', isLoggedIn, userController.saveGroupChats)
router.post('/load-group-chats', isLoggedIn, userController.loadGroupChats)


// req to get all group id
router.get('/all-group-id', isLoggedIn, userController.allGroupID)

// req to update last read true
router.post('/updateLastRead/:group_id', isLoggedIn, userController.updateLastRead)

// req to give last msg and unread msg count 
router.get('/msg-count-last-msg/:group_id', isLoggedIn, userController.unreadMsgAndLastMsg)


// vid call
router.post('/indi2', isLoggedIn,async(req, res) => {
  try {
    logInUser = req.user
    // const callUsername = req.body.callUsername; 
    const callId = req.body.callId; 

    var callUser = await userModel.findById(callId)

    console.log(callUser);
    res.render('indi2', {callUser, logInUser}); 

  } catch (error) {
    console.log(error.message);
    res.status(500).send('Error rendering indi2');
  }
});



// save chat one to one
router.post('/save-chat', userController.saveChat)

// api to get login user details to front end side
router.get('/api/user', isLoggedIn, (req,res)=>{
  try {
    const logUser = req.user;
    res.json(logUser)
  } catch (error) {
     console.log(error.message);
  }
})

// main profile page
router.get('/profile', isLoggedIn, async (req,res,next)=>{
  const allUsers =   await userModel.find( {_id : {$nin : [req.user._id]}})
  const logInUser = req.user;
  console.log(logInUser);
  
  res.render('profile' , { logInUser, users : allUsers})
})


// register route
const register = require('../controllers/register-controller.js');
const chatModels = require('../models/chatModels.js');
router.post('/register', register.registerNewUser)


router.get('/login', (req,res,next)=>{
   try {
    res.render('login')
   } catch (error) {
    console.log(error.message);
   }
})

router.post('/login', passport.authenticate('local',
   {  
     successRedirect : '/profile',
     failureRedirect : '/'
   } 
))

router.get('/logout', function(req,res,next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req,res,next){
   if (req.isAuthenticated()){ 
  return next();
   }  else { 
       res.redirect('/') 
   }
}

// multer start

const conn = mongoose.connection

var profileImgBucket;
var fileBucket;
var storyBucket;
conn.once('open', ()=>{
    profileImgBucket = new mongoose.mongo.GridFSBucket(conn.db,{
      bucketName : 'profilePic'
    });
    fileBucket = new mongoose.mongo.GridFSBucket(conn.db,{
      bucketName : 'file'
    });
    storyBucket = new mongoose.mongo.GridFSBucket(conn.db,{
      bucketName : 'story'
    })
})

// story
router.get('/story', isLoggedIn, async function(req,res,next){
  try{
    const logInUser = req.user;

  const senderChats = await chatModels.find({ sender_id: logInUser._id }).distinct('receiver_id');
  const receiverChats = await chatModels.find({ receiver_id: logInUser._id }).distinct('sender_id');
  
  const uniqueUserIDs = [...new Set([...senderChats, ...receiverChats])];

  // Find stories from users with whom the logged-in user has interacted
  const allStory = await storyModel.find({ user_id: { $in: uniqueUserIDs } }).populate('user_id');
  const myStory = await storyModel.find({ user_id: req.user._id });

  res.render('story', { logInUser, allStory, myStory });
  console.log(allStory);
  
  } catch (error) { console.log(error.message);}
})

router.post('/story-upload', isLoggedIn,upload.single('file') ,function(req,res,next){
  
    try {
  const { originalname, size, mimetype } = req.file;
    
  const randomName = crypto.randomBytes(20).toString('hex')
  const writeStream = storyBucket.openUploadStream(randomName + '-' + 'story')
  Readable.from(req.file.buffer).pipe(writeStream)
  var logInUser = req.user

  writeStream.on('finish', async ()=>{
      const newStory = new storyModel({
            filename : originalname,
            size : size,
            mimetype : mimetype,
            filePath : randomName + '-' + 'story',
            user_id : logInUser._id
      })
      await newStory.save();
      res.status(200).json({msg : 'story saved in db', newStory})
  })
} 
catch (error) { console.log('err while sving story' + error.message);}
  
})

//render story
router.get('/story/:storyid', async (req, res) => {
  try {
    const storyid = req.params.storyid;

    const readStream = await storyBucket.openDownloadStreamByName(storyid);
    readStream.pipe(res);
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).send('Error retrieving file');
  }
});


 // file upload
router.post('/file-upload', isLoggedIn, upload.single('file'),async (req,res)=>{
   try {
  const { originalname, filename, size, mimetype } = req.file;
  const randomName = crypto.randomBytes(20).toString('hex')

   const writeStream = fileBucket.openUploadStream(randomName +'-' + originalname)
   Readable.from(req.file.buffer).pipe(writeStream);

    writeStream.on('finish', async()=>{
      const newFile = new fileModel({
        filename : originalname,
        size : size,
        mimetype : mimetype,
        filePath : randomName +'-' + originalname,
        sender_id : req.user._id,
        receiver_id : req.body.receiverId
      })
    await newFile.save();
    res.status(200).send({msg: 'File uploaded successfully', newFile });
    })

   } catch (error) { console.log('err while saving file'+ error.message) }

})
// render file 
router.get('/file/:fileid', async (req, res) => {
  try {
    const fileid = req.params.fileid;

    const readStream = await fileBucket.openDownloadStreamByName(fileid);
    readStream.pipe(res);
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).send('Error retrieving file');
  }
});

router.post('/uploadImg', isLoggedIn, upload.single('profilePic') ,async function(req,res,next){
  try {
      const user = await userModel.findOne({_id : req.user._id})
      const randomName = crypto.randomBytes(20).toString('hex')
    
     let profilePic = req.user
     const writeStream = profileImgBucket.openUploadStream(randomName + profilePic.username)
     Readable.from(req.file.buffer).pipe(writeStream);
 
     writeStream.on('finish', async () => {
     user.profilePic = randomName + profilePic.username;
               await user.save();
               res.redirect('back');
   })
 }
    catch (error) { console.log(error.message + 'err while image upload');}

})
// render img
router.get('/profile/:filename', (req, res) => {
  // Retrieve the requested image from the database and send it as a response
  try {
    const filename = req.params.filename;
  const readStream = profileImgBucket.openDownloadStreamByName(filename);
  readStream.pipe(res);
  } catch (error) {
    console.log(error.message + "err while getting profile img");
  }
});
// multer end



// gAuth setup
passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: ['profile' ,'email']
}, async function verify(issuer, profile, cb) {

    try {
      const userEmail = profile.emails[0].value;
      console.log(userEmail);
      
     const existingUser = await userModel.findOne({email : userEmail})
 
    //  agr user mil jaye to us user ke sath return nhi mile to naya user bana lena
     if(existingUser){
      return cb(null, existingUser)
     }
     else {
      // const newUser = new userModel({
      //   username : profile.displayName,
      //   email : userEmail
      // })
      // await newUser.save()
      return cb(null, false, {message : "please register first"})
      // return cb(null, newUser)
     }
    } catch (error) {
       return cb(error)
    }

}));

// actual route to handle auth
router.get('/login/federated/google', passport.authenticate('google'))

// redirect vala app
router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));


module.exports = router;
