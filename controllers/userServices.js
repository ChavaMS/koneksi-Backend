'use strict'
var UserServices = require('../models/UserServices');
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
    var userId = req.params.id;

    if (userId) {
        UserServices.find({ user: userId }, { user: 0 }).exec((err1, services) => {
            if (err1) return res.status(500).send({ message: 'Error al buscar el servicio' });
            if (!services) return res.status(404).send({ message: 'No hay servicio que mostrar' });

            User.find({ _id: userId }, { password: 0 }).exec((err2, user) => {
                if (err2) return res.status(500).send({ message: 'Error al buscar servicios' });
                if (!user) return res.status(404).send({ message: 'No hay servicio que mostrar' });

                return res.status(200).send({
                    services,
                    user
                });
            });
        });
    } else {
        //Todos los productos desordenados
        UserServices.find().exec((err, result) => {
            if (err) return res.status(500).send({ message: 'Error al buscar productos' });

            if (!result) return res.status(404).send({ message: 'No hay productos que mostrar' });

            return res.status(200).send({result});
        });
    }
}

function deleteUserServices (req, res){
    var userServiceId = req.params.id;
    UserServices.findByIdAndDelete(userServiceId, (err, serviceDeleted) => {
        if (err) return res.status(500).send({message: 'No se ha podido borrar el servicio'});
        if (!serviceDeleted) return res.status(404).send({message: 'No se ha encontrado servicio para eliminar'});

        return res.status(200).send({
            service: serviceDeleted
        });
    })

    // -----------------------------------------------------

    var serviceId = req.params.id;
    var serviceImagePath = "";
    var userServiceId = 0;


    UserProducts.findById({ '_id': serviceId }, (err, service) => {
        serviceImagePath = service.image;
        userServiceId = service.user;
    });

    //Se comprueba que el que va a borrar el servicio, sea el que lo creó
    if (userServiceId == req.user.sub) {
        UserServices.deleteOne({ 'user': req.user.sub, '_id': serviceId }, (err, result) => {
            if (err) return res.status(500).send({ message: 'Error al borrar el servicio' });

            // Checar imagenes -------------------------------------------------------------------------------
            removeFileOfUploads(res, userProductsImagePath + productImagePath, "Imagen borrada correctamente");

            return res.status(200).send({ message: 'Servicio borrado correctamente' });
        });
    }

}

module.exports = {
    saveUserServices,
    updateUserServices,
    getUserservices,
    deleteUserServices,
    //getImage
}