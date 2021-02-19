var express = require('express');
var router = express.Router();
const helper = require('../utils/routeCollectionHelper');
var Action = require('../models/action');
var lib = require('../utils/glib');

// Register
router.get('/register', lib.authenticateUrl, function(req, res) {
    res.render('register-action');
});

// modify page
router.get('/register/:id', lib.authenticateRequest, async function(req, res) {
    await helper.getRouterRegisterCollectionId('action', req, res)
});

router.get('/item/:ID', lib.authenticateRequest, function(req, res) {
    var id = req.params.ID;
    if (id !== undefined) {
        Action.getById(id, function(err, action) {
            if (err || action === null) {
                res.status(404).send('Not found!');
            } else {
                res.json(action);
            }
        });
    }
});

//returns a action list page
router.get('/list', lib.authenticateUrl, function(req, res) {
    res.render('list-action', {
        title: 'Actions',
        dataName: 'action'
    });
});

/*listing all parts and return them as a json array*/
router.get('/action-list', lib.authenticateRequest, function(req, res) {
    Action.list(function(err, list) {

        var arr = [];
        var isOwner;
        var item;
        for (var i = 0; i < list.length; i++) {
            item = list[i];

            arr.push({
                id: item._id,
                name: item.name,
                description: item.description,
                type: item.type,
                url: item.url,
                body: item.body,
            });
        }
        res.json(arr);
    });
});

// Register Action
router.post('/register', lib.authenticateAdminRequest, function(req, res) {
    var name = req.body.name,
        description = req.body.description,
        type = req.body.type,
        url = req.body.url,
        body = req.body.body;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('register-action', {
            errors: errors
        });
    } else {
        var newAction = new Action({
            name: name,
            description: description,
            type: type,
            url: url,
            body: body,
        });

        Action.create(newAction, function(err, action) {
            if (err) throw err;
            req.flash('success_msg', 'You successfully created the \"' + newAction._doc.name + '\" action.');
            res.redirect('/actions/register/' + action.id);
        });



    }
});

router.post('/register/:ID', lib.authenticateAdminRequest, function(req, res) {
    //action modify
    var id = req.params.ID;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('description', 'Description is required').notEmpty();
    req.checkBody('type', 'Type is required').notEmpty();
    req.checkBody('url', 'Url is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('register-action', { errors: errors });
    } else {
        var values = {
            name: req.body.name,
            description: req.body.description,
            type: req.body.type,
            url: req.body.url,
            body: req.body.body
        };


        Action.modify(id, values, function(err, result) {
            if (err || result === null || result.ok !== 1) {
                req.flash('error', ' unable to update');
            } else {
                if (result.nModified === 0) {
                    req.flash('success_msg', 'Action is unchanged!');
                } else {
                    req.flash('success_msg', 'Action updated!');
                }
            }
            res.redirect('/actions/register/' + id);
        });

    }
});

router.delete('/:ID', lib.authenticateAdminRequest, function(req, res) {
    var id = req.params.ID;
    Action.delete(id, function(err, result) {
        if (err !== null) {
            res.status(404).send('unable to delete action "' + id + '".');
        } else {
            res.status(200).send('Action deleted.');
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
        const ret = await Action.search(query, sorting, 50, req.body.page, lib.getConfig().listDescriptionMaxLength);
        res.json(ret);
    } catch (err) {
        res.status(err.code ? err.code : 400).json(err);
    }
});

module.exports = router;