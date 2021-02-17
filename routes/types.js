var express = require('express');
var router = express.Router();
var Type = require('../models/type');
var Part = require('../models/part');
var lib = require('../utils/glib');


// Register
router.get('/register', lib.authenticateRequest, function(req, res) {
    res.render('register-type');
});

// modify page
router.get('/register/:typeID', lib.authenticateRequest, function(req, res) {
    var id = req.params.typeID;
    if (id !== undefined) {
        Type.getById(id, function(err, type) {
            if (err || type === null) {
                req.flash('error', 'Could not find type.');
                res.redirect('/result');
            } else {
                var obj = {
                    id: id,
                    name: type.name,
                    description: type.description
                };

                Part.count({ type: id })
                    .then(count => {
                        obj.partCount = count;
                        res.render('register-type', { item: JSON.stringify(obj) });
                    })
                    .catch(err => {
                        console.log(err);
                        req.flash('error', 'Could count parts.');
                        res.redirect('/result');
                    })


            }
        });

    }

});

//returns a type list page
router.get('/list', lib.authenticateUrl, function(req, res) {
    res.render('list-type');
});

/*listing all parts and return them as a json array*/
router.get('/type-list', lib.authenticateRequest, function(req, res) {
    Type.list(function(err, list) {

        var arr = [];
        var isOwner;
        var item;
        for (var i = 0; i < list.length; i++) {
            item = list[i];

            arr.push({
                id: item._id,
                name: item.name,
                description: item.description,
            });
        }
        res.json(arr);
    });
});

router.get('/item/:typeID', lib.authenticateRequest, function(req, res) {
    var id = req.params.typeID;
    if (id !== undefined) {
        Type.getById(id, function(err, type) {
            if (err || type === null) {
                res.status(404).send('Not found!');
            } else {
                res.json(type);
            }
        });
    }
});
// Register Type
router.post('/register', lib.authenticateAdminRequest, function(req, res) {
    var name = req.body.name;
    var description = req.body.description;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('register-type', {
            errors: errors
        });
    } else {
        var newType = new Type({
            name: name,
            description: description
        });
        req.flash('success_msg', 'You successfully created the \"' + newType._doc.name + '\" type.');
        Type.create(newType, function(err, type) {
            if (err) throw err;
            console.log(type);
            res.redirect('/types/register/' + type.id);
        });


        //res.redirect('/types/list');
    }
});

//todo: type change profile
router.post('/register/:typeID', lib.authenticateAdminRequest, function(req, res) {
    //type modify
    var id = req.params.typeID;

    req.checkBody('name', 'Name is required').notEmpty();
    var errors = req.validationErrors();

    if (errors) {
        //todo: type must type all already typed values again, fix that
        res.render('register-type', { errors: errors });
    } else {
        var values = {
            name: req.body.name,
            description: req.body.description,
        };


        Type.modify(id, values, function(err, result) {
            if (err || result === null || result.ok !== 1) {
                req.flash('error', ' unable to update');
            } else {
                if (result.nModified === 0) {
                    req.flash('success_msg', 'Type is unchanged!');
                } else {
                    req.flash('success_msg', 'Type updated!');
                }
            }
            res.redirect('/types/register/' + id);
        });

    }
});

router.delete('/:typeID', lib.authenticateAdminRequest, function(req, res) {
    var id = req.params.typeID;
    Type.delete(id, function(err, result) {
        if (err !== null) {
            res.status(404).send('unable to delete type "' + id + '".');
        } else {
            res.status(200).send('Type deleted.');
        }
    });

});

module.exports = router;