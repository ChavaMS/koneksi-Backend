'use strict'

var express = require('express');
var UserController = require('../controllers/user');
var md_auth = require('../middlewares/authenticate');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'});
var api = express.Router();

api.get('/pruebas',UserController.pruebas);
api.get('/home',UserController.home);

module.exports = api;