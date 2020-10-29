'use strict'

const UserServices = require('../models/UserServices');
var uploadServices = require("../middlewares/storageServices"); // Para imágenes

var fs = require('fs');
var path = require('path');


// Registro
function saveUserServices(req, res){

    // Datos
    var params = req.body;
    var userServices = new UserServices();
    var file_name = req.file.filename;

    // Error en caso de que falten datos
    if (!params.description || !params.schedule || !params.tags)
        return res.status(400).send("Faltan datos para la creación del servicio")

    // Asignacion de atributos al objeto userServices
    userServices.description = params.description;
    userServices.schedule = params.schedule;
    userServices.tags = params.tags;

    // Guardado del objeto
    userServices.save((err, userServicesStored) => {
        if (err) return res.status(500).send("Error al guardar");
        if (!userServicesStored) return res.status(404).send("No se encontró el objeto de userService");

        return res.status(200).send({userServices: userServicesStored});
    })
}

function updateUserServices (req, res) {
    var userServicesId = req.params.id;
    var update = req.body;

    if (userId != req.user.sub) 
        return res.status(200).send({ message: 'No tienes permiso para actualizar los datos del usuario' });

    UserServices.findByIdAndUpdate(userServicesId, update, (err, userServicesUpdated) => {
        if (err) return res.status(500).send("Error al actualizar");
        if (!userServicesUpdated) return res.status(404).send("No existe el userService a actulizar");

        return res.status(200).send({userServices: userServicesUpdated});
    })
}

function getUserservices (req, res){
    UserServices.find({}).exec((err, userServices) => {
        if (err) return res.status(500).send("Error al devolver los datos");
        if (!userServices) return res.status(404).send("No hay servicios a mostrar")
        return res.status(200).send({userServices});
    })
}

module.exports = {
    saveUserServices,
    updateUserServices,
    getUserservices
}