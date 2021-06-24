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
            for(i=0;i<req.body.length;i++)
                if(favs.dishes.indexOf(req.body[i]._id)<0)
                    favs.dishes.push(req.body[i]);
            favs.save()
            .then(favs=>{
                Favorites.findById(favs._id)
                .populate('user')
                .populate('dishes')
                .then(favs=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favs);
                })
            })
            .catch(err=>next(err));
        }else{
            Favorites.create({user:req.user,dishes:req.body})
            .then(favs=>{
                Favorites.findById(favs._id)
                .populate('user')
                .populate('dishes')
                .then(favs=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favs);
                })
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
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .then(favs=>{
        if(!favs){
            res.status=200;
            res.setHeader('Content-Type','application/json');
            return res.json({"exists":false,"favorites":favs});
        }else{
            if(favs.dishes.indexOf(req.params.dishId)<0){
                res.status=200;
                res.setHeader('Content-Type','application/json');
                return res.json({"exists":false,"favorites":favs});
            }else{
                res.status=200;
                res.setHeader('Content-Type','application/json');
                return res.json({"exists":true,"favorites":favs});
            }
        }
    },err=>next(err))  
    .catch(err=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .then(favs=>{
        if(favs!=null){
            if(favs.dishes.indexOf(req.params.dishId)<0)
                favs.dishes.push({_id:req.params.dishId});
            favs.save()
            .then(favs=>{
                Favorites.findById(favs._id)
                .populate('user')
                .populate('dishes')
                .then(favs=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favs);
                })
            })
            .catch(err=>next(err));
        }else{
            Favorites.create({user:req.user,dishes:req.params.dishId})
            .then(favs=>{
                Favorites.findById(favs._id)
                .populate('user')
                .populate('dishes')
                .then(favs=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favs);
                })
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
                        Favorites.findById(favs._id)
                        .populate('user')
                        .populate('dishes')
                        .then(favs=>{
                            res.statusCode=200;
                            res.setHeader('Content-Type','application/json');
                            res.json(favs);
                        })
                    })
                }else{
                    Favorites.findById(favs._id)
                    .populate('user')
                    .populate('dishes')
                    .then(favs=>{
                        res.statusCode=200;
                        res.setHeader('Content-Type','application/json');
                        res.json(favs);
                    })
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