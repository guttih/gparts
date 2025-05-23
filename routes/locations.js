var express = require('express');
var router = express.Router();
const helper = require('../utils/routeCollectionHelper');
var Location = require('../models/location');
var Part = require('../models/part');
var Action = require('../models/action');
var lib = require('../utils/glib');

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


                //get the count
                Part.countDocuments({ locations: { $regex: helper.makeRegExFromSpaceDelimitedString(id, false) } })
                    .then(count => {
                        obj.partCount = count;
                        var str = JSON.stringify(obj);
                        Action.listAsJson(function(err, list) {
                            if (err || list === null) {
                                res.render('register-location', { item: str });
                            } else {
                                //There are some actions
                                res.render('register-location', { item: str, actions: JSON.stringify(list) });
                            }

                        });

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
    res.render('list-location', {
        title: 'Locations',
        dataName: 'location'
    });
});

/*listing all parts and return them as a json array*/
router.get('/location-list', lib.authenticateRequest, function(req, res) {
    Location.list(function(err, list) {

        var arr = [];
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


router.get('/list/action/:id', lib.authenticateRequest, async function(req, res) {

    const id = req.params.id;
    let collectionItem;
    try {
        collectionItem = await helper.collectionGetByIdAsJson('action', id, false);
    } catch (err) {
        console.log(`Error: ${JSON.stringify(err, null, 4)}`)
        req.flash('error', 'Cound not search locations for this action');
        return res.redirect('/result');
    }

    const collection = 'action'

    const obj = {
        title: 'Locations',
        dataName: 'location',
        searchUrl: '/locations/search',
        listBy: {
            collection: collection,
            collectionId: id,
            title: helper.capitalizeFirst(collection),
            name: collectionItem.name,
            tooltip: `Only locations of this ${collection} are shown in the list`
        }
    }

    res.render('list-location', obj);
});

router.post('/search', lib.authenticateRequest, async function(req, res) {
    const query = {}

    if (req.body.name) {
        query.name = { $regex: helper.makeRegExFromSpaceDelimitedString(req.body.name, false) }
    }

    if (req.body.data) {
        query.data = { $regex: helper.makeRegExFromSpaceDelimitedString(req.body.data, false) }
    }

    if (req.body.description) {
        query.description = { $regex: helper.makeRegExFromSpaceDelimitedString(req.body.description, true) }
    }

    if (req.body.collectionName && req.body.collectionId) {
        query[req.body.collectionName] = {
            '_id': req.body.collectionId
        }
    }

    let sorting = helper.makeSortingObject(req.body.sortingMethod);

    try {
        const ret = await Location.search(query, sorting, 50, req.body.page, lib.getConfig().listDescriptionMaxLength);
        res.json(ret);
    } catch (err) {
        res.status(err.code ? err.code : 400).json(err);
    }
});



router.get('/run-action/:ID', lib.authenticateRequest, function (req, res) {
    var id = req.params.ID;
    if (id !== undefined) {
        Location.getActionUrlByLocationId(id, function (err, actionUrl, location, action) {
            if (err || actionUrl === null || !action  ) {
                res.status(404).json({ error: 'No action to run!' });
            } else {
                if (action.type === 'HTTP_POST') {
                    console.log("post action");
                    lib.runRequest('POST', actionUrl, location.data, function (err, result) {
                        if (!err && result) {
                            console.log(`ran POST action ${actionUrl} | ${location.data}`);
                            res.status(200).json(result);
                        } else {
                            res.status(400).json(result);
                            console.error(`Unable to run action: ${actionUrl}`);
                        }
                    });
                } else {
                    lib.runRequest('GET', actionUrl, '', function (err, result) {
                        if (!err && result) {
                            console.log(`ran GET action ${actionUrl}`);
                            res.status(200).json(result);
                        } else {
                            res.status(400).json(result);
                            console.error(`Unable to run action: ${actionUrl}`);
                        }
                    });

                }
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
            name: name,
            description: description,
            data: data,
            action: action
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
            action: action ? action : null
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
            action: req.body.item_action ? req.body.item_action : null
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