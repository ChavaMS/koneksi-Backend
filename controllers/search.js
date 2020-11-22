'use strict'

var UserJobs = require('../models/UserJob');
var Jobs = require("../models/Jobs");
var UserProducts = require('../models/UserProducts');
var UserServices = require('../models/UserServices');
var axios = require('axios');
const User = require('../models/User');
var geoip = require('geoip-lite')




//-------PRUEBAS--------
function home(req, res) {
    res.status(200).send({ message: 'Hola mundo' });
}

function pruebas(req, res) {
    res.status(200).send({ message: 'Accion de pruebas en el servidor de nodejs' });
}
//---------------------

/*

Productos:
    Nombre del producto
    palabra clave (tags)
    ubicacion del usuario
        Necesario que ponga algo
    rating
Oficios:
    Nombre del oficio
    palabra clave (tags)
    ubicacion del usuario
    rating
    horario
Servicio:
    Nombre del servicio
    palabra clave (tags)
    ubicacion del usuario
    rating
    horario
*/
async function search(req, res) {
    var params = req.body;


    var country;
    var state;
    var city;
    if (params.country && params.state && params.city) {
        country = params.country;
        state = params.state;
        city = params.city;
    } else if (req.user) {

        country = req.user.country;
        state = req.user.state;
        city = req.user.city;
    } else {
        var geo = geoip.lookup(req.ip);

        country = geo.country;
        state = geo.region;
        city = geo.city;
    }

    var itemSearch = params.item.toLowerCase();
    var schedule = params.schedule;

    //Se busca en UserProducts
    var products = await UserProducts.find({ $or: [{ name: { '$regex': itemSearch } }, { tags: { '$regex': itemSearch } }] }).populate("user", { password: 0, email: 0 }).exec().then((res) => {
        if (!res) return "No hay productos que mostrar";

        let response;
        if (res) {
            res.forEach(product => {
                if (product.user.country != country || product.user.state != state || product.user.city != city) {
                    res = removeItemFromArr(res, product);
                }
            });
        }

        return res;
    }).catch(err => {
        return res.status(500).send({ message: "error buscando el producto" });
    });

    //Se busca en Jobs, para ver si no es un oficio
    var job = await Jobs.find({ name: { '$regex': itemSearch } }).exec().then(job => {
        return job
    }).catch(err => {
        return res.status(500).send({ message: "error buscando el oficio" });
    });

    //Se busca el oficio completo y sus posibles tags
    var jobs = await UserJobs.find({ $or: [{ jobs: job._id }, { tags: { '$regex': itemSearch } }] }).populate("user jobs", { password: 0, email: 0 }).exec().then(res => {
        if (!res) return "No hay oficios que mostrar";

        if (res) {
            res.forEach(jobs => {
                if (jobs.user.country != country || jobs.user.state != state || jobs.user.city != city) {
                    res = removeItemFromArr(res, jobs);
                }
            });
        }

        return res;
    }).catch(err => {
        return res.status(500).send({ message: "error buscando el oficio" });
    });

    var services = await UserServices.find({ $or: [{ description: { '$regex': itemSearch } }, { tags: { '$regex': itemSearch } }] }).populate("user", { password: 0, email: 0 }).exec().then(res => {
        if (!res) return "No hay servicios que mostrar";

        if (res) {
            res.forEach(service => {
                if (service.user.country != country || service.user.state != state || service.user.city != city) {
                    res = removeItemFromArr(res, service);
                }
            });
        }
        return res;
    }).catch(err => {
        return res.status(500).send({ message: "error buscando servicios" });
    });


    if (schedule) {
        var scheduleArray = Array.from(schedule);
        var pass = false;

        if (jobs) {

            //Se itera jobs para ver si los trabajos tienen el horario solicitado
            jobs.forEach(job => {
                scheduleArray.forEach(schedule => {
                    if (job.schedule.includes(schedule)) {
                        pass = true;
                    }
                });

                if (!pass) {
                    jobs = removeItemFromArr(jobs, job);
                }
            });

            /* jobs.forEach(job => {
                //job.distance = obtenerDistancia(job.user.lat, job.user.lon, latTo, lonTo);

                let origin = job.user.lat + "," + job.user.lon;
                let destination = latTo + "," + lonTo;
                console.log(origin);
                console.log(destination);

                job.distance  =  axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
                    params: {
                        units: "km",
                        origins: origin,
                        destinations: destination,
                        key: 'AIzaSyDgRN1AR5CnGjgdcc3f93CzMho80a2yWog'
                    }
                });

                console.log(job.distance);
            }); */
        }

        pass = false;
        if (services) {

            //Se itera services para ver si los servicios tienen el horario solicitado
            services.forEach(service => {
                scheduleArray.forEach(schedule => {
                    if (service.schedule.includes(schedule)) {
                        pass = true;
                    }
                });

                if (!pass) {
                    services = removeItemFromArr(services, service);
                }
            });
        }

        return res.status(200).send({
            products,
            jobs,
            services
        });
    }

    return res.status(200).send({
        products,
        jobs,
        services
    });
}

function removeItemFromArr(arr, item) {
    var i = arr.indexOf(item);

    if (i !== -1) {
        arr.splice(i, 1);
    }

    return arr;
}

/* async function obtenerDistancia(latFrom, lonFrom, latTo, lonTo) {
    console.log(latFrom);
    console.log(lonFrom);
    console.log(latTo);
    console.log(lonTo);
    let origin = latFrom + "," + lonFrom;
    let destination = latTo + "," + lonTo;
    console.log("Si entro");

    var distancia = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
            units: "km",
            origins: origin,
            destinations: destination,
            key: 'AIzaSyDgRN1AR5CnGjgdcc3f93CzMho80a2yWog'
        }
    });

    return distancia;

    //console.log(distancia.rows[0].elements[0].distance.text);
    //console.log(distancia.rows[0].elements[0].distance.value);
} */

module.exports = {
    home,
    search
}