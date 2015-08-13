/**
 * Created by jfrodriguez on 7/8/2015.
 */
var mongoose = require('mongoose')
    Location = require('./location'),
    config = require('../config/config');
var Schema = mongoose.Schema;

//TODO: mongoose 4.2 will have one-to-one support
var SpotSchema = new Schema({
    declared:
    {
        by: { type: Schema.Types.ObjectId, ref: 'User' },
        when: { type: Date, default: Date.now, expires: config.get('location:spotExpiresAtSeconds') }
    },
    taken:
    {
        by: { type: Schema.Types.ObjectId, ref: 'User' },
        when: { type: Date, expires: config.get('location:spotExpiresAtSeconds') }
    },
    coordinates: { type: [Number], default: [0, 0], index: '2dsphere' },
    downVotes: { type: Number, default: 0 }
});

module.exports = mongoose.model('Spot', SpotSchema);
