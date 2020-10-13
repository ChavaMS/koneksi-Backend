'use strict'

//CREACION DE ENTIDAD USER
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
    id: String,
    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    cover_page: String,
    type: String,
    lat: String,
    lon: String,
    last_time_connected: Date,
    created_at: Date
});

module.exports = mongoose.model('User', UserSchema);