'use strict'

const UserServices = require('../models/UserServices');
const uploadServices = require("../middlewares/storageServices"); // Para imágenes
const userServicesImagePath = "./uploads/userServices";
const multer = require('multer');

var fs = require('fs');
var path = require('path');

function home(req, res) {
    res.status(200).send({ message: 'Hola mundo' });
}

// Registro
function saveUserServices(req, res) {

    // Error de la imagen
    uploadServices(req, res, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al subir el archivo");
        }

        // Datos
        var params = req.body;
        var userServices = new UserServices();
        var file_name = req.files;

        // Error en caso de que falten datos
        if (!params.description || !params.schedule || !params.id)
            return res.status(400).send("Faltan datos para la creación del servicio")

        // Asignacion de atributos al objeto userServices
        userServices.description = params.description;
        userServices.schedule = params.schedule;
        userServices.user = params.id;

        // Tags
        userServices.tags = params.tags.split(',');
        console.log(userServices.tags);
        console.log(params.tags);

        // Imagenes
        for (let i = 0; i < file_name.length; i++) {
            userServices.images[i] = file_name[i].filename;
        }

        // Guardado del objeto
        userServices.save((err, userServicesStored) => {
            if (err) return res.status(500).send("Error al guardar");
            if (!userServicesStored) return res.status(404).send("No se encontró el objeto de userService");

            return res.status(200).send({ userServices: userServicesStored });
        })
    });
}

function updateUserServices(req, res) {
    var userServicesId = req.params.id;
    var update = req.body;

    if (userId != req.user.sub)
        return res.status(200).send({ message: 'No tienes permiso para actualizar los datos del usuario' });

    UserServices.findByIdAndUpdate(userServicesId, update, (err, userServicesUpdated) => {
        if (err) return res.status(500).send("Error al actualizar");
        if (!userServicesUpdated) return res.status(404).send("No existe el userService a actulizar");

        return res.status(200).send({ userServices: userServicesUpdated });
    })
}

function getUserservices(req, res) {
    var userId = req.params.id;

    if (userId && userId != 1) {
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
        var page = 1;
        if (req.params.page) {
            page = req.params.page;
        }
        var itemsPerPage = 5;
        //Todos los servicios desordenados
        UserServices.find().populate('user', 'name surname image cover_page lat lon').paginate(page, itemsPerPage, (err, services, total) => {
            if (err) return res.status(500).send({ message: 'Error al buscar servicios' });

            if (!services) return res.status(404).send({ message: 'No hay productos que mostrar' });
            //console.log(result);
            return res.status(200).send({
                services,
                total,
                pages: Math.ceil(total / itemsPerPage)
            });
        });
    }
}

function deleteUserServices(req, res) {
    var serviceId = req.params.id;
    var serviceImagesPaths = [];
    var userServiceId = 0;

    UserProducts.findById({ '_id': serviceId }, (err, service) => {

        for (let i = 0; i < params.images.length; i++) {
            serviceImagesPaths[i] = service.images[i];
        }

        userServiceId = service.user;
    });

    //Se comprueba que el que va a borrar el servicio, sea el que lo creó
    if (userServiceId == req.user.sub) {
        UserServices.deleteOne({ 'user': req.user.sub, '_id': serviceId }, (err, result) => {
            if (err) return res.status(500).send({ message: 'Error al borrar el servicio' });

            // Checar imagenes -------------------------------------------------------------------------------
            for (let i = 0; i < serviceImagesPaths.length; i++) {
                removeFileOfUploads(res, userServicesImagePath + serviceImagesPaths[i], "Imagen borrada correctamente");
            }

            return res.status(200).send({ message: 'Servicio borrado correctamente' });
        });
    }
}

function getServiceImage(req, res) {
    var imageFile = req.params.imageFile;
    var path_file = 'uploads/userServices/' + imageFile;
    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    });
}

module.exports = {
    home,
    saveUserServices,
    updateUserServices,
    getUserservices,
    deleteUserServices,
    getServiceImage
}