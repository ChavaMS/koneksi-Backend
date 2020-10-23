'use strict'
 
//EN USO
var express = require('express');
var UserController = require('../controllers/user');
var api = express.Router();
var md_auth = require('../middlewares/authenticate');

//RUTAS GET
api.get('/pruebas', UserController.pruebas);
api.get('/home', UserController.home);
api.get('/get-image-profile/:imageFile', UserController.getImageProfile);
api.get('/get-image-cover/:imageFile', UserController.getImageCover);

//RUTAS PUT
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);

//RUTAS POST
api.post('/login', UserController.loginUser);
api.post('/saveUser', UserController.saveUser);
api.post('/updateCoverPage', UserController.updateCoverPage);


module.exports = api;