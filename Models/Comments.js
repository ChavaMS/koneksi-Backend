'use strict'

//CREACION DE ENTIDAD COMMENTS
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentsSchema = Schema({
    id: String,
    emitter: {type: Schema.ObjectId, ref: 'User'},
    receiver: {type: Schema.ObjectId, ref: 'User'},
    created_at: Date,
    text: String
});

module.exports = mongoose.model('Comments', CommentsSchema);