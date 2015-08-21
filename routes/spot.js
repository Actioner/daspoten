var express = require('express');
var router = express.Router();
var config = require('../app/config/config');
var Spot = require('../app/models/spot');
var Device = require('../app/models/device');
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
        self.spot.declared = {
            by: req.user,
            when: Date.now()
        };
        self.spot.coordinates = [req.body.lng, req.body.lat];

        validator.validate(self.spot,
            function () {
                // save the spot and check for errors
                self.spot.save(function(err, spt) {
                    if (err)
                        res.json(err);
                    res.json({ _id: spt._id });
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
        var lat = req.query.lat || 0;
        var lng = req.query.lng || 0;

        Spot.
            find(
            {
                coordinates:
                { $near :
                    {
                        $geometry: { type: "Point",  coordinates: [ lng, lat ] },
                        $maxDistance: config.get("location:spotNearInMeters")
                    }
                }
            }).
            where('taken').equals(null).
            where('downVotes').lt(config.get("spot:downVotesLimit")).
            where('declared.when').gt(new Date(new Date() - config.get("location:spotAliveInSeconds") * 1000)).
            exec(function(err, spots) {
                if (err)
                    res.json(err);

                res.json(spots);
            });
    });

router.route('/:id')
    // get the spot with that id (accessed at GET http://localhost:8080/api/spots/:spot_id)
    .get(function(req, res) {
        res.json(req.spot);
    });

router.route('/:id/take')
    // take spot with that id (accessed at PUT http://localhost:8080/api/spots/:spot_id/take)
    .put(function(req, res) {
        var self = this;
        if (req.spot.declared.by.equals(req.user._id)) {
            res.json({
                "field": "taken",
                "message": "Declarer and taker cannot be the same",
                "rule": "business"
            });
            return;
        }
        self.spot = req.spot;
        self.spot.taken = {
            by: req.user,
            when: Date.now()
        };

        validator.validate(self.spot,
            function () {
                // save the location and check for errors
                self.spot.save(function(err) {
                    if (err)
                        res.json(err);
                    res.sendStatus(200);
                });
            },
            function(err) {
                if (err)
                    res.json(err);
            }
        );
    });


router.route('/:id/notthere')
    // down vote spots with that id (accessed at PUT http://localhost:8080/api/spots/:spot_id/notthere)
    .put(function(req, res) {
        var self = this;
        self.spot = req.spot;
        ++self.spot.downVotes;

        validator.validate(self.spot,
            function () {
                // save the location and check for errors
                self.spot.save(function(err) {
                    if (err)
                        res.json(err);
                    res.sendStatus(200);
                });
            },
            function(err) {
                if (err)
                    res.json(err);
            }
        );
    });

router.route('/takenearest')
    .put(function(req, res) {
        var self = this;
        var lat = req.body.lat || 0;
        var lng = req.body.lng || 0;

        Spot.
            find(
            {
                coordinates: {
                    $near: {
                        $geometry: {type: "Point", coordinates: [lng, lat]},
                        $maxDistance: config.get("location:spotTakeNearestInMeters")
                    }
                }
            }).
            where('declared.by').ne(req.user._id).
            where('taken').equals(null).
            where('downVotes').lt(config.get("spot:downVotesLimit")).
            where('declared.when').gt(new Date(new Date() - config.get("location:spotAliveInSeconds") * 1000)).
            exec(function (err, spots) {
                if (err)
                    res.json(err);

                if (spots.length == 0) {
                    res.sendStatus(200);
                    return;
                }
                var spotToTake = spots[0];
                spotToTake.taken = {
                    by: req.user,
                    when: Date.now()
                };

                // save the location and check for errors
                spotToTake.save(function (err) {
                    if (err)
                        res.json(err);
                    res.json(spotToTake);
                });
            });
    });

module.exports = router;
