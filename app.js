const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
//Implement connect flash to message in a sesson and displays after redirect
const flash =  require('connect-flash');
const session  = require('express-session');


//Passport config
require('./config/passport')(passport);

//DB CONFIG
const db =  require ('./config/keys').MongoURI;

//CONNECT TO  MONGO
mongoose.connect(db)
    .then(()  => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

   const app = express();

//Express session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' } ,
  cookie: { secure: true }
}));

//passportmiddlewware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

//Global variables(Adding a middleware): Makes the error message colors appealing eg red for error and yellow for succes
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  
  next();
});

app.use(express.static(path.join(__dirname, 'public')));


//EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
  
//bodyparseR
app.use(express.urlencoded({extended: false}));

//routes
app.use('/',  require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 2000;

app.listen(PORT, console.log(`Server started on ${PORT}`));
