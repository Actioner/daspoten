var express = require('express');
var router = express.Router();
var config = require('../app/config/config');
var Device = require('../app/models/device');
var DeviceValidator = require('../app/validators/device'),
    LocationValidator = require('../app/validators/location');

var validator = new DeviceValidator();
var locationValidator = new LocationValidator();

router.param('id', function(req, res, next, id) {
    Device.findById(id, function(err, device) {
        if (err) {
            res.send(err);
            return;
        }
        if (device === null) {
            res.sendStatus(404);
            return;
        }
        req.device = device;
        next();
    });
});

router.route('/')
    // create a device (accessed at POST http://localhost:8080/api/devices)
    .post(function(req, res) {
        var self = this;
        self.device = new Device();      // create a new instance of the Device model
        self.device.code = req.body.code;  // set the devices name (comes from the request)
        self.device.user = req.user;
        self.device.parking = req.body.parking;

        validator.validate(self.device,
            function () {
                // save the device and check for errors
                self.device.save(function(err, dev) {
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
    // get all the devices (accessed at GET http://localhost:8080/api/devices)
    .get(function(req, res) {
        Device.find(function(err, devices) {
            if (err)
                res.json(err);

            res.json(devices);
        });
    });

router.route('/:id')
    // get the device with that id (accessed at GET http://localhost:8080/api/devices/:device_id)
    .get(function(req, res) {
        res.json(req.device);
    })
    // update the device with this id (accessed at PUT http://localhost:8080/api/devices/:device_id)
    .put(function(req, res) {
        var self = this;
        self.device = req.device;
        self.deviceLocation = new Location.DeviceLocation();
        deviceLocation.when = Date.now();
        deviceLocation.coordinates = [req.body.lat, req.body.lng];
        deviceLocation.device = self.device;

        locationValidator.validate(self.deviceLocation,
            function () {
                // save the location and check for errors
                self.deviceLocation.save(function(err, loc) {
                    if (err)
                        res.json(err);
                    self.device.location.coordinates = loc.coordinates;
                    self.device.location.when = loc.when;
                    self.device.save();

                    res.sendStatus(200);
                });
            },
            function(err) {
                if (err)
                    res.json(err);
            }
        );
    });

router.route('/near/:id')
    // get near devices with that id (accessed at GET http://localhost:8080/api/devices/:device_id)
    .get(function(req, res) {
        Device.
            find({ parking: true }).
            where('user').ne(req.user).
            where('location.when').gt(new Date(new Date() - config.get("location:deviceAliveInSeconds") * 1000)).
            where('location.coordinates').near({
                center: req.device.location.coordinates,
                spherical: true,
                maxDistance: config.get("location:deviceNearInMeters") }).
            select('code location').
            exec(function(err, devices) {
                    if (err)
                        res.json(err);

                    res.json(devices);
                });
    });

module.exports = router;
