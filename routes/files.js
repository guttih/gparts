const STORAGE_FOLDER_FILE = './public/files';
const STORAGE_FOLDER_IMAGE = './public/files/images';

var express = require('express');
var router = express.Router();
const helper = require('../utils/routeCollectionHelper');
var File = require('../models/file');
var Part = require('../models/part');
var lib = require('../utils/glib');
var validator = require('../utils/validator');
const fs = require('fs');
var multer = require('multer');
var storageFile = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, STORAGE_FOLDER_FILE)
    },
    filename: function(req, file, cb) {
        var name = req.body.name;
        var description = req.body.description;
        var filename = STORAGE_FOLDER_FILE + '/' + file.originalname;
        var newFile = new File({
            name: name,
            description: description,
            fileName: filename,
        });

        File.create(newFile, function(err, file) {

            if (err) throw err;
            var fileNameOnDisk = File.getFileNameOnDisk(file);
            req.body.fileObjectId = file.id;
            cb(null, fileNameOnDisk);
        });
    }
});

var storageImage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, STORAGE_FOLDER_IMAGE)
    },
    filename: function(req, file, cb) {
        var name = req.body.name;
        var description = req.body.description;
        var filename = STORAGE_FOLDER_IMAGE + '/' + file.originalname;
        var newFile = new File({
            name: name,
            description: description,
            fileName: filename,
        });

        File.create(newFile, function(err, file) {

            if (err) throw err;
            var fileNameOnDisk = File.getFileNameOnDisk(file);
            req.body.fileObjectId = file.id;
            cb(null, fileNameOnDisk);
        });
    }
});

var config = lib.getConfig();

var uploading = {
    library: {},
    uploadFile: {},
    uploadImage: {},
    updateFileSize: function updateFileSize(fileSizeLimit) {
        if (fileSizeLimit === undefined || fileSizeLimit === null) {
            fileSizeLimit = this.library.getConfig().fileSizeLimit;
        }
        this.uploadFile = multer({ storage: storageFile, limits: { fileSize: fileSizeLimit } }).single('file');
        this.uploadImage = multer({ storage: storageImage, limits: { fileSize: fileSizeLimit } }).single('image');
    },
    update: function update() {
        this.updateFileSize(this.library.getConfig().fileSizeLimit);
    },
    init: function init(theLib) {
        this.library = theLib;
        this.update();
    }
};

uploading.init(lib);

function getUploadFileErrorText(err, itemText, rawHeaders) {
    //todo: more work needs to be done here
    var ret = "Unable to save " + itemText + " to disk";
    if (err === undefined || err.stack === undefined) {
        return ret;
    }
    if (err.code !== undefined) {
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                ret += " because " + itemText + " is too large.  ";
                if (rawHeaders !== undefined && rawHeaders !== null) {
                    var i = rawHeaders.indexOf("Content-Length");
                    if (i > -1) {
                        try {
                            if (!isNaN(rawHeaders[i + 1])) {
                                var num = Number(rawHeaders[i + 1]);
                                //got approximately file size
                                ret += "File size was about " + lib.bytesToUnitString(num) + ".  ";
                            }
                        } catch (e) {} // do nothing
                    }
                }
                return ret + "The limit is " + lib.bytesToUnitString(config.fileSizeLimit) + ".";
        }
    }

    var iEnd = err.stack.indexOf('\n');
    if (iEnd < 0) {
        return ret;
    }

    var iStart = err.stack.indexOf("Error: ");
    iStart = (iStart === 0) ? 7 : 0;
    if (iStart > iEnd) {
        return ret;
    }
    return ret + " (" + err.stack.substr(iStart, iEnd - iStart) + ")";
}


// Register
router.get('/register', lib.authenticateRequest, function(req, res) {
    res.render('register-file');
});
router.get('/register/image', lib.authenticateRequest, function(req, res) {
    res.render('register-image');
});

