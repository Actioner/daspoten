/**
 * Created by Jfrb on 7/18/2015.
 */
var express = require('express'),
    router = express.Router(),
    authPassport = require('../app/components/authPassport'),
    jwt = require('jsonwebtoken'),
    config = require('../app/config/config');

router.route('/login')
    .get(function (req, res) {
        res.render('login');
    })
    .post(function (req, res, next) {
        authPassport.authenticate('local', {session: false}, function (err, user) {
            if (err) {
                return next(err)
            }
            if (!user) {
                return res.status(401).json({error: 'Invalid Username or password'});
            }
            var userToSign = {};
            userToSign.displayName = user.displayName;
            userToSign.provider = user.provider;
            userToSign.email = user.email;
            //user has authenticated correctly thus we create a JWT token
            var token = jwt.sign(userToSign, config.get('auth:secret'), {expiresInMinutes: config.get('jwt:expiresInMinutes')});
            res.json({access_token: token});
        })(req, res, next);
    });

router.post('/refresh', function (req, res, next) {
    authPassport.authenticate('bearer', function (err, user) {
        if (err) {
            res.status(401).json({message: "Error occured: " + err});
        } else {
            var token = jwt.sign(user, config.get('auth:secret'), {expiresInMinutes: config.get('jwt:expiresInMinutes')});
            res.json({access_token: token});
        }
    })(req, res, next);
});

router.get('/facebook',
    // facebook authentication
    authPassport.authenticate('facebook', {session: false, scope: []})
);

router.get('/facebook/callback', function (req, res, next) {
    authPassport.authenticate('facebook', {session: false, failureRedirect: "~/"}, function (err, user) {
        if (err) {
            res.status(401).json({message: "Error occured: " + err});
        } else {
            var userToSign = {};
            userToSign.displayName = user.displayName;
            userToSign.provider = user.provider;
            userToSign.facebookId = user.facebookId;
            var token = jwt.sign(userToSign, config.get('auth:secret'), {expiresInMinutes: config.get('jwt:expiresInMinutes')});

            res.json({access_token: token});
        }
    })(req, res, next);
});

module.exports = router;