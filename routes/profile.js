var express = require('express'),
    router = express.Router(),
    authPassport = require('../app/components/authPassport');

router.get('/',
    authPassport.authenticate('bearer', {session: false}),
    function (req, res, next) {
        res.render('profile', {user: req.user});
    });

module.exports = router;