router.get('/item/:ID', lib.authenticateRequest, function(req, res) {
    var id = req.params.ID;
    if (id !== undefined) {
        File.getById(id, function(err, file) {
            if (err || file === null) {
                res.status(404).send('Not found!');
            } else {
                res.json(file);
            }
        });
    }
});

//returns a file list page
router.get('/list', lib.authenticateUrl, function(req, res) {

    res.render('list-file', {
        title: 'Files',
        dataName: 'file',
        searchUrl: '/files/search'
    });
});

router.get('/list/image', lib.authenticateUrl, function(req, res) {
    res.render('list-image');
});
/*listing all parts and return them as a json array*/
router.get('/file-list', lib.authenticateRequest, function(req, res) {
    File.list(function(err, list) {

        var arr = [];
        var isOwner;
        var item;
        for (var i = 0; i < list.length; i++) {
            item = list[i];

            arr.push({
                id: item._id,
                name: item.name,
                description: item.description,
                url: item.url,
                owners: File.ownersObjectArrayToStringArray(item.owners)
            });
        }
        res.json(arr);
    });
});
router.post('/images', function(req, res) {
        console.log('doing stuff')
        console.log(req.body)
        console.log(req.body.query)
        File.find(req.body.query)
            .then(list => res.json(list))
            .catch(err => res.status(400).res.json(err))
    })
    /*listing all parts which have the same path as storageFolderImage path and return them as a json array*/
router.get('/image-list', lib.authenticateRequest, function(req, res) {
    File.listByPath(STORAGE_FOLDER_IMAGE, function(err, list) {

        var arr = [];
        var isOwner;
        var item;
        for (var i = 0; i < list.length; i++) {
            item = list[i];

            arr.push({
                id: item._id,
                name: item.name,
                description: item.description,
                src: File.getFullFileNameOnDisk(item).replace('./public', '')
            });
        }
        res.json(arr);
    });
});

// modify page
router.get('/register/:id', lib.authenticateRequest, async function(req, res) {

    const collection = 'file';
    var id = req.params.id;
    if (!id) {
        return helper.renderResultViewErrors(res, `${collection} Id is missing from url`)
    }

    const obj = await File.getByIdAsJsonWithPath(id, false, true);
    if (obj) {
        return res.render(`register-${collection}`, { item: JSON.stringify(obj) });
    } else {
        return helper.renderResultViewErrors(res, `Could not get ${collection}.`)
    }

});

router.get('/register/image/:id', lib.authenticateRequest, async function(req, res) {

    const collection = 'file';
    var id = req.params.id;
    if (!id) {
        return helper.renderResultViewErrors(res, `${collection} Id is missing from url`)
    }

    const obj = await File.getByIdAsJsonWithPath(id);
    if (obj) {
        return res.render(`register-${collection}`, { item: JSON.stringify(obj) });
    } else {
        return helper.renderResultViewErrors(res, `Could not get ${collection}.`)
    }

});

//todo: this should maybe be a router.put
router.get('/addowner/:ownerID/:ID', lib.authenticateAdminRequest, function(req, res) {
    var id = req.params.ID;
    var ownerId = req.params.ownerID;
    File.addOrUpdateOwnerAndSize(id, ownerId, null, function(err, result) {
        if (err) {
            res.status(404).send('Could not add owner.');
        } else {
            console.log('owner added');
            res.status(200).send('Owner added til file.');
        }
    });
});

router.get('/orphans', lib.authenticateAdminRequest, async function(req, res) {
    const list = await File.listOrphans([STORAGE_FOLDER_FILE, STORAGE_FOLDER_IMAGE]);
    res.json(list);
});


