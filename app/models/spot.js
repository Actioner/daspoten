/**
 * Created by jfrodriguez on 7/8/2015.
 */
var mongoose = require('mongoose')
    Location = require('./location');
var Schema = mongoose.Schema;

var SpotSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    location: {
        coordinates: { type: [Number], default: [0, 0], index: '2dsphere'},
        when: { type: Date, default: Date.now }
    }// { type: Schema.Types.ObjectId, ref: 'SpotLocation' }
});
SpotSchema.index({'location.coordinates':"2dsphere"});

module.exports = mongoose.model('Spot', SpotSchema);
