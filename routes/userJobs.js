'use strict'


//EN USO
var express = require('express');
const userJobs = require('../controllers/userJobs');
var UserJobsController = require('../controllers/userJobs');
var api = express.Router();
var md_auth = require('../middlewares/authenticate');

//RUTAS GET
api.get('/pruebas-j', UserJobsController.pruebas);
api.get('/home-j', UserJobsController.home);
api.get('/get-user-jobs/:id', UserJobsController.getUserJobs);

//RUTAS POST
api.post('/save-user-jobs', UserJobsController.saveUserJobs);
api.post('/save-user-job',md_auth.ensureAuth, UserJobsController.saveUserJob);

//RUTAS DELETE
api.delete('/delete-job/:id', md_auth.ensureAuth, userJobs.deleteUserJob);

//RUTAS PUT
api.put('/update-user-job/:id', md_auth.ensureAuth, UserJobsController.updateUserJob);

module.exports = api;