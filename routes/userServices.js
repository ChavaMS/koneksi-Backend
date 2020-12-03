'use strict'
 
//EN USO
var express = require('express');
var UserServicesController = require('../controllers/userServices');
var api = express.Router();

api.put('/updateUserServices/:id', UserServicesController.updateUserServices);
api.get('/get-user-services/:id?', UserServicesController.getUserservices);
api.get('/get-service-image/:imageFile', UserServicesController.getServiceImage);
api.post('/saveUserServices', UserServicesController.saveUserServices);
api.delete('/deleteUserServices', UserServicesController.deleteUserServices);

module.exports = api;