/**
 * Created by Jfrb on 7/18/2015.
 */
var passport = require('passport'),
    config = require('../config/config'),
    FacebookStrategy = require('passport-facebook').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    LocalStrategy = require('passport-local').Strategy,
    User = require('../models/user'),
    jwt = require('jsonwebtoken'),
    util = require('util');


//passport facebook strategy configuration
passport.use(
    new FacebookStrategy({
            clientID: config.get('facebook:appId'),
            clientSecret: config.get('facebook:appSecret'),
            callbackURL: config.get('facebook:callbackUrl')
        },
        function (token, refreshToken, profile, done) {
            User.findOrCreateFacebook({
                facebookId: profile.id,
                displayName: profile.displayName
            }, function (err, result) {
                if (result) {
                    result.fb_token = token;
                    done(null, result);
                } else {
                    done(err, null);
                }
            });
        }
    ));

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        session: false
    },
    function(username, password, done) {
        User.findOne({ email: username }, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false);
            user.comparePassword(password, function(err, isMatch) {
                if (err) return done(err);
                if(isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        });
    }
));

//passport bearer strategy configuration
passport.use(
    new BearerStrategy({ "passReqToCallback": true },
        function (req, token, done) {
            jwt.verify(token, config.get('auth:secret'), function (err, decoded) {
                if (err) {
                    if (err instanceof jwt.TokenExpiredError) {
                        done(err, false, 'The access token expired');
                    }
                    else if (err instanceof jwt.JsonWebTokenError) {
                        done(err, false, util.format('Invalid token (%s)', err.message));
                    }
                    else {
                        done(err, false);
                    }
                } else {
                    req.user = decoded;
                    return done(null, decoded, {scope: 'all'})
                }
            });
        }
    )
);

module.exports = passport;