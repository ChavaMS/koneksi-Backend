'use strict'

//CREACION DE ENTIDAD USER
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 **Se guardan las coordenadas para evitar hacer calculos cada vez que se quiera la 
 **ubicacion.
*/
var UserSchema = Schema({
    id: String,
    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    cover_page: String,
    type: String, //Literalmente la palabra UserJob, UserProduct o UserService
    lat: String,
    lon: String,
    country: String,
    state: String,
    city: String,
    last_time_connected: Date,
    created_at: Date
});

module.exports = mongoose.model('User', UserSchema);