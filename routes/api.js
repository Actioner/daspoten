var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.json({ message: 'welcome to daspoten api!' });
});

module.exports = router;
