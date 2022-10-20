var express = require("express");

//const config = process.env;

var keys = require("../config/keys");
var jwt = require("jsonwebtoken");

const verifyToken = express.Router();

verifyToken.use((req, res, next) => {
    const token = req.headers['access-token'];
 
    if (token) {
      jwt.verify(token, keys.key, (err, decoded) => {      
        if (err) {
          return res.json({ mensaje: 'Token inválida' });    
        } else {
          req.decoded = decoded;    
          next();
        }
      });
    } else {
        res.send({ 
          mensaje: 'Token no proveída.' 
        });
    }
});


module.exports = verifyToken;
