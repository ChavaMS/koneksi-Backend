'use strict'


//EN USO
var express = require('express');
var UserProductsController = require('../controllers/userProducts');
var api = express.Router();
var md_auth = require('../middlewares/authenticate');


api.get('/pruebas-products', UserProductsController.pruebas);
api.get('/home', UserProductsController.home);

api.post('/save-products', UserProductsController.saveProducts);



module.exports = api;