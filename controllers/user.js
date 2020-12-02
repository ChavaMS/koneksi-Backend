'use strict'

var User = require('../models/User');
var Jobs = require('../models/Jobs');
var bcrypt = require('bcrypt-nodejs');
var uploadProfile = require("../middlewares/storageProfile");
var uploadBanner = require("../middlewares/storageBanner");

var userProfilePath = "./uploads/users/profile/";
var userCoverPath = "./uploads/users/banner/";
var jwt = require('../services/jwt.js');
var fs = require('fs');
var path = require('path');
var axios = require('axios');


//-------PRUEBAS--------
function home(req, res) {
    res.status(200).send({ message: 'Hola mundo' });
}

function pruebas(req, res) {
    res.status(200).send({ message: 'Accion de pruebas en el servidor de nodejs' });
}
//---------------------

//Registro
//Utiliza: form-data
/*
    id: String,
    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    cover_page: String,
    type: String,
    lat: String,
    lon: String,
    last_time_connected: Date,
    created_at: Date

*/
function saveUser(req, res) {
    uploadProfile(req, res, function (err) {
        if (err) {
            console.log(err);
            return res.end("Error uploading file 1");
        }

        //DATOS
        var params = req.body;
        var user = new User();
        var file_name = req.file.filename;


        if (params.name && params.surname && params.email && params.password &&
            (params.suburb || params.cp || params.street)
            && params.state && params.city) {

            //Datos que se piden para la ubicación
            var location = params.cp + ' ' + params.street + ' ' + params.suburb + ',' + params.city + ' ' + params.state + ' Mexico';
            axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: location,
                    key: 'AIzaSyDgRN1AR5CnGjgdcc3f93CzMho80a2yWog'
                }
            }).then(function (resp) {

                //DATOS BASICOS
                user.name = params.name;
                user.surname = params.surname;
                user.email = params.email;
                user.type = params.type;

                //IMAGENES
                user.image = file_name;
                user.cover_page = null;

                //UBICACION
                user.lat = resp.data.results[0].geometry.location.lat;
                user.lon = resp.data.results[0].geometry.location.lng;
                user.country = params.country;
                user.state = params.state;
                user.city = params.city;

                //FECHA
                user.created_at = Date.now();
                user.last_time_connected = Date.now();

                User.find({
                    email: user.email.toLowerCase()
                }).exec((err, users) => {
                    if (err) {
                        return removeFileOfUploads(res, userProfilePath + file_name, "Error en la petición de usuarios");
                    }

                    if (users && users.length >= 1) {
                        return removeFileOfUploads(res, userProfilePath + file_name, "El usuario ya esta registrado");
                    } else {
                        //Cifra la password y me guarda los datos
                        bcrypt.hash(params.password, null, null, (err, hash) => {
                            user.password = hash;

                            user.save((err, userStored) => {
                                if (err) {
                                    return removeFileOfUploads(res, userProfilePath + file_name, "Error al guardar el usuario");
                                }
                                if (userStored) {
                                    res.status(200).send({ user: userStored });
                                } else {
                                    return removeFileOfUploads(res, userProfilePath + file_name, "No se ha registrado el usuario");
                                }
                            });
                        });
                    }
                });

            }).catch(function (error) {
                return removeFileOfUploads(res, userProfilePath + file_name, "Error al procesar la ubicacion");
            });
        } else {
            return removeFileOfUploads(res, userProfilePath + file_name, "Envia todos los campos necesarios");
        }
    });

}

function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    if (email && password) {
        User.findOne({ email: email }, (err, user) => {
            if (err) return res.status(404).send({ message: 'Error en la peticion' });

            if (user) {
                bcrypt.compare(password, user.password, (err, check) => {
                    if (check) {
                        var userId = user._id;
                        
                        //Devolver datos de usuario
                        if (params.gettoken) {
                            //Actualizamos la ultima vez que se conectó el usuario
                            User.findByIdAndUpdate(userId, { last_time_connected: Date.now() }, { new: true }, (err, userUpdated) => {
                                if (err) return res.status(500).send({ message: 'Error en la petición' });

                                if (!userUpdated) return res.status(404).send({ message: 'No se ha podido iniciar sesion' });

                                //generar y devolver token 
                                return res.status(200).send({
                                    token: jwt.createToken(user)
                                });
                            });

                        } else {
                            //Actualizamos la ultima vez que se conectó el usuario
                            User.findByIdAndUpdate(userId, { last_time_connected: Date.now() }, { new: true }, (err, userUpdated) => {
                                if (err) return res.status(500).send({ message: 'Error en la petición' });

                                if (!userUpdated) return res.status(404).send({ message: 'No se ha podido iniciar sesion' });

                                //Devolver datos en claro
                                user.password = undefined;
                                return res.status(200).send({ user });
                            });
                        }

                    } else {
                        return res.status(404).send({ message: 'El usuario no se ha podido identificar' });
                    }
                });
            } else {
                return res.status(404).send({ message: 'El usuario no se ha podido identificar' });
            }
        });
    }

}


//Edicion de datos de usuario
function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    //Borrar propiedad password
    delete update.password;
    if (userId != req.user.sub) {
        return res.status(200).send({ message: 'No tienes permiso para actualizar los datos del usuario' });
    }
    User.find({ email: update.email.toLowerCase() }
    ).exec((err, users) => {

        var user_isset = false;
        users.forEach((user) => {
            if (user && user._id != userId) user_isset = true;
        });

        if (user_isset) res.status(500).send({ message: 'Los datos ya estan en uso' });

        User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
            if (err) return res.status(500).send({ message: 'Error en la petición' });

            if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });

            return res.status(200).send({
                user: userUpdated
            });
        });

    });
}


function updateCoverPage(req, res) {
    uploadBanner(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file");
        }
        //DATOS
        var email = req.body.email;
        var file_name = req.file.filename;
        if (email && file_name) {
            User.findOneAndUpdate({ email: email }, { $set: { cover_page: file_name } }).exec((err, user) => {
                if (err) {
                    return removeFileOfUploads(res, userCoverPath + file_name, "Error al actualizar el banner");
                }

                if (user) {
                    res.status(200).send({ user: user });
                }

            });
        }
    });
}


//MANEJO DE ARCHIVOS
function removeFileOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message });
    });
}


function getImageProfile(req, res) {
    var imageFile = req.params.imageFile;
    var path_file = 'uploads/users/profile/' + imageFile;
    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    });
}

function getImageCover(req, res) {
    var imageFile = req.params.imageFile;
    var path_file = 'uploads/users/banner/' + imageFile;
    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    });
}

module.exports = {
    pruebas,
    home,
    saveUser,
    updateCoverPage,
    getImageProfile,
    getImageCover,
    loginUser,
    updateUser
}