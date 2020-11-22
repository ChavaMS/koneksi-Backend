'use strict'

var Favorite = require('../models/Favorites');
var UserJobs = require('../models/UserJob');
var UserServices = require('../models/UserServices');

function probando(req, res){
    res.status(200).send({message: 'Probando'});
}

function getFavorite(req, res){
    var user = req.user.sub;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Favorite.find({user: user}).paginate(page, itemsPerPage, (err, favorites, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!favorites) return res.status(404).send({message: 'No hay usuarios guardados en favoritos'});
        
        var listsIDs = [];
        
        //Guardo los Ids encontrados en Favorites.userSaved en una lista para hacer más búsquedas con los Ids guardados.
        favorites.forEach(item => {
            listsIDs.push(item.userSaved);
        });
        
        var listaUserJob = [];
        listsIDs.forEach(ID => {
            UserJobs.find({_id:ID}).exec((err, result) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
                console.log(result.user);
                listaUserJob.push(result);
            });
        });
        console.log(listaUserJob);

    
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            favorites
        });
    });
}

//agregar validador de que no exista el registro antes
function saveFavorite(req, res){
    var favorite = new Favorite();

    favorite.user = req.user.sub;
    favorite.userSaved = req.body.userSaved;

    favorite.save((err, newFavorite) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!newFavorite) return res.status(500).send({message: 'Error al guardar en favoritos'});

        return res.status(200).send({message: "Usuario guardado con éxito"});
    });
}


function removeFavorite(req, res){
    var id = req.body.id;
    Favorite.remove({"_id":id, "user": req.user.sub}).exec((err, delFav) => {
        if(err) return res.status(500).send({message: "Error al borrar el usuario favorito"});
        return res.status(200).send({message:"Usuario removido de la lista de favoritos"});
    });
}

module.exports = {
    probando,
    saveFavorite,
    getFavorite,
    removeFavorite
};