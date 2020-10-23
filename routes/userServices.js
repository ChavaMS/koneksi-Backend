'use strict'
 

//EN USO
var express = require('express');
var UserServicesController = require('../controllers/userServices');
var api = express.Router();

api.put('/updateUserServices/:id', UserServicesController.updateUserServices);

api.post('/saveUserServices', UserServicesController.saveUserServices);

module.exports = api;