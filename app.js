var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var expressSession = require('express-session')
var passport = require('passport')
var indexRouter = require('./routes/index');
var userModel = require('./models/userModel');
const MongoStore = require('connect-mongo');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// passport setup
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: 'billi aai dilli',
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// gAuth setup
app.use(expressSession({
  secret: 'billi gai dilli',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl : 'mongodb://127.0.0.1:27017/whatsapp-clone',
    autoRemove : 'disabled'
  }),
  cookie : {
    // maxAge : 24*60*60*1000   //1 day, time in milisec, 1 sec == 1000ms
  }
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

app.use('/', indexRouter);
app.use('./models/userModel.js', userModel);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
