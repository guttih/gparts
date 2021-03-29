var express = require('express');
var router = express.Router();
var lib = require('../utils/glib');
var Part = require('../models/part');
const helper = require('../utils/routeCollectionHelper');
const marked = require("marked");

// Register
router.get('/register', lib.authenticateRequest, function(req, res) {
    res.render('register-part');
});

// modify page
router.get('/register/:id', lib.authenticateRequest, function(req, res) {
    var id = req.params.id;
    if (id !== undefined) {
        Part.getById(id, function(err, part) {
            if (err || part === null) {
                req.flash('error', 'Could not find part.');
                res.redirect('/result');
            } else {

                Part.toJsonCallback(part, function(err, obj) {
                    if (err) {
                        req.flash('error', 'Could not find part.');
                        res.redirect('/result');
                    } else {
                        var str = JSON.stringify(obj);
                        res.render('register-part', { item: str, viewModel: { id: obj.id } });
                    }
                });
            }
        });
    }
});

const partToMarkdownText = (part) => {
    var ret = '';
    ret += `## Description \n\n ${part.description}`;

    return marked(ret);
}

router.get('/view/:id', lib.authenticateRequest, async function(req, res) {
    req.checkParams('id', 'Id is required').notEmpty();
    req.checkParams('id', 'Id is not valid').isLength({ min: 24, max: 24 })
    var errors = req.validationErrors();
    if (errors) {
        return res.render('result', { errors: errors });
    }

    try {
        var part = await Part.getByIdAsJson(req.params.id);
        var viewObject = await Part.fetchViewValuesForPart(part, false)
        var viewModel = {
            id: viewObject.id,
            image: viewObject.image,
            name: viewObject.name,
            markdown: partToMarkdownText(viewObject),
            firstAcquired: lib.DateToYYYY_MM_DD_String(new Date(viewObject.firstAcquired), '-'),
            lastModified: lib.DateToYYYY_MM_DD_String(new Date(viewObject.lastModified), '-'),
            stock: viewObject.stockCount,
            category: viewObject.category,
            type: viewObject.type,
            location: viewObject.location,
            locations: viewObject.locations,
            manufacturer: viewObject.manufacturer,
            supplier: viewObject.supplier,
            files: viewObject.files.map(file => {
                file.size = lib.bytesToUnitString(file.size);
                return file;
            }),
            urls: viewObject.urls,
        }
        var str = JSON.stringify(viewModel);
        res.render('view-part', { item: str, viewModel: viewModel });
    } catch (err) {
        errors = [{ msg: "Unable to show part" }];
        if (err && err.message) {
            errors.push({ msg: err.message })
        } else {
            console.warn(err)
        }
        return res.render('result', { errors: errors });
    }

});

router.get('/item/:ID', lib.authenticateRequest, function(req, res) {
    var id = req.params.ID;
    if (id !== undefined) {
        Part.getById(id, function(err, part) {
            if (err || part === null) {
                res.status(404).send('Not found!');
            } else {

                res.json(part);
            }
        });
    }
});


//returns a part list page
router.get('/list', lib.authenticateUrl, function(req, res) {
    res.render('list-part', { title: 'Parts', dataName: 'part' });
});

router.get('/list/:collection/:collectionId', lib.authenticateUrl, async function(req, res) {

    //get collection
    var id = req.params.collectionId;
    var collection = req.params.collection;
    if (id === undefined || typeof id !== 'string' || id.length < 24) {
        return reportListByError(req, res, collection + ' Id missing');
    }

    if (!Part.validSearchCollections.includes(collection)) {
        return reportListByError(req, res, collection + ' Id missing');
    }

    const Collection = helper.getValidCollection(collection);
    let collectionItem;
    try {
        collectionItem = await Collection.find({ _id: id });
    } catch (err) {
        return reportListByError(req, res, collection + ' not found');
    }

    //get name and id
    const obj = {
        title: 'Parts',
        dataName: 'part',
        listBy: {
            collection: collection,
            collectionId: id,
            title: helper.capitalizeFirst(collection),
            name: collectionItem[0].name,
            tooltip: `Only parts of this ${collection} are shown in the list`
        }
    }

    res.render('list-part', obj);

});



router.get('/export/json', lib.authenticateAdminRequest, async function(req, res) {

    res.json(await Part.find({}));
});

router.post('/search', lib.authenticateRequest, function(req, res) {

    const query = {}

    if (req.body.name) {
        query.name = { $regex: helper.makeRegExFromSpaceDelimitedString(req.body.name, false) }
    }

    if (req.body.category) {
        query.category = { $regex: helper.makeRegExFromSpaceDelimitedString(req.body.category, false) }
    }

    if (req.body.description) {
        query.description = { $regex: helper.makeRegExFromSpaceDelimitedString(req.body.description, true) }
    }

    if (req.body.collectionName && req.body.collectionId) {
        if (req.body.collectionName === 'location') {
            query.locations = { $regex: helper.makeRegExFromSpaceDelimitedString(req.body.collectionId, false) }
        } else {
            query[req.body.collectionName] = {
                '_id': req.body.collectionId
            }
        }
    }

    let sorting = helper.makeSortingObject(req.body.sortingMethod);

    Part.search(query, sorting, 50, req.body.page, lib.getConfig().listDescriptionMaxLength)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            res.status(err.code ? err.code : 400).json(err);
        })
});

