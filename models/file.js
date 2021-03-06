"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const helper = require('../utils/routeCollectionHelper');
const validator = require('../utils/validator');
var ObjectId = Schema.ObjectId;
const fs = require('fs');
var FileSchema = mongoose.Schema({
    name: { type: String, index: true },
    description: String,
    // Will store the path on disk, the original file name and file extension
    fileName: String,

    // If added from route "/files/register" or "/files/register/image" 
    //    then ObjectId will be UserId
    // If added from /files/register/part or "/files/register/partimage" 
    //     then ObjectId will be partId 
    owners: [{ ObjectId }],
    //size of file
    size: Number
});

var File = module.exports = mongoose.model('File', FileSchema);

module.exports.Utils = require('./modelUtility');

/**
 * @callback requestCallbackWithError
 * @param {object} if success null if not an err object
 * @param {object} usually a object but can be a string too
 */
module.exports.delete = function(id, callback) {

    File.findByIdAndRemove(id, callback);
};

/*Deletes a file based on ownerId

    If ownerId is NOT an owner and        
                another owner is a owner  of the file   The file is NOT deleted                                    and 406 error returned
            	
    If deleteIfNoOwner is true
        -If there is no owner             of the file,  The file is     deleted
        -If ownerId is     the only owner of the file,  The file is     deleted
        -If ownerId is NOT the only owner of the file,  the file is NOT deleted and ownerId is removed from owners and 403 error returned
    If deleteIfNoOwner is false
        -If there is no owner             of the file,  The file is NOT deleted and                                    405 error returned
        -If ownerId is     the only owner of the file,  The file is     deleted
        -If ownerId is NOT the only owner of the file,  The file is NOT deleted and ownerId is removed from owners and 403 error returned
*/
module.exports.deleteIfOwner = function(id, ownerId, deleteIfNoOwner, callback) {
    // todo: simplify by using alike queries used by listByOwnerId, listByOwnerIdFindOnlyOne, deleteByOwnerIdFindOnlyOne
    File.findById(id, function(err, item) {
        if (!err && item !== null) {
            var newArray = (item.owners === undefined || item.owners === null) ? [] : item.owners.slice();
            var index = findObjectIdInArray(newArray, ownerId);
            if (index > -1) {
                if (newArray.length > 1) {
                    //there is another owner of this file so let's only remove ownerId
                    newArray.splice(index, 1);
                    var values = {
                        owners: newArray
                    };
                    File.modify(id, values, function(err, res) {
                        if (callback !== undefined) {
                            var err = { status: 403, message: "Another owner exists.", owners: newArray };
                            callback(err, res);
                        }
                    });
                } else {
                    //this is the only owner, so we can delete this file
                    File.findByIdAndRemove(id, callback);
                }
            } else {
                //this is not owner of this file 
                if (newArray.length === 0) {
                    //There are NO owners of this file, 
                    if (deleteIfNoOwner === true) {
                        File.findByIdAndRemove(id, callback);
                    } else {
                        // Not allowed to delete even though NO owners
                        if (callback !== undefined) {
                            var err = { status: 405, message: "No owners, but delete is not allowed.", owners: newArray };
                            callback(err, res);
                        }
                    }
                } else {
                    //nothing is to be deleted but we need to tell user that nothing was deleted, so we must send an error object.
                    if (callback !== undefined) {
                        var err = { status: 406, message: "Another owner exists and this ownerId is not an owner.", owners: newArray };
                        callback(err);
                    }
                }
            }
        }
    });

};

module.exports.modify = function(id, newValues, callback) {
    //$set
    var val = { $set: newValues };
    File.update({ _id: id }, val, callback);
};

