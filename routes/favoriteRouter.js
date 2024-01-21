const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    
    Favorite.find({ user: req.user._id })
        .populate('user')
        .populate('campsites')
        .then(favorites => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        })
        .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
        .then(favorite => {
            if (favorite) {
                req.body.forEach(campsite => {
                    if (!favorite.campsites.includes(campsite._id)) {
                        favorite.campsites.push(campsite._id);
                    }
                });
                favorite.save()
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch(err => next(err));
            } else {
                Favorite.create({ user: req.user._id, campsites: req.body.map(campsite => campsite._id) })
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch(err => next(err));
            }
        })
        .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on favorites.');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
        .then(favorite => {
            if (favorite) {
                // If a favorite document is found and deleted
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            } else {
                // If no favorite document is found for the user
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('You do not have any favorites to delete.');
            }
        })
        .catch(err => next(err));
});


favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
        .then(favorite => {
            if (favorite) {
                // Convert campsiteId and existing campsite ids to strings for comparison
                const campsiteIdStr = req.params.campsiteId.toString();
                const campsiteIdsStr = favorite.campsites.map(id => id.toString());

                if (!campsiteIdsStr.includes(campsiteIdStr)) {
                    // Campsite is not already in the favorites, add it
                    favorite.campsites.push(req.params.campsiteId);
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                } else {
                    // If the campsite is already in the favorites
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('That campsite is already in the list of favorites!');
                }
            } else {
                // If there is no favorite document exists, create a new one
                Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch(err => next(err));
            }
        })
        .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
        .then(favorite => {
            if (favorite) {
                favorite.campsites = favorite.campsites.filter(campsite => campsite.toString() !== req.params.campsiteId);
                favorite.save()
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch(err => next(err));
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('You do not have any favorites to delete.');
            }
        })
        .catch(err => next(err));
});


module.exports = favoriteRouter;


