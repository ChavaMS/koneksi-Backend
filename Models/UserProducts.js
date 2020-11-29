'use strict'

//CREACION DE USERPRODUCTS
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');

var UserProductsSchema = Schema({
    id: String,
    user: {type: Schema.ObjectId, ref: 'User'},
    name: String,
    original_name: String,
    image: String,
    price: Number,
    description: String,
    tags: [String]
});

UserProductsSchema.plugin(aggregatePaginate);

module.exports = mongoose.model('UserProducts', UserProductsSchema);