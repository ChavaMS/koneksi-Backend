'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

//Conexion a la DB
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/koneksi_bd', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('La conexion a la bd se ha realizado correctamente.');

        //Crear servidor
        app.listen(port, () => {
            console.log('Servidor corriendo en http://localhost:3800');
        });

    }).catch(err => {
        console.log(err);
    });