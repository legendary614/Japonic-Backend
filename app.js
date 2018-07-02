var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var passport = require('passport'); // import express passport
var bodyParser = require('body-parser');
var cors = require('cors');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var fs = require('fs');
var morgan = require('morgan');
var rfs = require('rotating-file-stream');
var logDirectory = path.join(__dirname, 'log');

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
// var accessLogStream = rfs('japonic.log', {
//   interval: '1w', // rotate daily
//   path: logDirectory
// });

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// setup the logger
// app.use(morgan('combined', {stream: accessLogStream}))
// app.use(require('express-bunyan-logger')({
//   name: 'Japonic',
//   streams: [{
//     type: 'rotating-file',
//     level: 'info',
//     path: logDirectory + '/japonic.log',
//     period: '1w',   // weekly rotation
//     count: 3,        // keep 3 back copies
//   }]
// }));
app.use('/', index);
app.use('/users', users);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
