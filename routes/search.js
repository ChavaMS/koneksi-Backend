'use strict'


//EN USO
var express = require('express');
var searchController = require('../controllers/search');
var api = express.Router();
var md_auth = require('../middlewares/authenticate');

api.get('/home-s', searchController.home);
api.get('/search/:sub',md_auth.ensureAuth, searchController.search);
api.get('/search', searchController.search);
api.post('/search-products/:page?', searchController.searchProducts);


module.exports = api;