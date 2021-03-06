var express = require('express');
var router = express.Router();
const helper = require('../utils/routeCollectionHelper');
var Supplier = require('../models/supplier');
var lib = require('../utils/glib');

// Register
router.get('/register', lib.authenticateRequest, function(req, res) {
    res.render('register-supplier');
});

// modify page
router.get('/register/:id', lib.authenticateRequest, async function(req, res) {

    await helper.getRouterRegisterCollectionId('supplier', req, res)

});

//returns a supplier list page
router.get('/list', lib.authenticateUrl, function(req, res) {
    res.render('list-supplier', {
        title: 'Suppliers',
        dataName: 'supplier'
    });
});

/*listing all parts and return them as a json array*/
router.get('/supplier-list', lib.authenticateRequest, function(req, res) {
    Supplier.list(function(err, list) {

        var arr = [];
        var item;
        for (var i = 0; i < list.length; i++) {
            item = list[i];

            arr.push({
                id: item._id,
                name: item.name,
                description: item.description,
                url: item.url
            });
        }
        res.json(arr);
    });
});

router.get('/item/:ID', lib.authenticateRequest, function(req, res) {
    var id = req.params.ID;
    if (id !== undefined) {
        Supplier.getById(id, function(err, supplier) {
            if (err || supplier === null) {
                res.status(404).send('Not found!');
            } else {
                res.json(supplier);
            }
        });
    }
});

// Register Supplier
router.post('/register', lib.authenticateAdminRequest, function(req, res) {

    var name = req.body.name;
    var description = req.body.description;
    var url = req.body.url;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.render('register-supplier', {
            errors: errors
        });
    } else {
        var newSupplier = new Supplier({
            name: name,
            description: description,
            url: url
        });

        Supplier.create(newSupplier, function(err, supplier) {
            if (err) throw err;
            req.flash('success_msg', 'You successfully created the \"' + newSupplier._doc.name + '\" supplier.');
            res.redirect('/suppliers/register/' + supplier.id);
        });
    }
});

//supplier modify
router.post('/register/:ID', lib.authenticateAdminRequest, function(req, res) {

    var id = req.params.ID;
    req.checkBody('name', 'Name is required').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.render('register-supplier', { errors: errors });
    } else {
        var values = {
            name: req.body.name,
            description: req.body.description,
            url: req.body.url
        };

        Supplier.modify(id, values, function(err, result) {
            if (err || result === null || result.ok !== 1) {
                req.flash('error', ' unable to update');
            } else {
                if (result.nModified === 0) {
                    req.flash('success_msg', 'Supplier is unchanged!');
                } else {
                    req.flash('success_msg', 'Supplier updated!');
                }
            }
            res.redirect('/suppliers/register/' + id);
        });
    }
});


router.delete('/:ID', lib.authenticateAdminRequest, function(req, res) {
    var id = req.params.ID;
    Supplier.delete(id, function(err, result) {
        if (err !== null) {
            res.status(404).send('unable to delete supplier "' + id + '".');
        } else {
            res.status(200).send('Supplier deleted.');
        }
    });

});

router.post('/search', lib.authenticateRequest, async function(req, res) {

    const query = {}
    if (req.body.name) {
        query.name = { $regex: helper.makeRegExFromSpaceDelimitedString(req.body.name, false) }
    }

    if (req.body.description) {
        query.description = { $regex: helper.makeRegExFromSpaceDelimitedString(req.body.description, true) }
    }

    let sorting = helper.makeSortingObject(req.body.sortingMethod);

    try {
        const ret = await Supplier.search(query, sorting, 50, req.body.page, lib.getConfig().listDescriptionMaxLength);
        res.json(ret);
    } catch (err) {
        res.status(err.code ? err.code : 400).json(err);
    }
});

module.exports = router;