router.post('/register', lib.authenticateAdminRequest, function(req, res, next) {

    uploading.update();
    uploading.uploadFile(req, res, function(err) {
        if (err) {
            var message;
            if (err.code === "LIMIT_FILE_SIZE" ||
                (err.message === undefined || err.message.length < 1)) {

                message = getUploadFileErrorText(err, "file", req.rawHeaders);
            } else {
                message = "Unable to save file to disk!" + " (" + err.message + ")";
            }
            res.render('register-file', { errors: [{ msg: message }] });
            console.log(err);
            File.delete(req.body.fileObjectId, function(err) { if (err === null) { console.log("deleted File object because upload failed") } });
            return;
        }
        var id = req.body.fileObjectId;
        var ownerId = req.user._id;
        if (req.body.partId !== undefined) {
            ownerId = req.body.partId;
        }

        req.checkBody('fileObjectId', 'A file to upload, must be selected.').notEmpty();
        req.checkBody('name', 'Name is required').notEmpty();
        var errors = req.validationErrors();

        if (errors) {
            res.render('register-file', { errors: errors });
        } else {
            req.flash('success_msg', 'File uploaded and created!');
            File.addOrUpdateOwnerAndSize(id, ownerId, req.file.size, function(err, item) {
                res.redirect('/files/register/' + id);
            });
        }
    });

});

router.post('/register/image', lib.authenticateAdminRequest, function(req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    uploading.update();
    uploading.uploadImage(req, res, function(err) {
        var name = req.body.name;
        if (err) {
            var message;
            if (err.code === "LIMIT_FILE_SIZE" ||
                (err.message === undefined || err.message.length < 1)) {
                message = getUploadFileErrorText(err, "image", req.rawHeaders);
            } else {
                message = "Unable to save image to disk!" + " (" + err.message + ")";
            }
            res.render('register-image', { errors: [{ msg: message }] });
            console.log(err);
            File.delete(req.body.fileObjectId, function(err) { if (err === null) { console.log("deleted File object because upload failed") } });
            return;
        }

        var id = req.body.fileObjectId;
        var ownerId = req.user._id;
        if (req.body.partId !== undefined) {
            ownerId = req.body.partId;
        }

        req.checkBody('fileObjectId', 'A image to upload, must be selected.').notEmpty();
        req.checkBody('name', 'Name is required').notEmpty();
        var errors = req.validationErrors();

        if (errors) {
            res.render('register-image', { errors: errors });
        } else {
            req.flash('success_msg', 'File uploaded and created!');
            File.addOrUpdateOwnerAndSize(id, ownerId, req.file.size, function(err, item) {
                res.redirect('/files/register/image/' + id);
            });


        }
    });

});

router.post('/register/part/image', lib.authenticateAdminRequest, function(req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    uploading.update();
    uploading.uploadImage(req, res, function(err) {
        if (err) {
            // An error occurred when uploading
            console.log(err);
            err.msg = getUploadFileErrorText(err, "image", req.rawHeaders);
            res.status(413).send(err);
            File.delete(req.body.fileObjectId, function(err) { if (err === null) { console.log("deleted File object because upload failed") } });
            return;
        }
        var name = req.body.name;
        var id = req.body.fileObjectId;
        var ownerId = req.user._id;
        if (req.body.partId !== undefined) {
            ownerId = req.body.partId;
        }

        req.checkBody('fileObjectId', 'A image to upload, must be selected.').notEmpty();
        req.checkBody('name', 'Name is required').notEmpty();
        var errors = req.validationErrors();

        if (errors) {
            res.statusCode = 400;
            return res.json({ text: (errors.length > 0) ? errors[0].msg : "Could not upload image!" });
        } else {
            File.addOrUpdateOwnerAndSize(id, ownerId, req.file.size, function(err, item) {
                if (err !== null) {
                    res.statusCode = 404;
                    var obj = { text: 'Error 404: Could not add owner!' };
                    return res.json(obj);
                }
                //Fyrst við ödduðum owner þá þurfum við að adda myndinni í partinn
                if (ownerId !== req.user._id) {
                    Part.modify(ownerId, { image: id }, function(err, res) {});
                }
                File.getById(id, function(err, item) {
                    if (err !== null) {
                        res.statusCode = 404;
                        var obj = { text: 'Error 404: Image not found!' };
                        return res.json(obj);
                    }
                    return res.json(item);
                });

            });
        }
    });
});

