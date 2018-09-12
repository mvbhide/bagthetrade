var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');
var stocks = require('./routes/stocks');
var orders = require('./routes/orders');
var marketwatch = require('./routes/marketwatch');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'sdlfjljrowuroweu',
  cookie: { secure: false }
}));
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
	var allowedOrigins = ['https://trade.bookprofits.in', 'http://localhost:4200'];
  var origin = req.get('origin');
  
	if(allowedOrigins.indexOf(origin) > -1){
 		res.setHeader('Access-Control-Allow-Origin', origin);
	}

    //res.setHeader('Access-Control-Allow-Origin', 'https://trade.bookprofits.in');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dist/',express.static(path.join(__dirname, 'views/dist/')));

app.use('/', index);
app.use('/orders', orders);
app.use('/stocks', stocks);
app.use('/marketwatch', marketwatch);
app.use('/users', users);

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
