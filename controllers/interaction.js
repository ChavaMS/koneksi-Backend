'use strict'
var mongoosePaginate = require('mongoose-pagination');
var Comment = require('../models/Comments');
var Rating = require('../models/Rating');

function probando(req, res) {
    res.status(200).send({ message: 'Probando' });
}

function saveComment(req, res) {
    var params = req.body;

    if (!params.text || !params.receiver) return res.status(500).send({ message: 'Error' });

    var comment = new Comment();
    comment.emitter = req.user.sub; //usuario loggeado. La propiedad sub es el id.
    comment.receiver = params.receiver; //req.body.receiver
    comment.text = params.text;
    comment.activity_id = params.activity_id;
    comment.created_at = Date.now();

    comment.save((err, commentStored) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });
        if (!commentStored) return res.status(500).send({ message: 'Error al enviar el mensaje' });

        return res.status(200).send({ message: commentStored });
    });
}

function deleteComment(req, res) {
    var Id = req.body.receiverId;
    Comment.remove({ "_id": Id, "emitter": req.user.sub }).exec((err, delCom) => {
        if (err) return res.status(500).send({ message: "Error al borrar el comentario" });
        return res.status(200).send({ message: "Comentario borrado exitosamente" });
    });
}

function updateComment(req, res) {
    var productId = req.params.id;
    var update = req.body;

    Comment.findByIdAndUpdate(productId, update, { new: true }, (err, productUpdated) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });
        return res.status(200).send({
            product: productUpdated
        });
    });
}

function getComments(req, res) {
    var userId = req.body.receiver;
    var actId = req.body.activity_id;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var itemsPerPage = 4;

    Comment.find({receiver: userId, activity_id: actId}).paginate(page, itemsPerPage, (err, comment, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!comment) return res.status(404).send({message: 'No hay mensajes'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            comment
        });
    });
}

//Verificar que solo se pueda dejar un rating por persona
function saveRating(req, res) {
    var rate = new Rating();
    rate.user = req.user.sub;
    rate.userSaved = req.body.userSaved;
    rate.rating = req.body.rating;

    rate.save((err, ratingtStored) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });
        if (!ratingtStored) return res.status(500).send({ message: 'Error al guardar tu calificación' });

        return res.status(200).send({ message: "Calificación guardada" });
    });

}

function getRating(req, res) {
    var userSav = req.body.userSaved;
    
    Rating.find({})
    Rating.find({userSaved:userSav}).exec((err, valor) => {
        if (err) return res.status(500).send({ message: "Error al borrar el comentario"});

        var promedio = 0;
        var tamano = 0;
        valor.forEach(num => {
            promedio += num.rating;
            tamano += 1;
        });

        promedio /= tamano;

        return res.status(200).send({ message: promedio.toString() });
    });
}

module.exports = {
    probando,
    saveComment,
    deleteComment,
    updateComment,
    getComments,
    saveRating,
    getRating
};