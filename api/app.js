var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var carrerasRouter = require('./routes/carreras');
var materiasRouter = require('./routes/materia');
var alumnosRouter = require('./routes/alumno');
var alumnosMateriasRouter = require('./routes/alumnosMaterias');
var profesoresRouter = require('./routes/profesor');

var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var keys = require('./config/keys');

var app = express();

// json web token
app.set("key", keys.key);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/login", (req, res) => {
  if (req.body.usuario === "admin" && req.body.pass === "12345") {
    const payload = {
      check: true
    };
    const token = jwt.sign(payload, app.get('key'), {
      expiresIn: '1d'
    });
    res.json({
      mensaje: 'Autenticación correcta',
      token: token
    });
  }else {
      res.json({ mensaje: "Usuario y/o contraseña incorrectos" })
    }
  });



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/car', carrerasRouter);
app.use('/mat', materiasRouter);
app.use('/prof', profesoresRouter);
app.use('/alu', alumnosRouter);
app.use('/alumat', alumnosMateriasRouter);
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
