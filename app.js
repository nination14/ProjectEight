const express = require('express');
const bodyParser = require('body-parser');

const routes = require('./routes/index');
const books = require('./routes/books');

const app = express();


// view engine setup
app.set('view engine', 'pug');

//setting up middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/static", express.static('public'));

app.use('/', routes);
app.use('/books', books);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('page-not-found');
});

// // error handlers

// showing the error
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.locals.message = err.message;
    res.locals.error = err;
    res.render('error');
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });

}

module.exports = app;