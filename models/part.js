"use strict";
var mongoose = require('mongoose');
var File = require('./file');
var Type = require('./type');
var Location = require('./location');
var Manufacturer = require('./manufacturer');
var Supplier = require('./supplier');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Utils = require('./modelUtility');
var PartSchema = mongoose.Schema({
    name: { type: String, index: true },
    description: { type: String },
    category: { type: String },
    urls: { type: String },
    image: ObjectId,
    files: [{ ObjectId }],
    stockCount: Number,
    firstAcquired: Date,
    lastModified: Date,
    type: ObjectId,
    location: ObjectId,
    manufacturer: ObjectId,
    supplier: ObjectId
});

var Part = module.exports = mongoose.model('Part', PartSchema);

module.exports.Utils = Utils;

/**
 * @callback requestCallbackWithError
 * @param {object} if success null if not an err object
 * @param {object} usually a object but can be a string too
 */

function errorToUser(msg, statusCode) {
    var obj = {
        messageToUser: msg
    };
    if (statusCode !== undefined) {
        obj["statusCode"] = statusCode;
    }
    return obj;
}

module.exports.delete = function(id, callback) {
    Part.findById(id, function(err, part) {
        //now we need to search for all files and remove them if this part is the owner
        File.deleteByOwnerIdFindOnlyOne(id, function(err, files) {
            File.listByOwnerId(id, function(err, files) {
                files.forEach(element => {
                    File.removeOwner(element, id, function(err, result) {
                        console.log('removed part (' + id + ') as an owner of file (' + element.id + ')');
                    });
                });
            });
        });
        Part.findByIdAndRemove(id, callback);
    });
};

module.exports.modify = function(id, newValues, callback) {
    //$set
    var val = { $set: newValues };
    Part.update({ _id: id }, val, callback);
};

module.exports.addFile = function(id, newFileId, callback) {
    var query = { _id: id };

    if (newFileId === undefined) {
        return callback(errorToUser("File id is missing", 400));
    }

    Part.findOne(query, function(err, item) {
        if (err) {
            return callback(err);
        }

        if (item.files === undefined || item.files === null) {
            item.files = [];
        }
        item.files.push(newFileId);

        item.save(callback);
    });
};



/**
 * Changes a property value to null if it matches the given value (@propertyValue)
 *
 * @param {string} id id of the part
 * @param {string} propertyName name of the property to search for
 * @param {string} propertyValue value of the property to search for
 * @param {string} callback call when search or saved change is over
 */
module.exports.ClearPropertyIfMatch = function ClearPropertyIfMatch(id, propertyName, propertyValue, callback) {
    var query = { _id: id };

    if (id === undefined) {
        return callback(errorToUser("File id is missing", 400));
    }

    Part.findOne(query, function(err, item) {
        if (err) {
            return callback(err);
        }

        if (item[propertyName] !== undefined && item[propertyName] !== null && item[propertyName].toString() === propertyValue) {
            item[propertyName] = null;
            item.save(callback);

        } else {
            if (callback !== undefined) {
                callback(null, { msg: "No property matched, so nothing to clear" });
            }
        }


    });
};

module.exports.create = function(newPart, callback) {
    newPart.save(callback);
};
module.exports.getById = function(id, callback) {
    Part.findById(id, callback);
};





module.exports.query = function(query, callback) {
    Part.find(query, callback);
};

module.exports.toJsonList = function(item, descriptionMaxLength) {
    var ret = {
        id: item.id,
        name: item.name,
        description: Utils.maxStringLength(item.description, descriptionMaxLength),
        image: (item.image !== undefined && item.image !== null) ? item.image.toString() : null
    };
    return ret;
}

module.exports.toJson = function(item) {
    var ret = {
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        urls: item.urls,
        files: [],
        stockCount: item.stockCount,
        firstAcquired: item.firstAcquired,
        lastModified: item.lastModified,
        type: (item.type !== undefined && item.type !== null) ? item.type.toString() : null,
        location: (item.location !== undefined && item.location !== null) ? item.location.toString() : null,
        manufacturer: (item.manufacturer !== undefined && item.manufacturer !== null) ? item.manufacturer.toString() : null,
        supplier: (item.supplier !== undefined && item.supplier !== null) ? item.supplier.toString() : null,
        image: (item.image !== undefined && item.image !== null) ? item.image.toString() : null

    };
    return ret;
}
module.exports.toJsonCallback = function(item, callback) {

    var ret = module.exports.toJson(item);
    File.listByOwnerId(item.id, function(err, fileList) {
        if (err) { callback(err); return; }
        for (var index in fileList) {
            var file = fileList[index];
            var fItem = {
                id: file.id,
                name: file.name,
                description: file.description,
                fileName: file.fileName,

            }
            var owners = [];
            if (file.owners !== undefined && file.owners !== null) {
                for (var i = 0; i < file.owners.length; i++) {
                    owners.push(file.owners[i].id.toString());
                }
            }

            ret.files.push({
                id: file.id,
                name: file.name,
                description: file.description,
                fileName: file.fileName,
                owners: owners
            });
        }
        callback(err, ret);
    });
};