router.post('/register/part/file', lib.authenticateAdminRequest, function(req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    uploading.update();
    uploading.uploadFile(req, res, function(err) {
        if (err) {
            // An error occurred when uploading
            console.log(err);
            err.msg = getUploadFileErrorText(err, "file", req.rawHeaders);
            res.status(413).send(err);
            return;
        }
        var name = req.body.name;
        var id = req.body.fileObjectId;
        var ownerId = req.user._id;
        if (req.body.partId !== undefined) {
            ownerId = req.body.partId;
        }

        req.checkBody('fileObjectId', 'A file to upload, must be selected.').notEmpty();
        req.checkBody('name', 'Name is required').notEmpty();
        var errors = req.validationErrors();

        if (errors) {
            res.statusCode = 400;
            return res.json({ text: (errors.length > 0) ? errors[0].msg : "Could not upload file!" });
        } else {
            File.addOrUpdateOwnerAndSize(id, ownerId, req.file.size, function(err, item) {
                if (err !== null) {
                    res.statusCode = 404;
                    var obj = { text: 'Error 404: Could not add owner!' };
                    return res.json(obj);
                }
                //Fyrst við ödduðum owner þá þurfum við að adda  í partinn
                if (ownerId !== req.user._id) {
                    //todo here we need to add the file to the file array
                    Part.addFile(ownerId, id, function(err, res) {});
                }
                File.getById(id, function(err, item) {
                    if (err !== null) {
                        res.statusCode = 404;
                        var obj = { text: 'Error 404: Image not found!' };
                        return res.json(obj);
                    }
                    // Hér þarf að sækja allar skrárnar, og fá skráarnafn og Id á þeim
                    Part.getSendObject(ownerId, function(err, part) {
                        if (err) {
                            res.status(500).json(part);
                        } else {
                            res.json(part);
                        }
                    });

                });

            });
        }
    });
});


router.post('/register/image/:ID', lib.authenticateAdminRequest, function(req, res) {
    //file modify
    var id = req.params.ID;

    req.checkBody('name', 'Name is required').notEmpty();
    var errors = req.validationErrors();

    if (errors) {
        res.render('register-file', { errors: errors });
    } else {
        var values = {
            name: req.body.name,
            description: req.body.description
        };


        File.modify(id, values, function(err, result) {
            if (err || result === null || result.ok !== 1) {
                req.flash('error', ' unable to update');
            } else {
                if (result.nModified === 0) {
                    req.flash('success_msg', 'File is unchanged!');
                } else {
                    req.flash('success_msg', 'File updated!');
                }
            }
            res.redirect('/files/register/image/' + id);
        });

    }
});

router.post('/register/:ID', lib.authenticateAdminRequest, function(req, res) {
    //file modify
    var id = req.params.ID;

    req.checkBody('name', 'Name is required').notEmpty();
    var errors = req.validationErrors();

    if (errors) {
        res.render('register-file', { errors: errors });
    } else {
        var values = {
            name: req.body.name,
            description: req.body.description
        };


        File.modify(id, values, function(err, result) {
            if (err || result === null || result.ok !== 1) {
                req.flash('error', ' unable to update');
            } else {
                if (result.nModified === 0) {
                    req.flash('success_msg', 'File is unchanged!');
                } else {
                    req.flash('success_msg', 'File updated!');
                }
            }
            res.redirect('/files/register/' + id);
        });

    }
});

