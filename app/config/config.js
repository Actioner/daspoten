/**
 * Created by Jfrb on 7/19/2015.
 */
var nconf = require('nconf');

nconf
    .argv()
    .env()
    .file({ file: __dirname + '/default.json' });

module.exports = nconf;