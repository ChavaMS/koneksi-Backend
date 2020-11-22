'use strict'

var UserJobs = require('../models/UserJob');
const Transaction = require("mongoose-transactions");
const User = require('../models/User');




//-------PRUEBAS--------
function home(req, res) {
    res.status(200).send({ message: 'Hola mundo' });
}

function pruebas(req, res) {
    res.status(200).send({ message: 'Accion de pruebas en el servidor de nodejs' });
}
//---------------------

/* 
x-www-form-urlencoded:
    *description
    *schedule
    *jobId -> id de la tabla de oficios
    *user -> id del usuario al que le pertenecen los oficios

    URL: /save-user-jobs
*/
function saveUserJobs(req, res) {
    //DATOS
    var params = req.body;
    var error = false;


    var transaction = new Transaction();
    var userJobs = new UserJobs();
    console.log(params);
    var transaction = new Transaction();
    var userJobs = new UserJobs();


    try {
        if (!Array.isArray(params.description)) {

            userJobs.description = params.description;
            //ID del usuario
            userJobs.user = params.id;
            userJobs.schedule = params.schedule;
            //ID de los oficios seleccionados
            userJobs.jobs = params.jobId;

            //Se representa como ["tag1,tag2", "tag1,tag2"] 
            userJobs.tags = params.tags.split(',');
            
            transaction.insert('UserJob', userJobs);

        } else {
            for (let i = 0; i < params.description.length; i++) {
                userJobs = new UserJobs();
                if (params.description[i] && params.schedule[i] && params.jobId[i] && params.id) {

                    userJobs.description = params.description[i];
                    //ID del usuario
                    userJobs.user = params.id;
                    userJobs.schedule = params.schedule[i];
                    //ID de los oficios seleccionados
                    userJobs.jobs = params.jobId[i];

                    //Se representa como ["tag1,tag2", "tag1,tag2"] 
                    userJobs.tags = params.tags[i].split(',');

                    transaction.insert('UserJob', userJobs);
                } else {
                    error = true;
                }
            }
        }
        

        if (!error) {
            transaction.run();
            return res.status(200).send({ message: "Oficios agregados con éxito" });
        } else {
            transaction.rollback();
            transaction.clean();
            return res.status(200).send({ message: "Error al agregar los Oficios" });
        }

    } catch (error) {
        console.error(error);
        const rollbackObj = transaction.rollback().catch(console.error);
        transaction.clean();
        console.log(transaction);
        return res.status(200).send({ message: "Error al agregar los oficios" });
    }

}

/* 
    URL: /delete-job/:id -> id del oficio
*/
function deleteUserJob(req, res) {
    var userJobId = req.params.id;
    var userId = 0;
    UserJobs.find({ '_id': userJobId }).exec((err, job) => {
        userId = job.user;
    });

    if (userId == userJobId) {
        UserJobs.deleteOne({ 'user': req.user.sub, '_id': userJobId }, (err, result) => {
            if (err) return res.status(500).send({ message: 'Error al borrar el oficio' });


            return res.status(200).send({ message: 'Oficio borrado correctamente' });
        });
    }

}

/* 
x-www-form-utlencoded:
    *description
    *schedule
    *type -> JobId
    *user

    URL: /update-user-job/:id -> id del trabajo a editar
*/
function updateUserJob(req, res) {

    var userJobId = req.params.id;
    var update = req.body;

    UserJobs.findByIdAndUpdate(userJobId, update, { new: true }, (err, userJobUpdated) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });

        if (!userJobUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el oficio' });

        return res.status(200).send({
            product: userJobUpdated
        });
    });
}

/*
    URL: /get-user-jobs/:id -> id del cliente con oficios
    URL: /get-user-jobs     -> Todos los oficios creados
*/
function getUserJobs(req, res) {

    var userId = req.params.id;
    if (userId) {
        UserJobs.find({ user: userId }).populate('jobs user').exec((err, userJobs) => {
            if (err) return res.status(200).send({ message: 'Error al buscar oficios' });

            if (!userJobs) return res.status(404).send({ message: 'No hay oficios que mostrar' });

            User.find({ _id: userId }, { password: 0 }).exec((err2, user) => {
                if (err2) return res.status(500).send({ message: 'Error al buscar productos' });

                if (!user) return res.status(404).send({ message: 'No hay productos que mostrar' });

                return res.status(200).send({
                    userJobs,
                    user
                });
            });

        });
    } else {
        UserJobs.find().populate('jobs').exec((err, result) => {
            if (err) {
                console.log(err);
                return res.status(200).send({ message: 'Error al buscar oficios' });

            }
            if (!result) return res.status(404).send({ message: 'No hay oficios que mostrar' });

            var jobsMix = arrayMix(result);

            return res.status(200).send({
                jobsMix
            });
        });
    }

}

function arrayMix(arreglo) {
    for (let i = arreglo.length - 1; i > 0; i--) {
        let indiceAleatorio = Math.floor(Math.random() * (i + 1));
        let temporal = arreglo[i];
        arreglo[i] = arreglo[indiceAleatorio];
        arreglo[indiceAleatorio] = temporal;
    }

    return arreglo;
}

/* 
x-www-form-utlencoded:
    *description
    *schedule
    *type -> JobId
    *user

    URL: /save-user-job
*/
function saveUserJob(req, res) {
    //DATOS
    var params = req.body;
    var userId = req.user.sub;
    let userJobs = new UserJobs();
    if (params.description && params.schedule && params.jobId) {

        userJobs.description = params.description;
        //ID del usuario
        userJobs.user = userId;
        userJobs.schedule = params.schedule;
        //ID de los oficios seleccionados
        userJobs.type = params.jobId;

        userJobs.save((err, result) => {
            if (err) return res.status(200).send({ message: 'Error al guardar el oficio' });
            return res.status(200).send({
                userJobs: result
            });

        });

    } else {
        return res.status(500).send({ message: 'Error al agregar el oficio' });
    }

}

module.exports = {
    home,
    pruebas,
    saveUserJobs,
    deleteUserJob,
    updateUserJob,
    getUserJobs,
    saveUserJob
}