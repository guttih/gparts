"use strict";
var mongoose = require('mongoose');
var Action = require('./action');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var LocationSchema = mongoose.Schema({
    name: { type: String, index: true },
    description: { type: String },
    data: { type: String },
    action: ObjectId,
});

var Location = module.exports = mongoose.model('Location', LocationSchema);

module.exports.Utils = require('./modelUtility');

module.exports.copyValues = function(item, includeId = true) {

    var ret = {
        name: item.name,
        description: item.description,
        data: item.data,
        action: item.action
    };
    if (includeId) {
        ret.id = item.id;
    }

    return ret;
};

module.exports.toJson = function(item) {
    return module.exports.copyValues(item);
};

module.exports.delete = function(id, callback) {

    Location.findByIdAndRemove(id, callback);
};

module.exports.modify = function(id, newValues, callback) {
    //$set
    var val = { $set: newValues };
    Location.update({ _id: id }, val, callback);
};

module.exports.create = function(newLocation, callback) {
    newLocation.save(callback);
};

module.exports.createPromise = function(location) {
    return new Promise((resolve, reject) => {
        location.save(location, (err, res) => {
            if (err || !res) { reject(err) } else resolve(res)
        })
    })
};


module.exports.getById = function(id, callback) {
    Location.findById(id, callback);
};

module.exports.getByIdPromise = function(id) {
    return new Promise((resolve, reject) => {
        Location.findById(id, (err, res) => {
            if (err || !res) { reject(err) } else resolve(res)
        })
    })
};

module.exports.getActionUrlByLocationId = function(id, callback) {
    Location.findById(id, function(err, location) {
        if (err || location === null) {
            callback(err, location);
        } else {

            Action.findById(location.action, function(err, action) {
                if (err || action === null) {
                    callback(err, location);
                } else {
                    callback(err, Action.makeActionUrl(action.url, location.data));
                }
            });
        }
    });
};

//get all records
module.exports.list = function(callback) {
    var query = {};
    Location.find(query, callback);
};
module.exports.createObjectId = () => { return new mongoose.mongo.ObjectId() };

module.exports.toJsonList = function(item, descriptionMaxLength) {
    var ret = {
        id: item.id,
        name: item.name,
        description: module.exports.Utils.maxStringLength(item.description, descriptionMaxLength),
        data: item.data,
        action: item.action
    };
    return ret;
}

module.exports.itemListToClientList = function(list, descriptionMaxLength, attachListToThisObject) {
    return new Promise((resolve, reject) => {
        if (!list) {
            reject({ code: 400, message: "List is missing!" })
        } else {
            const arr = [];
            let i, item;
            for (i = 0; i < list.length; i++) {
                item = Location.toJsonList(list[i], descriptionMaxLength);
                arr.push(item);
            }

            attachListToThisObject.result = arr;
            resolve(attachListToThisObject)

        }
    })
}

/**
 * List locations.
 *
 * @param {Object} query Query object to search for.  Pass null to list all locations.
 * @param {Number} maxDescriptionLength How long can Location.descriptions. pass null for no length restriction
 * @param {requestCallbackWithError} callback callback function where fist parameter is err and second is result
 */

module.exports.search = function(query, sort, itemsPerPage, page, descriptionMaxLength) {
    const sortedBy = sort ? sort : { lastModified: -1 };
    page = Math.max(0, page);
    return new Promise((resolve, reject) => {
        Location
            .find(query)
            .limit(itemsPerPage)
            .skip(itemsPerPage * page)
            .sort(sortedBy)
            .exec(function(err, list) {
                if (err || !list) {
                    reject(err)
                } else {
                    Location.countDocuments(query).exec(function(err, count) {
                        if (err || !list) {
                            reject(err);
                        }
                        const rootObject = {
                            page: page,
                            itemsPerPage: itemsPerPage,
                            pages: Math.ceil(count / itemsPerPage),
                            count: count
                        }
                        Location.itemListToClientList(list, descriptionMaxLength, rootObject)
                            .then(newList => resolve(newList))
                            .catch(err => reject(err));
                    })
                }
            })
    })
};