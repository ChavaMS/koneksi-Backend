'use strict'

var UserJobs = require('../models/UserJob');
const Transaction = require("mongoose-transactions");
const transaction = new Transaction();



//-------PRUEBAS--------
function home(req, res) {
    res.status(200).send({ message: 'Hola mundo' });
}

function pruebas(req, res) {
    res.status(200).send({ message: 'Accion de pruebas en el servidor de nodejs' });
}
//---------------------

function saveUserJobs(req, res) {
    //DATOS
    var params = req.body;
    var error = false;


    try {
        for (let i = 0; i < params.description.length; i++) {
            let userJobs = new UserJobs();
            if (params.description[i] && params.schedule[i] && params.jobId[i] && params.id) {

                userJobs.description = params.description[i];
                //ID del usuario
                userJobs.user = params.id;
                userJobs.schedule = params.schedule[i];
                //ID de los oficios seleccionados
                userJobs.type = params.jobId[i];

            } else {
                error = true;
            }
            transaction.insert('UserJob', userJobs);
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

function deleteUserJob(req, res) {
    var userJobtId = req.params.id;

    UserJobs.deleteOne({ 'user': req.user.sub, '_id': userJobtId }, (err, result) => {
        if (err) return res.status(500).send({ message: 'Error al borrar el oficio' });


        return res.status(200).send({ message: 'Oficio borrado correctamente' });
    });
}

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

function getUserJobs(req, res) {

    var userId = req.params.id;

    UserJobs.find({ user: userId }).exec((err, result) => {
        if (err) return res.status(200).send({ message: 'Error al buscar oficios' });

        if (!result) return res.status(404).send({ message: 'No hay oficios que mostrar' });

        return res.status(200).send({
            userJobs: result
        });
    });
}

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