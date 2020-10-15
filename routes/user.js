'use strict'


//EN USO
var express = require('express');
var UserController = require('../controllers/user');
var api = express.Router();


//SIN USO
//var md_auth = require('../middlewares/authenticate');
var multipart = require('connect-multiparty');
//var md_upload = multipart({uploadDir: './uploads/users'});

api.get('/pruebas', UserController.pruebas);
api.get('/home', UserController.home);
api.post('/saveUser', UserController.saveUser);
api.post('/updateCoverPage', UserController.updateCoverPage);

module.exports = api;