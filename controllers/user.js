'use strict'

var User = require('../models/User');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt.js');
var fs = require('fs');
var path = require('path');
const { type } = require('os');

//-------PRUEBAS--------
function home(req, res) {
    res.status(200).send({ message: 'Hola mundo' });
}

function pruebas(req, res) {
    res.status(200).send({ message: 'Accion de pruebas en el servidor de nodejs' });
}
//---------------------

//Registro
function saveUser(req, res) {

    var params = req.body;
    var user = new User();

    switch (params.type) {
        case 'client':
            saveClient(params, user, res);
            break;
        case 'clientWork':
            saveClientWork(params, user, res);
            break;
        case 'clientProduct':
            saveClientProduct(params, user, res);
            break;
        case 'clientService':
            saveClientService(params, user, res);
            break;
    }

}

function saveClient(params, user, res) {
    if (params.name && params.surname && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.type = params.type;
        user.image = null;

        User.find({
            email: user.email.toLowerCase()
        }).exec((err, users) => {
            if (err) return res.status(500).send({ message: 'Error en la petición de usuarios' });

            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'El usuario ya esta registrado' });
            } else {
                //Cifra la password y me guarda los datos
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if (err) {
                            return res.status(500).send({ message: 'Error al guardar el usuario' });
                        }
                        if (userStored) {
                            res.status(200).send({ user: userStored });
                        } else {
                            res.status(404).send({ message: 'No se ha registrado el usuario' });
                        }
                    });
                });
            }
        });
    } else {
        res.status(200).send({ message: 'Envia todos los campos necesarios' });
    }
}

function saveClientWork(params, user, res) {

}


function saveClientProduct(params, user, res) {

}


function saveClientService(params, user, res) {

}

//Subir archivos de imagen/avatar de usuario
function uploadImage(req, res) {
    var userId = req.params.id;

    if (req.files) {

        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (userId != req.user.sub) {
            return removeFileOfUploads(res, file_path, 'No tienes permisos para subir arvhivos');
        }

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            //Actualizar documento de usuario logeado
            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: 'Error en la petición' });

                if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
                return res.status(200).send({
                    user: userUpdated
                });
            });
        } else {
            //Eliminar el fichero
            return removeFileOfUploads(res, file_path, 'Extensión no válida');
        }

    } else {
        return res.status(200).send({ message: 'No se han subido imagenes' });
    }
}

function removeFileOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message });
    });
}



module.exports = {
    pruebas,
    home,
    saveUser,
    saveClient
}