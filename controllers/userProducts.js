'use strict'

var UserProducts = require('../models/UserProducts');
var uploadProducts = require("../middlewares/storageProducts");
var userProductsImagePath = "./uploads/userProducts/products/";



//-------PRUEBAS--------
function home(req, res) {
    res.status(200).send({ message: 'Hola mundo' });
}

function pruebas(req, res) {
    res.status(200).send({ message: 'Accion de pruebas en el servidor de nodejs' });
}
//---------------------

function saveProducts(req, res) {
    uploadProducts(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file");
        }

        //DATOS
        var params = req.body;
        var file_name = req.files;
        var ids = new Array;
        var error = false;

        for (let i = 0; i < params.name.length; i++) {
            let userProducts = new UserProducts();
            userProducts.name = params.name[i];
            userProducts.description = params.description[i];
            userProducts.price = params.price[i];
            userProducts.image = file_name[i].filename;
            userProducts.user = params.id;

            userProducts.save((err, products) => {
                if (err) error = true;

                console.log(products._id);
                ids.push(products._id);
            });
        }

        console.log(ids);
        if (error) {
            ids.forEach(id => {
                UserProducts.findByIdAndDelete(id, function (err, deleted) {
                    console.log("borrado con exito");
                });
            });

        }else{
            console.log('todo bien');
        }
    });
}


module.exports = {
    home,
    pruebas,
    saveProducts
}