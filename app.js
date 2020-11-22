'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//Cargar rutas
var user_routes = require('./routes/user');
var user_products_routes = require('./routes/userProducts');
<<<<<<< HEAD
var message_routes = require('./routes/message');
=======
var user_jobs_routes = require('./routes/userJobs');
<<<<<<< HEAD
>>>>>>> 021dde2f791fd04d908b1d5cd88e061806078596

=======
var user_services_routes = require('./routes/userServices');
var search_routes = require('./routes/search');
>>>>>>> 53b863d650e770dd8692625088dd98d453af0af5

//Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});

//Rutas
app.use('/api', user_routes);
app.use('/api', user_products_routes);
<<<<<<< HEAD
app.use('/api', message_routes);
=======
app.use('/api', user_jobs_routes);
<<<<<<< HEAD
>>>>>>> 021dde2f791fd04d908b1d5cd88e061806078596

=======
app.use('/api', user_services_routes) 
app.use('/api', search_routes);
>>>>>>> 53b863d650e770dd8692625088dd98d453af0af5

//Exportar
module.exports = app;