module.exports.getSendObject = function(partId, callback) {
    Part.getById(partId, function(err, item) {
        if (err) { callback(err); return; }
        Part.toJsonCallback(item, callback);
    });
};


// Type
module.exports.queryType = function(query, callback) {
    Type.find(query, callback);
};

module.exports.listByType = function(typeId, maxDescriptionLength, callback) {
    Part.list({ type: typeId }, maxDescriptionLength, callback);
};

module.exports.TypeToJson = function(item, descriptionMaxLength) {

    return Type.toJson(item, descriptionMaxLength);
};




//Location
module.exports.queryLocation = function(query, callback) {
    Location.find(query, callback);
};
module.exports.listByLocation = function(locationId, maxDescriptionLength, callback) {
    Part.list({ location: locationId }, maxDescriptionLength, callback);
};

module.exports.LocationToJson = function(item) {

    return Location.toJson(item);
};

//Manufacturer
module.exports.queryManufacturer = function(query, callback) {
    Manufacturer.find(query, callback);
};
module.exports.listByManufacturer = function(manufacturerId, maxDescriptionLength, callback) {
    Part.list({ manufacturer: manufacturerId }, maxDescriptionLength, callback);
};

module.exports.ManufacturerToJson = function(item) {

    return Manufacturer.toJson(item);
};

//Supplier
module.exports.querySupplier = function(query, callback) {
    Supplier.find(query, callback);
};
module.exports.listBySupplier = function(supplierId, maxDescriptionLength, callback) {
    Part.list({ supplier: supplierId }, maxDescriptionLength, callback);
};

module.exports.SupplierToJson = function(item) {

    return Supplier.toJson(item);
};

module.exports.partListToClientList = function(list, descriptionMaxLength, attachListToThisObject) {
    return new Promise((resolve, reject) => {
        if (!list) {
            reject({ code: 400, message: "List is missing!" })
        } else {
            const arr = [];
            let i, part;
            let imageIds = [];
            for (i = 0; i < list.length; i++) {
                part = Part.toJsonList(list[i], descriptionMaxLength);
                arr.push(part);
                if (part.image !== null) {
                    imageIds.push(part.image);
                }
            }
            if (imageIds.length > 0) {
                File.find({ '_id': { $in: imageIds } }, function(err, fileList) {
                    if (!err && fileList) {
                        for (let fIndex = 0; fIndex < fileList.length; fIndex++) {
                            let fileItem = fileList[fIndex];
                            i = arr.map(function(e) {
                                return e.image;
                            }).indexOf(fileItem.id);
                            if (i > -1) {
                                arr[i].src = File.getFullFileNameOnDisk(fileItem).replace('./public', '');
                            }
                        }
                        attachListToThisObject.result = arr;
                        resolve(attachListToThisObject);
                    }
                });
            } else {
                attachListToThisObject.result = arr;
                resolve(attachListToThisObject)
            }
        }
    })
}


/**
 * List parts.
 *
 * @param {Object} query Query object to search for.  Pass null to list all parts.
 * @param {Number} maxDescriptionLength How long can Part.descriptions. pass null for no length restriction
 * @param {requestCallbackWithError} callback callback function where fist parameter is err and second is result
 */

module.exports.search = function(query, sort, itemsPerPage, page, descriptionMaxLength) {
    const sortedBy = sort ? sort : { lastModified: -1 };
    page = Math.max(0, page);
    return new Promise((resolve, reject) => {
        Part
            .find(query)
            .limit(itemsPerPage)
            .skip(itemsPerPage * page)
            .sort(sortedBy)
            .exec(function(err, list) {
                if (err || !list) {
                    reject(err)
                } else {
                    Part.count(query).exec(function(err, count) {
                        if (err || !list) {
                            reject(err);
                        }
                        const rootObject = {
                            page: page,
                            itemsPerPage: itemsPerPage,
                            pages: Math.ceil(count / itemsPerPage),
                            count: count
                        }
                        Part.partListToClientList(list, descriptionMaxLength, rootObject)
                            .then(newList => resolve(newList))
                            .catch(err => reject(err));
                    })
                }
            })
    })
};