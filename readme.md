
a.Users one to one private chat kr sakte hain.
b. Users group create krke group chat kr sakte hain.
c. User text and files share kr sakten hain chats me.
d. Users apna status laga sakte hain for 24 hours and dusre uesrs use
dekh sakte hain, agar unhone pehle kabhi chat ki hogi toh.
e. User ne jo message nhi dekha hai abhi tk toh usse wo message us 
chat ke tile pr dikhna chahiye. Jesa image dikh rha hai ki apne 
frineds Group me apne 4 messages nhi dekhe hain , aur last message kya hai

Schema
     userSchema --
        username -- unique 
        email -- ek email hona chahiye
        password -- hash
        profilePic -- ref to user profilePic 
        contact -- []
        userStatus-- online/offline
        currentStatus -- at the gym
        lastSeen -- offline/online, active yesterday
        settings -- notifications,
        theme --


    messageSchema--
        sender-- userId
        recipient -- jisko bheja uska bhi id rakho
        content -- message me kya likha gya hai
        timeStamp -- kab message bheja
        isRead -- seen/ unseen
        media -- message me media jo bheji gayi hai unka ref[]

    --so additionaly attachment schema bhi bna lo seprate 

    attachmentSchema--
        file_type -- file kaise img,video etc
        file-url -- optional
        timeStamp    

    chatgroupSchema(if group chat)--
       name -- group ka name
       members-- sare user aur unki id []
       messages-- []
       createdAt -- jab bna tb ki date 

    storyUpdateSchema
       user -- jisne story dali uski id
       content -- story ka type/content -- image/text/video
       timestamp --
       viewers  --  array of userid jinhone story dekhi-- []
       expires At -- kab expire ho jayegi uska time stamp de dena



    extra feature -- audio message/ video call/payment and transaction /  


    audio/ video call support ke liye hum ek call schema ban lenge
    const callSchema = new Schema({
  caller: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model for the caller
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model for the receiver
  },
  callType: String, // 'audio' or 'video'
  callStatus: String, // 'incoming', 'outgoing', 'in-progress', 'ended', etc.
  timestamp: Date,
  // Other relevant fields for call data
});


aur .. userSchema me -- incoming and outgoing field dal denge const userSchema = new Schema({
  // Other user fields
  incomingCalls: [{
    type: Schema.Types.ObjectId,
    ref: 'Call',
  }],
  outgoingCalls: [{
    type: Schema.Types.ObjectId,
    ref: 'Call',
  }],
});

logic for chat voice support -- user schema me incoming aur outgoing voice message field dal ke ek voice mesaage schema bna lenge 




webrtc

4.
5. peerRTC conn
6. create and send offer
7. 