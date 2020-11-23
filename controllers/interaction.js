'use strict'

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

/*
    1) recibir el id del receiver y hacer una consulta en User para obtener el tipo
    2) Con selectivas vas dividir las consultas segun el tipo de usuario que sea
    if(UserProducts){
        3) Realizar consulta con id de la actividad para que retorne los comentarios de esa actividad
    }
    if(UserJobs){
        3) Realizar consulta con id de la actividad para que retorne los comentarios de esa actividad
    }
    if(UserService){
        3) Realizar consulta con id de la actividad para que retorne los comentarios de esa actividad
    }else{
        return error
    }
 
*/
function getComments(req, res) {


}

function saveRating(req, res) {

}

function getRating(req, res) {

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