var express = require('express');
var router = express.Router();
var config = require('../app/config/config');
var Spot = require('../app/models/spot');
var SpotValidator = require('../app/validators/spot'),
    LocationValidator = require('../app/validators/location');

var validator = new SpotValidator();
var locationValidator = new LocationValidator();

router.param('id', function(req, res, next, id) {
    Spot.findById(id, function(err, spot) {
        if (err) {
            res.send(err);
            return;
        }
        if (spot === null) {
            res.sendStatus(404);
            return;
        }
        req.spot = spot;
        next();
    });
});

router.route('/')
    // create a spot (accessed at POST http://localhost:8080/api/spots)
    .post(function(req, res) {
        var self = this;
        self.spot = new Spot();      // create a new instance of the Spot model
        self.spot.declared = { by: req.user };
        self.spot.coordinates = [req.body.lat, req.body.lng];

        validator.validate(self.spot,
            function () {
                // save the spot and check for errors
                self.spot.save(function(err, dev) {
                    if (err)
                        res.json(err);
                    res.json({ _id: dev._id });
                });
            },
            function(err) {
                if (err)
                    res.json(err);
            }
        );
    })
    // get all the spots (accessed at GET http://localhost:8080/api/spots)
    .get(function(req, res) {
        Spot.find(function(err, spots) {
            if (err)
                res.json(err);

            res.json(spots);
        });
    });

router.route('/:id')
    // get the spot with that id (accessed at GET http://localhost:8080/api/spots/:spot_id)
    .get(function(req, res) {
        res.json(req.spot);
    })
    // update the spot with this id (accessed at PUT http://localhost:8080/api/spots/:spot_id)
    .put(function(req, res) {
        var self = this;
        self.spot = req.spot;
        self.spotLocation = new Location.SpotLocation();
        spotLocation.coordinates = [req.body.lat, req.body.lng];
        spotLocation.spot = self.spot;

        locationValidator.validate(self.spotLocation,
            function () {
                // save the location and check for errors
                self.spotLocation.save(function(err, loc) {
                    if (err)
                        res.json(err);
                    self.spot.location.coordinates = loc.coordinates;
                    self.spot.location.when = loc.when;
                    self.spot.save();

                    res.sendStatus(200);
                });
            },
            function(err) {
                if (err)
                    res.json(err);
            }
        );
    });

router.route('/:id/near')
    // get near spots with that id (accessed at GET http://localhost:8080/api/spots/:spot_id)
    .get(function(req, res) {
        Spot.
            find({ parking: true }).
            where('user').ne(req.user).
            where('location.when').gt(new Date(new Date() - config.get("location:spotAliveInSeconds") * 1000)).
            where('location.coordinates').near({
                center: req.spot.location.coordinates,
                spherical: true,
                maxDistance: config.get("location:spotNearInMeters") }).
            select('code location').
            exec(function(err, spots) {
                    if (err)
                        res.json(err);

                    res.json(spots);
                });
    });

module.exports = router;
