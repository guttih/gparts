var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Location = require('../models/location');
var Action = require('../models/action');


var request = require('request');
var lib = require('../utils/glib');

var config = lib.getConfig();

// Register
router.get('/register', lib.authenticateUrl, function(req, res) {

    Action.listAsJson(function(err, list) {
        if (err || list === null) {
            res.render('register-location');
        } else {
            //There are some actions
            res.render('register-location', { actions: JSON.stringify(list) });
        }

    });
});



router.get('/clone/:ID', lib.authenticateRequest, function(req, res) {
    var id = req.params.ID;
    if (id !== undefined) {
        Location.getByIdPromise(id)
            .then((location) => {
                var newLocation = new Location(Location.copyValues(location, false));

                newLocation.name += ' - Copy of'
                Location.createPromise(newLocation)
                    .then(locationCreated => {
                        res.redirect(`/locations/register/${locationCreated._id}`);
                    })
                    .catch(err => {
                        req.flash('error', err.message);
                        res.redirect('/result');
                        console.log(`Error: ${JSON.stringify(err, null, 4)}`)
                    })
            })
            .catch(err => {
                req.flash('error', err.message);
                res.redirect('/result');
                console.log(`Error: ${JSON.stringify(err, null, 4)}`)
            })
    } else {
        req.flash('error', 'Id missing');
        res.redirect('/result');
    }

});

// modify page
router.get('/register/:ID', lib.authenticateRequest, function(req, res) {
    var id = req.params.ID;
    if (id !== undefined) {
        //todo: call Location.getByIdPromise and delete Location.getById
        Location.getById(id, function(err, location) {
            if (err || location === null) {
                req.flash('error', 'Could not find location.');
                res.redirect('/result');
            } else {
                var obj = {
                    id: id,
                    name: location.name,
                    description: location.description,
                    data: location.data,
                    action: location.action
                };
                var str = JSON.stringify(obj);
                Action.listAsJson(function(err, list) {
                    if (err || list === null) {
                        res.render('register-location', { item: str });
                    } else {
                        //There are some actions
                        res.render('register-location', { item: str, actions: JSON.stringify(list) });
                    }

                });
            }
        });

    }

});

router.get('/item/:ID', lib.authenticateRequest, function(req, res) {
    var id = req.params.ID;
    if (id !== undefined) {
        Location.getByIdPromise(id)
            .then((location) => {
                res.json(location);
            })
            .catch(err => {
                res.status(404).send('Not found!');
            })
    }
});

//returns a location list page
router.get('/list', lib.authenticateUrl, function(req, res) {
    res.render('list-location');
});

/*listing all parts and return them as a json array*/
router.get('/location-list', lib.authenticateRequest, function(req, res) {
    Location.list(function(err, list) {

        var arr = [];
        var isOwner;
        var item;
        for (var i = 0; i < list.length; i++) {
            item = list[i];

            arr.push({
                id: item._id,
                name: item.name,
                description: item.description,
                data: item.data,
                action: item.action
            });
        }
        res.json(arr);
    });
});

router.get('/run-action/:ID', lib.authenticateRequest, function(req, res) {
    var id = req.params.ID;
    if (id !== undefined) {
        Location.getActionUrlByLocationId(id, function(err, actionUrl) {
            if (err || actionUrl === null) {
                res.status(404).json({ error: 'No action to run!' });
            } else {
                lib.runRequest('GET', actionUrl, '', function(err, result) {
                    if (!err && result) {
                        console.log('ran action');
                        res.status(200).json(result);
                    } else {
                        res.status(400).json(result);
                        console.error(`Unable to run action: ${actionUrl}`);
                    }
                });
            }
        });
    }
});
router.get('/action-url/:ID', lib.authenticateRequest, function(req, res) {
    var id = req.params.ID;
    if (id !== undefined) {
        Location.getActionUrlByLocationId(id, function(err, actionUrl) {
            if (err || actionUrl === null) {
                res.status(404).send('Not found!');
            } else {
                res.json({ actionUrl: actionUrl });
            }
        });
    }
});

// Register Location
router.post('/register', lib.authenticateAdminRequest, function(req, res) {
    var name = req.body.name;
    var description = req.body.description;
    var data = req.body.data;
    var action = req.body.item_action;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        var obj = {
            name: location.name,
            description: location.description,
            data: location.data,
            action: location.action
        };
        var str = JSON.stringify(obj);
        Action.listAsJson(function(err, list) {
            if (err || list === null) {
                res.render('register-location', { errors: errors, item: str });
            } else {
                //There are some actions
                res.render('register-location', { errors: errors, item: str, actions: JSON.stringify(list) });
            }

        });
        return;
    } else {
        var newLocation = new Location({
            name: name,
            description: description,
            data: data,
            action: action
        });
        Location.createPromise(newLocation)
            .then(location => {
                req.flash('success_msg', 'You successfully created the \"' + newLocation._doc.name + '\" location.');
                res.redirect('/locations/register/' + location.id);
            })
            .catch(err => {
                req.flash('error', err.message ? err.message : 'Error registering.');
                res.redirect('/locations/register');
            })



    }
});

router.post('/register/:ID', lib.authenticateAdminRequest, function(req, res) {
    //location modify
    var id = req.params.ID;

    req.checkBody('name', 'Name is required').notEmpty();
    var errors = req.validationErrors();

    if (errors) {
        res.render('register-location', { errors: errors });
    } else {
        var values = {
            name: req.body.name,
            description: req.body.description,
            data: req.body.data,
            action: req.body.item_action
        };


        Location.modify(id, values, function(err, result) {
            if (err || result === null || result.ok !== 1) {
                req.flash('error', ' unable to update');
            } else {
                if (result.nModified === 0) {
                    req.flash('success_msg', 'Location is unchanged!');
                } else {
                    req.flash('success_msg', 'Location updated!');
                }
            }
            res.redirect('/locations/register/' + id);
        });

    }
});

router.delete('/:ID', lib.authenticateAdminRequest, function(req, res) {
    var id = req.params.ID;
    Location.delete(id, function(err, result) {
        if (err !== null) {
            res.status(404).send('unable to delete location "' + id + '".');
        } else {
            res.status(200).send('Location deleted.');
        }
    });

});

module.exports = router;