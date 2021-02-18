"use strict";
var mongoose = require('mongoose');
const routeCollectionHelper = require('../utils/routeCollectionHelper');
var TypeSchema = mongoose.Schema({
    name: { type: String, index: true },
    description: { type: String }
});


var Type = module.exports = mongoose.model('Type', TypeSchema);


module.exports.toJson = function(item) {
    if (!item)
        return null;

    var ret = {
        id: item.id,
        name: item.name,
        description: item.description
    };
    return ret;
};


module.exports.delete = function(id, callback) {
    //todo must not delete if any part is of this type
    Type.findByIdAndRemove(id, callback);
};

module.exports.modify = function(id, newValues, callback) {
    //$set
    var val = { $set: newValues };
    Type.update({ _id: id }, val, callback);
};

module.exports.create = function(newType, callback) {
    newType.save(callback);
};
// module.exports.getById = function(id, callback) {
//     Type.findById(id, callback);
// };


/**
 * Finds a Type schema object and converts it to a raw JSON object
 * @param {string} id 
 * @param {any|} CountThisObject - if true a number of parts of this type
 * will be added to the returned object.
 * If you provide the object to be used
 * @returns Success: a json object containing only object properties.
 *             Fail: null if an error or type was not found.
 */
module.exports.getByIdAsJson = async function(id, countHowManyParts) {
    return routeCollectionHelper.collectionGetByIdAsJson('type', id, countHowManyParts);

};

//get all records
module.exports.list = function(callback) {
    var query = {};
    Type.find(query, callback);
};

module.exports.query = function(query, callback) {
    Part.find(query, callback);
};

module.exports.Utils = require('./modelUtility');

/**
 * Converts Shema type object to a plain Json object
 * @param {*} item 
 * @param {*} [descriptionMaxLength] - If provided, description text 
 * returned in object will never be longer than the given value.
 * If NOT provided the description text will always be returned in full lenght.
 */
module.exports.toJson = function(item, descriptionMaxLength) {
    var ret = {
        id: item.id,
        name: item.name,
        description: descriptionMaxLength ? module.exports.Utils.maxStringLength(item.description, descriptionMaxLength) : item.description
    };
    return ret;
}

module.exports.toJsonList = function(item, descriptionMaxLength) {
    return module.exports.toJson(item, descriptionMaxLength)
}

module.exports.search = function(query, sort, itemsPerPage, page, descriptionMaxLength) {
    return routeCollectionHelper.collectionSearch('type', query, sort, itemsPerPage, page, descriptionMaxLength);
};