// adds a ownerId to the owners array.  If it already exists, nothing is added
module.exports.addOrUpdateOwnerAndSize = function(id, ownerIdToAdd, size, callback) {
    //$set
    File.findById(id, function(err, file) {
        if (err || file === null) {
            if (err === undefined) {
                err = { error: 404, message: "'Error 404 : Not found! " };
            }
            if (callback !== undefined) {
                callback(err);
            }

        } else {
            // file is found
            let modify = false;
            if (size) {
                file.size = size;
                modify = true;
            }
            if (file.owners[ownerIdToAdd] === undefined) {
                file.owners.push(ownerIdToAdd);
                modify = true;
            }
            if (modify) {
                File.modify(file.id, file, callback);
            } else {
                if (callback !== undefined) {
                    callback(err, file);
                }
            }
        }
    });
};


/**
 *	Removes a owner from a File if owner does not exist, that is considered a success also.
 *
 * @param {File} fileItem A file item with properties id and property array of owners
 * @param {string} ownerId Search for this owner in the File owner array
 * @param {requestCallbackWithError} callback The callback that handles the response.
 */
module.exports.removeOwner = function(fileItem, ownerId, callback) {
    //$set
    var newArray = (fileItem.owners === undefined || fileItem.owners === null) ? [] : fileItem.owners.slice();
    var index = findObjectIdInArray(newArray, ownerId);
    if (index > -1) {
        newArray.splice(index, 1);
        var values = { owners: newArray };
        var id = fileItem.id;
        File.modify(id, values, function(err, res) {
            if (callback !== undefined) {
                callback(err, res);
            }
        });
    } else {
        if (callback !== undefined) {
            callback(null, { n: 0, ok: 1 }); //ownerId does not own this file
        }
    }
};

module.exports.create = function(newFile, callback) {
    newFile.save(callback);
};
module.exports.getById = function(id, callback) {
    File.findById(id, callback);
};

module.exports.getByIdAsJsonWithPath = async function(id, descriptionMaxLength) {

    try {
        let file = await File.findById(id)
        return File.toJson(file, descriptionMaxLength, true);

    } catch (err) {
        return err;
    }
};

//get all records
module.exports.list = function(callback) {
    var query = {};
    File.find(query, callback);
};

//get all records that start with the pathToSearchFor
module.exports.listByPath = function(pathToSearchFor, callback) {
    var rgx = new RegExp("^" + pathToSearchFor)
    var query = { fileName: rgx };
    File.find(query, callback);
};

/**
 *	Finds all files that have ownerId as one of it's owners
 *
 * @param {string} ownerId Search for this owner in the File owner array
 * @param {requestCallbackWithError} callback The callback that handles the response.
 */
module.exports.listByOwnerId = function listByOwnerId(ownerId, callback) {
    var query = { owners: { $elemMatch: { _id: ownerId } } };
    File.find(query, callback);
};

module.exports.listByOwnerIdPromise = async(ownerId) => {
    var query = { owners: { $elemMatch: { _id: ownerId } } };
    return File.find(query);
};

/**
 *	Finds all files that have only one owner and that owner is ownerId
 *
 * @param {string} ownerId Search for this owner in the File owner array
 * @param {requestCallbackWithError} callback The callback that handles the response.
 */
module.exports.listByOwnerIdFindOnlyOne = function listByOwnerIdFindOnlyOne(ownerId, callback) {
    var query = {
        owners: {
            $elemMatch: { _id: ownerId },
            $size: 1
        }
    };
    File.find(query, callback);
};

/**
 *	Deletes all files that have only one owner and that owner is ownerId
 *
 * @param {string} ownerId Search for this owner in the File owner array
 * @param {requestCallbackWithError} callback The callback that handles the response.
 */
module.exports.deleteByOwnerIdFindOnlyOne = function(ownerId, callback) {

    var query = {
        owners: {
            $elemMatch: { _id: ownerId },
            $size: 1
        }
    };
    //
    File.find(query)
        .then((files) => {
            //foreach file we should delete it
            files.forEach(file => {
                var fileName = File.getFullFileNameOnDisk(file);
                if (validator.fileExists(fileName)) {
                    //The file exists so lets delete it, but not wait for it
                    fs.unlink(fileName, (err) => {
                        if (err) {
                            console.log('Unable to delete the file "' + fileName + '" from disk.', err);
                        }
                    });
                }
            })
            File.remove(query, callback);
        })
        .catch(e => callback(e, null))

};
/**
 *	Finds all files that have more than one owner and one of them is is ownerId
 *
 * @param {string} ownerId Search for this owner in the File owner array
 * @param {requestCallbackWithError} callback The callback that handles the response.
 */
