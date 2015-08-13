var express = require('express'),
    router = express.Router(),
    authPassport = require('../app/components/authPassport');
var bearApi = require('./bear'),
    userApi = require('./user'),
    deviceApi = require('./device'),
    spotApi = require('./spot');

/* GET users listing. */
router.get('/', function(req, res) {
  res.json({ message: 'welcome to haibu api!' });
});

router.use('/users', userApi);
router.use('/devices', authPassport.authenticate('bearer', {session: false}), deviceApi);
router.use('/spots', authPassport.authenticate('bearer', {session: false}), spotApi);

module.exports = router;