router.delete('/:ID', lib.authenticateAdminRequest, function(req, res) {
    var id = req.params.ID;
    if (id !== undefined) {
        File.getById(id, function(err, file) {
            if (err || file === null) {
                res.status(404).send('Could not find file.');
            } else {
                File.deleteIfOwner(id, req.user._id, true, function(err, result) {
                    if (err !== null) {
                        if (err.status !== undefined) {
                            switch (err.status) {
                                case 403:
                                case 406:
                                    res.status(err.status).send('Can not delete, because there is another owner. (' + err.owners[0]._id + ')');
                                    break;
                                default:
                                    res.status(err.status).send('Unable to delete file "' + id + '".');
                            }
                        }
                    } else {
                        var fileName = File.getFullFileNameOnDisk(file);
                        if (validator.fileExists(fileName)) {
                            //The file exists so lets delete it
                            fs.unlink(fileName, (err) => {
                                if (err) {
                                    res.status(404).send('Unable to delete the file "' + fileName + '" from disk.');
                                } else {
                                    res.status(200).send('File and file on disk deleted.');
                                }
                            });
                        } else {
                            res.status(200).send('Did not need to delete file from disk because it did not exist.');
                        }
                    }
                });
            }
        });
    }

});

router.delete('/part/:pardID/:ID', lib.authenticateAdminRequest, function(req, res) {
    var id = req.params.ID;
    var partId = req.params.pardID;
    if (id !== undefined) {
        File.getById(id, function(err, file) {
            if (err || file === null) {
                Part.modify(partId, { image: null }, function(err, data) {
                    if (err) {
                        res.status(404).send('Could not find file.');
                    } else {
                        console.log('Deleted image from part');
                        res.status(200).send('File removed from part.');
                    }
                });

            } else {
                File.deleteIfOwner(id, partId, false, function(err, result) {
                    if (err !== null) {
                        // File was not deleted
                        if (err.status !== undefined) {
                            var addition = "part is not a owner.";
                            switch (err.status) {
                                case 403: // Another owner found
                                case 406:
                                    addition = 'there is another owner. (' + err.owners[0]._id + ')'; // Another owner found and part NOT a owner
                                case 405: // No owners
                                    res.status(err.status).send('Unable delete file, because ' + addition);
                                    //Fyrst við eyddum owner á myndinni þá þurfum við að eyða vísun í myndina í partinn
                                    Part.modify(partId, { image: null }, function(err, res) {
                                        console.log('Deleted image from part');
                                    });
                                    break;

                                default:
                                    res.status(err.status).send('Unable to delete file "' + id + '".');
                            }
                        } else {
                            res.status(404).send('Unable to delete file "' + id + '".');
                        }
                    } else { //file was deleted, so let's remove it from disk

                        //if the file was part image then we need to remove reference to that file from the Part.image property 
                        Part.ClearPropertyIfMatch(partId, 'image', id, function(err, result) {
                            var fileName = File.getFullFileNameOnDisk(file);
                            if (validator.fileExists(fileName)) {
                                //The file exists so lets delete it
                                fs.unlink(fileName, (err) => {
                                    if (err) {
                                        res.status(404).send('Unable to delete the file "' + fileName + '" from disk.');
                                    } else {
                                        res.status(200).send('File and file on disk deleted.');
                                    }
                                });
                            } else {
                                res.status(200).send('Did not need to delete file from disk because it did not exist.');
                            }
                        });
                    }
                });
            }
        });
    }
});

router.post('/search', lib.authenticateRequest, async function(req, res) {

    const query = {}
    if (req.body.name) {
        query.name = { $regex: helper.makeRegExFromSpaceDelimitedString(req.body.name, false) }
    }

    if (req.body.description) {
        query.description = { $regex: helper.makeRegExFromSpaceDelimitedString(req.body.description, true) }
    }

    if (req.body.fileSize) {
        query.fileSize = { $gte: Number(req.body.fileSize) }
    }

    let sorting = helper.makeSortingObject(req.body.sortingMethod);

    try {
        const ret = await File.search(query, sorting, 50, req.body.page, lib.getConfig().listDescriptionMaxLength);
        res.json(ret);
    } catch (err) {
        res.status(err.code ? err.code : 400).json(err);
    }
});

module.exports = router;