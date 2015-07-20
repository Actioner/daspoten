var express = require('express');
var router = express.Router();
var Bear = require('../app/models/bear');
var BearValidator = require('../app/validators/bear');

var validator = new BearValidator();

router.param('id', function(req, res, next, id) {
    Bear.findById(id, function(err, bear) {
        if (err) {
            res.send(err);
            return;
        }
        if (bear === null) {
            res.status(404)
                .send('Not found');
            return;
        }


        req.bear = bear;
        next();
    });
});

router.route('/')
    // create a bear (accessed at POST http://localhost:8080/api/bears)
    .post(function(req, res) {
        var self = this;
        self.bear = new Bear();      // create a new instance of the Bear model
        self.bear.name = req.body.name;  // set the bears name (comes from the request)

        validator.validate(self.bear,
            function () {
                // save the bear and check for errors
                self.bear.save(function(err) {
                    if (err)
                        res.json(err);

                    res.json({ message: 'Bear created!' });
                });
            },
            function(err) {
                if (err)
                    res.json(err);
            }
        );
    })
    // get all the bears (accessed at GET http://localhost:8080/api/bears)
    .get(function(req, res) {
        Bear.find(function(err, bears) {
            if (err)
                res.json(err);

            res.json(bears);
        });
    });

router.route('/:id')
    // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
    .get(function(req, res) {
        res.json(req.bear);
    })
    // update the bear with this id (accessed at PUT http://localhost:8080/api/bears/:bear_id)
    .put(function(req, res) {
        var self = this;
        // use our bear model to find the bear we want
        req.bear.name = req.body.name;
        self.bear = req.bear;
        validator.validate(self.bear,
            function () {
                // save the bear and check for errors
                self.bear.save(function(err) {
                    if (err)
                        res.json(err);

                    res.json({ message: 'Bear updated!' });
                });
            },
            function(err) {
                if (err)
                    res.json(err);
            }
        );
    })
    // delete the bear with this id (accessed at DELETE http://localhost:8080/api/bears/:bear_id)
    .delete(function(req, res) {
        Bear.remove({
            _id: req.bear.id
        }, function(err, bear) {
            if (err)
                res.json(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

module.exports = router;
