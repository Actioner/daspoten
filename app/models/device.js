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
    parking: Boolean,
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Device', DeviceSchema);
