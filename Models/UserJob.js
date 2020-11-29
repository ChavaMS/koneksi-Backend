'use strict'

//CREACION DE ENTIDAD USERJOB
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');

var userJobSchema = Schema({
    id: String,
    user: {type: Schema.ObjectId, ref: 'User'},
    jobs: {type: Schema.ObjectId, ref: 'Jobs'},
    description: String,
    schedule: String,
    tags: [String]
});

userJobSchema.plugin(aggregatePaginate);

module.exports = mongoose.model('UserJob', userJobSchema);