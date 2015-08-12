/**
 * Created by jfrodriguez on 7/8/2015.
 */
var mongoose = require('mongoose')
    Location = require('./location');
var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
    code: String,
    brand: String,
    model: String,
    parking: {type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    location: {
        coordinates: { type: [Number], default: [0, 0], index: '2dsphere'},
        when: { type: Date, default: Date.now }
        //TODO: mongoose 4.2 will have one-to-one support
    }// { type: Schema.Types.ObjectId, ref: 'DeviceLocation' }
});

module.exports = mongoose.model('Device', DeviceSchema);
