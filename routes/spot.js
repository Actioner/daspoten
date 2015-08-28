var express = require('express');
var router = express.Router();
var config = require('../app/config/config');
var Spot = require('../app/models/spot');
var User = require('../app/models/user');
var Device = require('../app/models/device');
var Util = require('../app/components/util');
var SpotValidator = require('../app/validators/spot'),
    LocationValidator = require('../app/validators/location');

var validator = new SpotValidator();
var locationValidator = new LocationValidator();
var util = new Util();

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
        var lat = parseFloat(req.query.lat || 0);
        var lng = parseFloat(req.query.lng || 0);
        var nwlat = parseFloat(req.query.nwlat || 0);
        var nwlng = parseFloat(req.query.nwlng || 0);

        var maxDistance = util.getDistanceFromLatLonInMt(lat,lng,nwlat,nwlng);

        console.log(maxDistance);
        Spot
            .find(
            {
                coordinates:
                { $near :
                    {
                        $geometry: { type: "Point",  coordinates: [ lng, lat ] },
                        $maxDistance: maxDistance
                    }
                }
            })
            .where('valid').equals(true)
            .where('taken').equals(null)
            .where('downVotesCount').lt(config.get("spot:downVotesLimit"))
            .where('declared.when').gt(new Date(new Date() - config.get("location:spotAliveInSeconds") * 1000))
            .exec(function(err, spots) {
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


router.route('/:id/invalid')
    // take spot with that id (accessed at PUT http://localhost:8080/api/spots/:spot_id/take)
    .put(function(req, res) {
        var self = this;
        self.spot = req.spot;

        if (!req.user.admin)
            return res.json({
                "field": "valid",
                "message": "Not enough permissions!",
                "rule": "business"
            });

        self.spot.valid = false;
        self.spot.save(function(err) {
            if (err)
                res.json(err);
            res.sendStatus(200);
        });
    });

router.route('/:id/notthere')
    // down vote spots with that id (accessed at PUT http://localhost:8080/api/spots/:id/notthere)
    .put(function(req, res) {
        var self = this;
        self.spot = req.spot;

        if (self.spot.declared.by == req.user._id)
            return res.json({
                "field": "downVotes",
                "message": "Cannot mark own spot as not there",
                "rule": "business"
            });

        User.findOne({email: req.body.email}, function(err, user) {
            if (err)
                return res.json(err);

            if (self.spot.downVotes.indexOf(user._id) >= 0)
                return res.json({
                    "field": "downVotes",
                    "message": "Already marked the spot as not there",
                    "rule": "business"
                });

            ++self.spot.downVotesCount;
            self.spot.downVotes.push(user._id);
            self.spot.save(function(err) {
                if (err)
                    res.json(err);
                res.sendStatus(200);
            });
        });
    });

router.route('/takenearest')
    .put(function(req, res) {
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
