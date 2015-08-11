var express = require('express'),
    router = express.Router(),
    authPassport = require('../app/components/authPassport');
var bearApi = require('./bear'),
    userApi = require('./user'),
    deviceApi = require('./device');

/* GET users listing. */
router.get('/', function(req, res) {
  res.json({ message: 'welcome to daspoten api!' });
});

router.use('/bears', authPassport.authenticate('bearer', {session: false}), bearApi);
router.use('/users', userApi);
router.use('/devices', authPassport.authenticate('bearer', {session: false}), deviceApi);

module.exports = router;
