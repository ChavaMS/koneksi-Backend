'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../Models/User');
var Message = require('../Models/Messages');

function probando(req, res){
    res.status(200).send({message: 'Probando'});
}

function saveMessage(req, res){
    var params = req.body;

    if(!params.text || !params.receiver) return res.status(500).send({message: 'Error'});
    
    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
}

module.exports = {
    probando
};