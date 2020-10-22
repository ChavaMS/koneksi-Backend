'use strict'


//EN USO
var express = require('express');
var UserProductsController = require('../controllers/userProducts');
var api = express.Router();
var md_auth = require('../middlewares/authenticate');

//RUTAS GET
api.get('/pruebas-products', UserProductsController.pruebas);
api.get('/home', UserProductsController.home);
api.get('/get-product-image/:imageFile', UserProductsController.getImageProduct);

//RUTAS POST
api.post('/save-products', UserProductsController.saveProducts);
api.post('/save-product', md_auth.ensureAuth, UserProductsController.saveProduct);
api.post('/get-products/:id', UserProductsController.getProducts);

//RUTAS PUT
api.put('/update-product/:id', md_auth.ensureAuth, UserProductsController.updateProduct);

//RUTAS DELETE
api.delete('/deleteProduct/:id', md_auth.ensureAuth, UserProductsController.deleteProduct);

module.exports = api;