module.exports.listByOwnerIdFindOnlyMoreThanOne = function listByOwnerIdFindOnlyMoreThanOne(ownerId, callback) {
    var query = {
        owners: {
            $elemMatch: { _id: ownerId },
            $size: { $gt: 1 }
        }
    };
    File.find(query, callback);
};

/*
            Non Database functions
*/

module.exports.ownersObjectArrayToStringArray = function(ownersObjectArray) {
    var ret = [];
    if (ownersObjectArray !== undefined && ownersObjectArray !== null) {
        for (var i = 0; i < ownersObjectArray.length; i++) {
            ret.push(ownersObjectArray[i].id);
        }
    }
    return ret;
}

var _getFileExtensions = function(fileName, includeTheDot) {
    if (fileName === undefined || fileName.length < 2) {
        return "";
    }
    var n = fileName.lastIndexOf('.');
    if (n < 1) { return ""; }
    if (includeTheDot !== true) {
        n++;
    }
    var ret = fileName.substring(n);

    return ret;
};

var _getFileName = function(fileName) {
    ret = fileName.replace(/^.*[\\\/]/, '');
    return ret;
};

//returns "" if not path is found.
//if includeSlashAtTheEnd is true then 
//       '/' or '\' will be added at the end of the returned path.
//       but if no path is found then the returned will also be "";
var _getFilePath = function(fileName, includeSlashAtTheEnd) {
    if (fileName === undefined || fileName.length < 2) {
        return "";
    }
    var ret = "";
    var delimiter = '/';
    var n = fileName.lastIndexOf(delimiter);
    if (n < 0) {
        delimiter = '\\';
        n = fileName.lastIndexOf(delimiter);
    }
    if (n < 0) { return ""; }

    if (includeSlashAtTheEnd === true) {
        n++;
    }
    ret = fileName.substring(0, n);

    return ret;
};



// Returns an file extension
//returns an empty string if no file extension is found
//if parameter includeTheDot is true then:
//    the "." will be the first char in the returned string, but
//    if there is no file extension then an empty string is returned with no dot.
module.exports.getFileExtensions = function(FileObject, includeTheDot) {
    return _getFileExtensions(FileObject.fileName, includeTheDot);
};

module.exports.getFileNameOnDiskWithoutExtension = function(FileObject) {

    return FileObject.id;
}

//get original filename with the file extension.
module.exports.getOriginalFileNameWithExtension = function(FileObject) {
    return _getFileName(FileObject.fileName, true);
};

//get the filename on disk which includes the Id + the file extension
module.exports.getFileNameOnDisk = function(FileObject) {
    return FileObject.id + File.getFileExtensions(FileObject, true);
};

//get the file path on disk
module.exports.getFilePathOnDisk = function(FileObject) {
    return _getFilePath(FileObject.fileName);
};

//get the file path and filename on disk which includes the Id + the file extension
module.exports.getFullFileNameOnDisk = function(FileObject, removePublicFromPath) {
    var ret = _getFilePath(FileObject.fileName, true) + module.exports.getFileNameOnDisk(FileObject);
    if (removePublicFromPath)
        return ret.replace('./public', '');
    return ret;
};

module.exports.getFileSizeOnDisk = (filePath) => {
    try {
        return fs.statSync(filePath).size;
    } catch (err) {
        return false;
    }
}
module.exports.removeFileNameExtendion = (fileNameWithExtendion) => {
    const pos = fileNameWithExtendion.lastIndexOf('.')
    if (pos < 1) {
        return fileNameWithExtendion;
    }
    return fileNameWithExtendion.substr(0, pos);

}
module.exports.imageCount = async function() {
    var query = {
        fileName: new RegExp("^./public/files/images/")
    };
    return await File.countDocuments(query);
}

