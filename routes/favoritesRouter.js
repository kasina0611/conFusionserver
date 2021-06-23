const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favorites');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoritesRouter=express.Router();

favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200); })
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .populate('dishes')
    .populate('user')
    .then(favs=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(favs);
    },err=>next(err))
    .catch(err=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .then(favs=>{
        if(favs!=null){
            favs.dishes.push(req.body);
            favs.save()
            .then(favs=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favs);
            })
            .catch(err=>next(err));
        }else{
            Favorites.create({user:req.user,dishes:req.body})
            .then(favs=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favs);
            })
            .catch(err=>next(err));
        }
    },err=>next(err))
    .catch(err=>next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.remove({user:req.user._id})
    .then(favs=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(favs);
    },err=>next(err))
    .catch(err=>next(err));
});

favoritesRouter.route('/:dishId')
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .then(favs=>{
        if(favs!=null){
            favs.dishes.push({_id:req.params.dishId});
            favs.save()
            .then(favs=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favs);
            })
            .catch(err=>next(err));
        }else{
            Favorites.create({user:req.user,dishes:req.params.dishId})
            .then(favs=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favs);
            })
            .catch(err=>next(err));
        }
    },err=>next(err))
    .catch(err=>next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .then(favs=>{
        if(favs!=null){
            favs.dishes.pull(req.params.dishId);
            favs.save()
            .then(favs=>{
                if(favs.dishes.length===0){
                    Favorites.deleteOne({user:favs.user})
                    .then(favs=>{
                        res.statusCode=200;
                        res.setHeader('Content-Type','application/json');
                        res.json(favs);
                    })
                }else{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favs);
                }
            },err=>next(err))
            .catch(err=>next(err));
        }else{
            var err=new Error('There are no dishes to delete');
            next(err);
        }
    },err=>next(err))
    .catch(err=>next(err));
});

module.exports=favoritesRouter;