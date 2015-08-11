/**
 * Created by jfrodriguez on 7/8/2015.
 */
var mongoose = require('mongoose'),
    config = require('../config/config'),
    util = require('util');

var Schema = mongoose.Schema;

function LocationSchema(){
    Schema.apply(this, arguments);

    this.add({
        coordinates: { type: [Number], index: '2dsphere'}
    });
};
util.inherits(LocationSchema, Schema);

var DeviceLocationSchema = new LocationSchema({
    device:  { type: Schema.Types.ObjectId, ref: 'Device' },
    when: {
        type: Date,
        default: Date.now,
        expires: config.get('location:deviceExpiresAtSeconds')
    }
});

var DeviceLocation = mongoose.model('DeviceLocation', DeviceLocationSchema);
//var Boss = Person.discriminator('Boss', BossSchema);

module.exports = {
    'DeviceLocation': DeviceLocation
};