function reportListByError(req, res, errorString) {

    req.flash('error', errorString);
    res.redirect('/parts/list');
}

router.get('/list/type/:ID', lib.authenticateUrl, function(req, res) {
    var id = req.params.ID;
    var collection = 'type';
    var descriptionMaxLength = lib.getConfig().listDescriptionMaxLength;
    if (id === undefined || typeof id !== 'string' || id.length < 24) {
        return reportListByError(req, res, collection + ' Id missing');
    }

    Part.queryType({ _id: id }, function(err, result) {
        if (err || result === null || !Array.isArray(result) || result.length < 1) {
            console.log(err);
            return;
        }
        var listBy = Part.TypeToJson(result[0], descriptionMaxLength);
        listBy.search = collection;
        res.render('list-part', {
            listById: listBy.id,
            listByName: listBy.name,
            listBySearch: listBy.search,
            listByObj: JSON.stringify(listBy)
        });
    });


});

const validatePostRegister = (request) => {
        request.checkBody('name', 'Name is required').notEmpty();
        request.checkBody('locations', 'At least one location is required').notEmpty().isString().isLength({ min: 28 });
        request.checkBody('type', 'Type is required').notEmpty();
        request.checkBody('firstAcquired', 'Acquired date is required').notEmpty();
        request.checkBody('lastModified', 'Last modified date is required').notEmpty();
        request.checkBody('stockCount', 'Stock count is required and must be a number!').notEmpty().isNumeric();

        if (request.body.supplier === undefined || request.body.supplier.length < 1) {
            request.body.supplier = null;
        }
        if (request.body.manufacturer === undefined || request.body.manufacturer.length < 1) {
            request.body.manufacturer = null;
        }

        return request.validationErrors();
    }
    // Register Part
router.post('/register', lib.authenticateAdminRequest, function(req, res) {


    var errors = validatePostRegister(req);

    if (errors) {
        res.render('register-part', {
            errors: errors
        });
    } else {
        var newPart = new Part({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            urls: req.body.urls,
            //image         : req.body.image,
            //files         : req.body.files,
            stockCount: req.body.stockCount,
            firstAcquired: req.body.firstAcquired,
            lastModified: req.body.lastModified,
            type: req.body.type,
            locations: req.body.locations,
            manufacturer: req.body.manufacturer,
            supplier: req.body.supplier
        });

        Part.create(newPart, function(err, part) {
            if (err) throw err;
            req.flash('success_msg', 'You successfully created the \"' + newPart._doc.name + '\" part.');
            res.redirect('/parts/register/' + part.id);
        });


    }
});

router.post('/register/:ID', lib.authenticateAdminRequest, function(req, res) {
    //part modify
    var id = req.params.ID;

    if (req.body.image === undefined || req.body.image.length < 1) {
        req.body.image = null;
    }
    var errors = validatePostRegister(req);

    if (errors) {
        res.render('register-part', {
            errors: errors
        });
    } else {
        var locations;
        try {
            locations = JSON.parse(req.body.locations);
            locations.push("asdf");
            locations.pop(1);
        } catch {
            return res.render('register-part', { errors: [{ msg: 'locations an incorrect object ', param: 'locations' }] });
        }
        var values = {
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            urls: req.body.urls,
            image: req.body.image,
            //files         : req.body.files,
            stockCount: req.body.stockCount,
            firstAcquired: req.body.firstAcquired,
            lastModified: req.body.lastModified,
            type: req.body.type,
            //location: req.body.location,
            locations: req.body.locations,
            manufacturer: req.body.manufacturer,
            supplier: req.body.supplier
        };


        Part.modify(id, values, function(err, result) {
            if (err || result === null || result.ok !== 1) {
                req.flash('error', ' unable to update');
            } else {
                if (result.nModified === 0) {
                    req.flash('success_msg', 'Part is unchanged!');
                } else {
                    req.flash('success_msg', 'Part updated!');
                }
            }
            res.redirect('/parts/register/' + id);
        });

    }
});

router.delete('/:ID', lib.authenticateAdminRequest, function(req, res) {
    var id = req.params.ID;
    Part.delete(id, function(err, result) {
        if (err !== null) {
            res.status(404).send('unable to delete part "' + id + '".');
        } else {
            res.status(200).send('Part deleted.');
        }
    });

});

module.exports = router;