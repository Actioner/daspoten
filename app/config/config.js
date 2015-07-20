/**
 * Created by Jfrb on 7/19/2015.
 */
var nconf = require('nconf');

nconf
    .argv()
    .env()
    .file({ file: './app/config/default.json' });

module.exports = nconf;