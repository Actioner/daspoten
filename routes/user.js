/**
 * Created by Jfrb on 7/19/2015.
 */

var express = require('express'),
    router = express.Router(),
    authPassport = require('../app/components/authPassport'),
    User = require('../app/models/user'),
    config = require('../app/config/config')
    jwt = require('jsonwebtoken');

router.route('/')
   // get current user
    .get(function(req, res, next) {
        authPassport.authenticate('bearer', function(err, user) {
            if (err) {
                res.status(401).json({ message: "Error occured: " + err });
            } else {
                if (user.provider === 'local')
                    res.json({email: user.email, displayName: user.displayName});

                if (user.provider === 'facebook')
                    res.json({facebookId: user.facebookId, displayName: user.displayName});

            }
        })(req, res, next);
    });

router.post('/signin', function(req, res) {
    User.findOne({email: req.body.email}, function(err, user) {
        if (err) {
            res.json({ success: false, message: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({ success: false, message: "User already exists!"
                });
            } else {
                var userModel = new User();
                userModel.displayName = req.body.displayName;
                userModel.email = req.body.email;
                userModel.password = req.body.password;
                userModel.save(function(err, user) {
                    var userToSign = {};
                    userToSign.displayName = user.displayName;
                    userToSign.provider = user.provider;
                    userToSign.email = user.email;
                    res.json({ success: true, access_token: jwt.sign(userToSign, config.get('auth:secret'), { expiresInMinutes: config.get('jwt:expiresInMinutes')}) });
                })
            }
        }
    });
});

module.exports = router;