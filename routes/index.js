var express = require('express');
var router = express.Router();
var lib = require('../utils/glib');
const Part = require('../models/part');
const Type = require('../models/type');
const Location = require('../models/location');
const Action = require('../models/action');
const Supplier = require('../models/supplier');
const Manufacturer = require('../models/manufacturer');
const User = require('../models/user');
const File = require('../models/file');
const marked = require("marked");
// Get Homepage
router.get('/', lib.authenticateUrl, async function(req, res) {
    try {
        const partCount = await Part.countDocuments();
        const locationCount = await Location.countDocuments();
        const typeCount = await Type.countDocuments();
        const actionCount = await Action.countDocuments();
        const supplierCount = await Supplier.countDocuments();
        const manufacturerCount = await Manufacturer.countDocuments();
        const fileCount = await File.countDocuments();
        const imageCount = await File.imageCount()
        const userCount = await User.countDocuments()
        const obj = {
            partCount: partCount,
            locationCount: locationCount,
            typeCount: typeCount,
            actionCount: actionCount,
            supplierCount: supplierCount,
            manufacturerCount: manufacturerCount,
            fileCount: fileCount,
            imageCount: imageCount,
            userCount: userCount
        }
        res.render('index', obj);
    } catch (err) {
        res.render('index');
    }
});


router.get('/about', function(req, res) {
    res.render('about');
});

router.get('/result', function(req, res) {
    res.render('result');
});

router.post('/convert/markdown', lib.authenticateUrl, function(req, res) {
    req.checkBody('text', 'text is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.send(`<pre>${errors[0].msg}</pre>`);
        return;
    };

    res.send(marked(req.body.text));
});

module.exports = router;