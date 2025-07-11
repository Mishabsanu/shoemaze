var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');
var hbs=require('express-handlebars')
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var db=require('./config/connection')
var session=require('express-session')
var app = express();
require('dotenv').config()
var fileUpload = require('express-fileupload');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"Key",resave:false,saveUninitialized:true,cookie:{maxAge:10000000}}))
db.connect((err)=>{
  if(err)
  console.log("Connection Error"+err);
  else console.log("Database connected succesfully")
})
app.use(fileUpload())
app.use('/', userRouter);
app.use('/admin', adminRouter);
// require('dotenv').config()


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

// app.listen(process.env.PORT)

module.exports = app;