var findObjectIdInArray = function findObjectIdInArray(arrayOfObjectIds, stringId) {
    if (arrayOfObjectIds === undefined || arrayOfObjectIds == null) {
        return -1;
    }
    for (var i = 0; i < arrayOfObjectIds.length; i++) {
        if (arrayOfObjectIds[i].equals(stringId)) {
            return i;
        }
    }

    return -1;
}

module.exports.toJson = function(item, descriptionMaxLength, addSrcPath) {
    if (!item)
        return item;

    var ret = {
        id: item.id,
        name: item.name,
        description: descriptionMaxLength ? module.exports.Utils.maxStringLength(item.description, descriptionMaxLength) : item.description,
        fileName: item.fileName,
        size: item.size,
        owners: [] //Object.assign(item.owners),
    };
    if (item.owners) {
        item.owners.forEach(e => ret.owners.push(e.id.toString()))
    }

    if (addSrcPath) {
        ret.src = module.exports.getFullFileNameOnDisk(item, true);
    }
    return ret;
}
module.exports.toViewModel = function(item, descriptionMaxLength) {
    var ret = module.exports.toJson(item, descriptionMaxLength, true);
    size: this.listByOwnerId.item.size
    return ret;
}

module.exports.toJsonList = function(item, descriptionMaxLength) {
    return module.exports.toJson(item, descriptionMaxLength, true)
}

module.exports.search = function(query, sort, itemsPerPage, page, descriptionMaxLength) {
    return helper.collectionSearch('file', query, sort, itemsPerPage, page, descriptionMaxLength);
};

module.exports.getByIdAsJson = async function(id, countHowManyParts) {
    return helper.collectionGetByIdAsJson('file', id, countHowManyParts);
}


/**
 * searches trhough the database for files that are not connected to any parts
 * or owners.  Or just exist on disk not in db.
 * @param {string[]} directories - directories which could contain files in db
 */
module.exports.listOrphans = async function(directories) {

    const allFiles = await File.find({});
    const existInCollectionButNotOnDisk = allFiles.filter(e => {
        if (!validator.fileExists(File.getFullFileNameOnDisk(e))) {
            return e;
        }
    })

    var partIds = await helper.getValidCollection('part').find({}).then(list => {
        return list.map(e => e.id);
    })

    var userIds = await helper.getValidCollection('user').find({}).then(list => {
        return list.map(e => e.id)
    })

    var filesWithNoOwners = allFiles.filter(file => {
        const ownerIds = file.owners.map(e => e._id.toString());
        if (!userIds.some(a => ownerIds.includes(a)) && !partIds.some(a => ownerIds.includes(a)))
            return file;
    });

    if (existInCollectionButNotOnDisk.length) {
        console.warn(`${existInCollectionButNotOnDisk.length} files exist in database but not on disk.`)
    }

    const dirSearch = directories.map(e => {
        return {
            path: e,
            orphans: []
        }
    })

    const allFileIds = allFiles.map(e => e.id)
    dirSearch.forEach(directory => {
        const openedDir = fs.opendirSync(directory.path);
        let fileDirent = true;
        while (fileDirent) {
            fileDirent = openedDir.readSync();
            if (fileDirent != null) {
                if (fileDirent.isFile()) {
                    const id = module.exports.removeFileNameExtendion(fileDirent.name);
                    if (!allFileIds.includes(id)) {
                        directory.orphans.push(fileDirent.name);
                    }
                }
            }
        }
    });

    return {
        result: {
            existInCollectionWithNoOwners: filesWithNoOwners,
            existOnDiskButNotInCollection: dirSearch,
            existInCollectionButNotOnDisk: existInCollectionButNotOnDisk
        }
    };
};