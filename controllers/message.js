'use strict'

var moment = require('moment'); //tiempo
var mongoosePaginate = require('mongoose-pagination');

//var User = require('../Models/User');
var Message = require('../Models/Messages');    

function probando(req, res){
    res.status(200).send({message: 'Probando'});
}


/* 
x-www-form-urlencoded:
    Atribudos recibidos por req
        emitter
        receiver
        text
    URL: /message
*/
function saveMessage(req, res){
    var params = req.body;

    if(!params.text || !params.receiver) return res.status(500).send({message: 'Error'});
    
    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver; //req.body.receiver
    message.text = params.text;
    message.created_at = Date.now();
    message.viewed = 'false';
    
    message.save((err, messageStored) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!messageStored) return res.status(500).send({message: 'Error al enviar el mensaje'});

        return res.status(200).send({message: messageStored});
    });
}

function getReceivedMessages(req, res){
    var userId = req.user.sub;


    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({receiver: userId}).populate('emitter').paginate(page, itemsPerPage, (err, messages, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!messages) return res.status(404).send({message: 'No hay mensajes'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

function getEmmitMessages(req, res){
    var userId = req.user.sub;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({emitter: userId}).populate('emitter receiver').paginate(page, itemsPerPage, (err, messages, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!messages) return res.status(404).send({message: 'No hay mensajes'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

function getUnviewedMessages(req, res){
    var userId = req.user.sub;

    Message.count({receiver:userId, viewed:'false'}).exec((err, count) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        return res.status(200).send({
            'unviewed':count
        });
    })
}

module.exports = {
    probando,
    saveMessage,
    getReceivedMessages,
    getEmmitMessages,
    getUnviewedMessages
    //Quitar el no visto
    //Abrir mensaje individual
};