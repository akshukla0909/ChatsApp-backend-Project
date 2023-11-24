const userModel = require('../models/userModel.js');
const passport = require('passport');

// local strategy
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(userModel.authenticate()))


const registerNewUser = async (req,res,next)=>{
     try {
      const user = await userModel.findOne({email : req.body.email})

      if(user){
       return res.send('<script>alert("a user already exists."); window.location="/";</script>');
         //  res.send("user already exist")
      }
      else {
       var newUser = new userModel({
         // fields here
         username : req.body.username,
         email : req.body.email,
      })
      userModel.register(newUser, req.body.password)
      .then(function(u){
       passport.authenticate('local')(req,res, function(){
         res.redirect('/profile')
       })
      })
   }
     } catch (error) {
      console.log(error.message);
     }
}

module.exports = {
    registerNewUser
}