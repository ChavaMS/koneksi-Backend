'use strict'

var UserJobs = require('../models/UserJob');
var Jobs = require("../models/Jobs");
var UserProducts = require('../models/UserProducts');
var UserServices = require('../models/UserServices');
var UserJobs = require('../models/UserJob');
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

//--------------------------------------------------------------------------------------------------------------
async function searchJobs(req, res) {
    var params = req.body;
    var itemSearch = params.item.toLowerCase();
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemsPerPage = 5;
    var userJobsArray = new Array();
    var skip = (page - 1) * itemsPerPage;


    var job = await Jobs.find({ name: { '$regex': itemSearch } }).exec().then(job => {

        return job
    }).catch(err => {
        return res.status(500).send({ message: "error buscando el oficio" });
    });
    if (job == undefined) {
        job[0] = 0;
    }

    UserJobs.aggregate([{ $match: { $or: [{ jobs: job[0]._id }, { tags: { '$regex': itemSearch } }] } }, { $group: { _id: '$user' } }, { $skip: skip }, { $limit: itemsPerPage }]).exec().then(async function (results) {
        //retorna usuarios y sus productos
        for (let i = 0; i < results.length; i++) {
            await getUserJobs(results[i], itemSearch).then((value) => {
                //if ((country != '' || state != '' || city != '') && (value.user.country == country || value.user.state == state || value.user.city == city)) {
                userJobsArray[i] = value;
                //}
            });
        }

        //Total de paginas
        var total = await UserJobs.aggregate([{ $match: { $or: [{ name: { '$regex': itemSearch } }, { tags: { '$regex': itemSearch } }] } }, { $group: { _id: '$user' } }, { $count: 'total' }]);
        if (total.length == 0) {
            total = 0;
        } else {
            total = total[0].total;
        }

        var totalPages = Math.ceil(total / itemsPerPage);
        //console.log(total);
        return res.status(200).send({
            userJobsArray,
            total: totalPages
        });
    }).catch(err => {
        console.log(err);
        if (err) {
            return res.status(500).send({ message: 'Error en la petición 1' });
        }
    });
}


async function getUserJobs(id) {
    var usuario = await User.find({ _id: id }, { password: 0 }).exec().then((result) => {
        return result[0];

    }).catch((err) => {
        return handleError(err);
    });


    var trabajos = await UserJobs.find({ user: id }).populate('jobs').limit(4).exec().then((result) => {
        return result;
    }).catch((err) => {
        return handleError(err);
    });

    return {
        'user': usuario,
        'trabajos': trabajos
    };

}

//--------------------------------------------------------------------------------------------------------------
function searchProducts(req, res) {
    var params = req.body;

    var country;
    var state;
    var city;
    if (params.country || params.state || params.city) {
        country = params.country;
        state = params.state;
        city = params.city;
    } else if (req.user) {

        country = req.user.country;
        state = req.user.state;
        city = req.user.city;
    } else {
        country = '';
        state = '';
        city = '';
    }
    /* else {
    var geo = geoip.lookup(req.ip);

    country = geo.country;
    state = geo.region;
    city = geo.city;
} */

    var itemSearch = params.item.toLowerCase();
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemsPerPage = 5;
    var userProductsArray = new Array();
    var skip = (page - 1) * itemsPerPage;

    UserProducts.aggregate([{ $match: { $or: [{ name: { '$regex': itemSearch } }, { tags: { '$regex': itemSearch } }] } }, { $group: { _id: '$user' } }, { $skip: skip }, { $limit: itemsPerPage }]).exec().then(async function (results) {
        //retorna usuarios y sus productos
        for (let i = 0; i < results.length; i++) {
            await getUserProducts(results[i], itemSearch).then((value) => {
                //console.log(value);
                //if ((country != '' || state != '' || city != '') && (value.user.country == country || value.user.state == state || value.user.city == city)) {
                userProductsArray[i] = value;
                //}
            });

            //console.log(userProductsArray);

        }
        //Total de paginas
        var total = await UserProducts.aggregate([{ $match: { $or: [{ name: { '$regex': itemSearch } }, { tags: { '$regex': itemSearch } }] } }, { $group: { _id: '$user' } }, { $count: 'total' }]);
        if (total.length == 0) {
            total = 0;
        } else {
            total = total[0].total;
        }

        var totalPages = Math.ceil(total / itemsPerPage);
        //console.log(total);
        return res.status(200).send({
            userProductsArray,
            total: totalPages
        });
    }).catch(err => {
        console.log(err);
        if (err) {
            return res.status(500).send({ message: 'Error en la petición 1' });
        }
    });
}

async function getUserProducts(id, itemSearch) {
    var usuario = await User.find({ _id: id }, { password: 0 }).exec().then((result) => {
        return result[0];

    }).catch((err) => {
        return handleError(err);
    });


    var productos = await UserProducts.find({ $and: [{ user: id }, { $or: [{ name: { '$regex': itemSearch } }, { tags: { '$regex': itemSearch } }] }] }).limit(3).exec().then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
        return handleError(err);
    });

    return {
        'user': usuario,
        'productos': productos
    };


}
//--------------------------------------------------------------------------------------------------------------
function searchService(req, res) {
    var params = req.body;

    var itemSearch = params.item.toLowerCase();
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemsPerPage = 5;

    UserServices.find({ $or: [{ name: { '$regex': itemSearch } }, { tags: { '$regex': itemSearch } }] }).populate('user', 'name surname image').paginate(page, itemsPerPage, (err, services, total) => {

        if (err) return res.status(500).send({ message: 'Error en la petición' });

        if (!services) return res.status(500).send({ message: 'No hay resultados que mostrar' });

        return res.status(200).send({
            userServiceArray: services,
            total,
            pages: Math.ceil(total / itemsPerPage)
        });

    });

}

function removeItemFromArr(arr, item) {
    var i = arr.indexOf(item);

    if (i !== -1) {
        arr.splice(i, 1);
    }

    return arr;
}


module.exports = {
    home,
    search,
    searchProducts,
    searchJobs,
    searchService
}