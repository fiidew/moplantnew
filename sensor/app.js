var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/database');
var cors = require('cors')




mongoose.connect(config.database, {
  useNewUrlParser: true}).then(
    () => {console.log('MongoDB Connect') },
    err => { console.log('Error Connected to mongoDB' + err)});
mongoose.set('useCreateIndex', true);

var api = require('./routes/api');
var tanaman = require('./routes/tanaman');
var perangkat = require('./routes/perangkat');
var cuaca = require('./routes/cuaca');
var app = express();
// var server = app.listen(3000);
// var io = require('socket.io').listen(server);
//app.use(cors())
//app.options('*', cors())
// view engine setup
// app.all('/*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   next();
// });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Content-Type", "application/json");
  next();
});


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(passport.initialize());

app.get('/', function(req, res) {
  res.send('Page under construction.');
});

app.use('/api/user', api);
app.use('/api/tanaman', tanaman);
app.use('/api/perangkat', perangkat);
app.use('/api/cuaca', cuaca)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
