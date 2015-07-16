/**
 * Created by jfrodriguez on 7/8/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BearSchema = new Schema({
    name: String
});

module.exports = mongoose.model('Bear', BearSchema);
