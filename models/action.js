"use strict";
var mongoose = require('mongoose');
const helper = require('../utils/routeCollectionHelper');
//Type can be HTTP_POST or HTTP_GET  //todo: set to enum
// 0 == HTTP_GET request
// 1 == HTTP_POST request
// 2 == HTTP_PUT request
// 3 == HTTP_PATCH request
// 4 == HTTP_DELETE request

var ActionSchema = mongoose.Schema({
    name: { type: String, index: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['HTTP_GET',
            'HTTP_POST',
            'HTTP_PUT',
            'HTTP_PATCH',
            'HTTP_DELETE'
        ],
        default: 'HTTP_GET'
    },
    url: { type: String },
    body: { type: String },
});

var Action = module.exports = mongoose.model('Action', ActionSchema);

module.exports.Utils = require('./modelUtility');

module.exports.toJson = function(item, descriptionMaxLength) {

    var ret = {
        id: item.id,
        name: item.name,
        description: descriptionMaxLength ? module.exports.Utils.maxStringLength(item.description, descriptionMaxLength) : item.description,
        type: item.type,
        url: item.url,
        body: item.body
    };
    return ret;
};

module.exports.delete = function(id, callback) {

    Action.findByIdAndRemove(id, callback);
};

module.exports.modify = function(id, newValues, callback) {
    //$set
    var val = { $set: newValues };
    Action.update({ _id: id }, val, callback);
};

module.exports.create = function(newAction, callback) {
    newAction.save(callback);
};
module.exports.getById = function(id, callback) {
    Action.findById(id, callback);
};

//get all records
module.exports.list = function(callback) {
    var query = {};
    Action.find(query, callback);
};

module.exports.toJsonList = function(item, descriptionMaxLength) {
    return module.exports.toJson(item, descriptionMaxLength)
}

module.exports.search = function(query, sort, itemsPerPage, page, descriptionMaxLength) {
    return helper.collectionSearch('action', query, sort, itemsPerPage, page, descriptionMaxLength);
};

module.exports.getByIdAsJson = async function(id, count) {
    if (count)
        return await helper.collectionGetByIdAsJson('action', id, helper.getValidCollection('location'));
    else
        return await helper.collectionGetByIdAsJson('action', id, false);

}

//get all records as a Json object
module.exports.listAsJson = function(callback) {
    var query = {};
    Action.find(query, function(err, list) {
        if (err || list === null) {
            callback(err, list);
        } else {
            var arr = [];
            for (var i = 0; i < list.length; i++) {
                arr.push(module.exports.toJson(list[i]));
            }
            callback(err, arr);
        }

    });
};

module.exports.makeActionUrl = function(actionUrl, locationData) {
    if (actionUrl === undefined || actionUrl === null)
        return null;

    if (locationData === undefined || locationData === null) {
        return actionUrl;
    }
    return actionUrl.replace("<<DATA>>", locationData);
};