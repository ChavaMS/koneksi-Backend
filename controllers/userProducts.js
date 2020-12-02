'use strict'

var UserProducts = require('../models/UserProducts');
var User = require('../models/User');
var uploadProducts = require("../middlewares/storageProducts");
var userProductsImagePath = "./uploads/userProducts/products/";
const Transaction = require("mongoose-transactions");

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

/* 
FORM-DATA:
    *name
    *description
    *price
    *product [image]
    *id -> id del user 
    *tags -> ["tag1,tag2"] 

    URL: /save-products
*/
function saveProducts(req, res) {
    uploadProducts(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file 2");
        }
        //Transacción
        var transaction = new Transaction();
        //Modelo
        var userProducts = new UserProducts();
        //Datos
        var params = req.body;
        var file_name = req.files;
        var error = false;


        try {

            if (!Array.isArray(params.description)) {
                userProducts.name = params.name;
                userProducts.original_name = params.name;
                userProducts.description = params.description;
                userProducts.price = params.price;
                userProducts.image = file_name.filename;
                userProducts.user = params.id;

                //Se representa como ["tag1,tag2", "tag1,tag2"] 
                userProducts.tags = params.tags.split(',');

                transaction.insert('UserProducts', userProducts);
            } else {
                for (let i = 0; i < params.name.length; i++) {
                    userProducts = new UserProducts();
                    if (params.name[i] && params.description[i] && params.price[i] && file_name[i].filename && params.id) {

                        userProducts.name = params.name[i].toLowerCase();
                        userProducts.original_name = params.name[i];
                        userProducts.description = params.description[i];
                        userProducts.price = params.price[i];
                        userProducts.image = file_name[i].filename;
                        userProducts.user = params.id;

                        //Se representa como ["tag1,tag2", "tag1,tag2"] 
                        userProducts.tags = params.tags[i].split(',');

                        transaction.insert('UserProducts', userProducts);

                    } else {
                        error = true;

                    }
                }
            }



            if (!error) {
                transaction.run();
                return res.status(200).send({ message: "Productos agregados con éxito" });
            } else {
                transaction.rollback();
                transaction.clean();
                for (let i = 0; i < file_name.length; i++) {
                    removeFileOfUploads(res, userProductsImagePath + file_name[i].filename, "Error al actualizar el banner");
                }
                return res.status(200).send({ message: "Error al agregar los productos" });
            }

        } catch (error) {
            for (let i = 0; i < file_name.length; i++) {
                removeFileOfUploads(res, userProductsImagePath + file_name[i].filename, "Error al actualizar el banner");
            }
            console.error(error);
            transaction.rollback().catch(console.error);
            transaction.clean();
            console.log(transaction);
            return res.status(200).send({ message: "Error al agregar los productos" });
        }
    });
}

/* 
    URL: /deleteProduct/:id -> id del producto a eliminar
    INCLUDE - AUTHENTICATION
*/
function deleteProduct(req, res) {
    var productId = req.params.id;
    var productImagePath = "";
    var userProductId = 0;

    UserProducts.findById({ '_id': productId }, (err, product) => {
        productImagePath = product.image;
        userProductId = product.user;
    });

    //Se comrpueba que el que va a borrar el producto, sea el que lo creó
    if (userProductId == req.user.sub) {
        UserProducts.deleteOne({ 'user': req.user.sub, '_id': productId }, (err, result) => {
            if (err) return res.status(500).send({ message: 'Error al borrar el product' });

            removeFileOfUploads(res, userProductsImagePath + productImagePath, "Imagen borrada correctamente");

            return res.status(200).send({ message: 'Producto borrado correctamente' });
        });
    }
}

/* 
FORM-DATA:
    *name
    *description
    *price
    *product [image]

    URL: /update-product/:id -> id del producto a editar
    INCLUDE - AUTHENTICATION
*/
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
/* 
FORM-DATA:
    *name
    *description
    *price
    *product

    URL: /save-product
    INCLUDE - AUTHETICATION
*/
function saveProduct(req, res) {
    uploadProducts(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file 2");
        }

        //DATOS
        var params = req.body;
        var file_name = req.files[0].filename;

        let userProducts = new UserProducts();

        userProducts.name = params.name.toLowerCase();
        userProducts.original_name = params.name;
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

/* 
    URL: /get-products/:id -> id de un cliente
    URL: /get-products     -> Todos los productos
*/
async function getProducts(req, res) {
    var userId = req.params.id;

    if (userId && userId != 0) {
        console.log('entró');
        UserProducts.find({ user: userId }, { user: 0 }).exec((err1, products) => {
            if (err1) return res.status(500).send({ message: 'Error al buscar productos' });

            if (!products) return res.status(404).send({ message: 'No hay productos que mostrar' });

            User.find({ _id: userId }, { password: 0 }).exec((err2, user) => {
                if (err2) return res.status(500).send({ message: 'Error al buscar productos' });

                if (!user) return res.status(404).send({ message: 'No hay productos que mostrar' });

                return res.status(200).send({
                    products,
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

        var userProductsArray = new Array();
        //Retorna el id de los usuarios con productos
        var myAggregate = UserProducts.aggregate([{ $group: { _id: "$user" } }]);

        const options = {
            page: page,
            limit: itemsPerPage
        };

        //Pagina lo anterior
        UserProducts.aggregatePaginate(myAggregate, options).then(async function (results) {

            //console.log(results.docs);
            //retorna los productos por usuario y su usuario
            for (let i = 0; i < results.docs.length; i++) {
                await getUser(results.docs[i]).then((value) => {
                    userProductsArray[i] = value;

                    //console.log(userProductsArray);
                });
    
            }

            return res.status(200).send({
                userProductsArray,
                total: results.totalPages
            });

        }).catch(function (err) {
            if(err){
                return res.status(500).send({message: 'Error en la petición'});

            }
        });
        //Todos los productos desordenados

    }

}

async function getUser(id) {
    var usuario = await User.find({ _id: id }, { password: 0 }).exec().then((result) => {
        return result[0];

    }).catch((err) => {
        return handleError(err);
    });


    var productos = await UserProducts.find({ user: id }).limit(3).exec().then((result) => {
        return result;
    }).catch((err) => {
        return handleError(err);
    });

    return {
        'user': usuario,
        'productos': productos
    };


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

//MANEJO DE ARCHIVOS
function removeFileOfUploads(res, file_path, message) {
    console.log(file_path);
    fs.unlink(file_path, (err) => {
        console.log('Borrado');
    });
}

/*
    URL: /get-product-image/:imageFile -> id de la imagen
*/
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