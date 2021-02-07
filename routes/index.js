var express = require('express');
var router = express.Router();
var lib = require('../utils/glib');

// Get Homepage
router.get('/', lib.authenticateUrl, function (req, res) {
	res.render('index');
});


router.get('/about', function (req, res) {
	res.render('about');
});

router.get('/result', function (req, res) {
	res.render('result');
});

module.exports = router;