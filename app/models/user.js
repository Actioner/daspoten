/**
 * Created by jfrodriguez on 7/8/2015.
 */
var mongoose = require('mongoose'),
    config = require('../config/config'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    facebookId: {
        type: String
    },
    displayName: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    provider: {
        type: String, default: 'local'
    }
});

UserSchema.statics.findOrCreateFacebook = function (filters, cb) {
    User = this;
    this.find(filters, function(err, results) {
        if(results.length == 0) {
            var newUser = new User();
            newUser.facebookId = filters.facebookId;
            newUser.displayName = filters.displayName;
            newUser.provider = 'facebook';
            newUser.save(function(err, doc) {
                cb(err, doc)
            });
        } else {
            cb(err, results[0]);
        }
    });
};

UserSchema.pre('save', function(next) {
    var user = this;

    if(!user.isModified('password')) return next();
    bcrypt.genSalt(config.get('bcrypt:saltWorkFactor'), function(err, salt) {
        if(err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// Password verification
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
