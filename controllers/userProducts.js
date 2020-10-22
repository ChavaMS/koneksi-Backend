'use strict'

var UserProducts = require('../models/UserProducts');
var uploadProducts = require("../middlewares/storageProducts");
var userProductsImagePath = "./uploads/userProducts/products/";
const Transaction = require("mongoose-transactions");
const transaction = new Transaction();
var fs = require('fs');
var path = require('path');


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
            return res.end("Error uploading file 2");
        }

        //DATOS
        var params = req.body;
        var file_name = req.files;
        //var ids = new Array;
        var error = false;


        try {
            for (let i = 0; i < params.name.length; i++) {
                let userProducts = new UserProducts();
                if (params.name[i] && params.description[i] && params.price[i] && file_name[i].filename && params.id) {
                    userProducts.name = params.name[i];
                    userProducts.description = params.description[i];
                    userProducts.price = params.price[i];
                    userProducts.image = file_name[i].filename;
                    userProducts.user = params.id;
                } else {
                    error = true;
                }
                transaction.insert('UserProducts', userProducts);
            }
            if (!error) {
                transaction.run();
                return res.status(200).send({ message: "Productos agregados con éxito" });
            } else {
                transaction.rollback();
                transaction.clean();
                return res.status(200).send({ message: "Error al agregar los productos" });
            }

        } catch (error) {
            for (let i = 0; i < file_name.length; i++) {
                removeFileOfUploads(res, userProductsImagePath + file_name[i].filename, "Error al actualizar el banner");
            }
            console.error(error);
            const rollbackObj = transaction.rollback().catch(console.error);
            transaction.clean();
            console.log(transaction);
            return res.status(200).send({ message: "Error al agregar los productos" });
        }
    });
}

function deleteProduct(req, res) {
    var productId = req.params.id;
    var productImagePath = "";
    UserProducts.findById({ '_id': productId }, (err, product) => {
        productImagePath = product.image;
    });
    UserProducts.deleteOne({ 'user': req.user.sub, '_id': productId }, (err, result) => {
        if (err) return res.status(500).send({ message: 'Error al borrar el product' });

        removeFileOfUploads(res, userProductsImagePath + productImagePath, "Imagen borrada correctamente");

        return res.status(200).send({ message: 'Producto borrado correctamente' });
    });

}

function updateProduct(req, res) {

    uploadProducts(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file 2");
        }
        var productId = req.params.id;
        var update = req.body;
        var productImagePath = "";

        if (req.files[0]) {
            UserProducts.findById({ '_id': productId }, (err, product) => {
                productImagePath = product.image;
            });

            update.image = req.files[0].filename;
        }

        UserProducts.findByIdAndUpdate(productId, update, { new: true }, (err, productUpdated) => {
            if (err) return res.status(500).send({ message: 'Error en la petición' });

            if (!productUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el producto' });

            if (req.files[0]) removeFileOfUploads(res, userProductsImagePath + productImagePath, "Imagen borrada correctamente");

            return res.status(200).send({
                product: productUpdated
            });
        });
    });


}

function saveProduct(req, res) {
    uploadProducts(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file 2");
        }

        //DATOS
        var params = req.body;
        var file_name = req.files[0].filename;

        let userProducts = new UserProducts();

        userProducts.name = params.name;
        userProducts.description = params.description;
        userProducts.price = params.price;
        userProducts.image = file_name.filename;
        userProducts.user = req.user.sub;

        userProducts.save((err, productStored) => {
            if (err) {
                removeFileOfUploads(res, userProductsImagePath + file_name, "Error al guardar el producto");
                return res.status(200).send({ message: 'Error al guardar el producto' });

            }
            if (productStored) {
                res.status(200).send({ user: productStored });
            } else {
                removeFileOfUploads(res, userProductsImagePath + file_name, "Error al guardar el producto");
                return res.status(200).send({ message: 'Error al guardar el producto' });
            }
        });
    });
}


function getProducts(req, res) {
    var userId = req.params.id;

    UserProducts.find({ user: userId }).exec((err, result) => {
        if (err) return res.status(500).send({ message: 'Error al buscar productos' });

        if (!result) return res.status(404).send({ message: 'No hay productos que mostrar' });

        return res.status(200).send({
            products: result
        });
    });
}


//MANEJO DE ARCHIVOS
function removeFileOfUploads(res, file_path, message) {
    console.log(file_path);
    fs.unlink(file_path, (err) => {
        console.log('Borrado');
    });
}

function getImageProduct(req, res) {
    var imageFile = req.params.imageFile;
    var path_file = 'uploads/userProducts/products/' + imageFile;
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
    pruebas,
    saveProducts,
    deleteProduct,
    updateProduct,
    saveProduct,
    getProducts,
    getImageProduct
}