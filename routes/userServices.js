'use strict'
 
//EN USO
var express = require('express');
var UserServicesController = require('../controllers/userServices');
var api = express.Router();

api.post('/updateUserServices/:id', UserServicesController.updateUserServices);
api.get('/get-user-services/:id?/:page?', UserServicesController.getUserservices);
api.get('/get-service-image/:imageFile', UserServicesController.getServiceImage);
api.post('/saveUserServices', UserServicesController.saveUserServices);
api.delete('/deleteUserServices', UserServicesController.deleteUserServices);
api.put('/delete-photo/:id', UserServicesController.deletePhoto);
api.put('/update-images', UserServicesController.updateImages);

module.exports = api; 