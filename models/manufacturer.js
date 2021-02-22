"use strict";
var mongoose = require('mongoose');
const routeCollectionHelper = require('../utils/routeCollectionHelper');
var ManufacturerSchema = mongoose.Schema({
    name: { type: String, index: true },
    description: { type: String },
    url: { type: String }
});

var Manufacturer = module.exports = mongoose.model('Manufacturer', ManufacturerSchema);

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
        description: descriptionMaxLength ? module.exports.Utils.maxStringLength(item.description, descriptionMaxLength) : item.description,
        url: item.url
    };
    return ret;
}

module.exports.delete = function(id, callback) {

    Manufacturer.findByIdAndRemove(id, callback);
};

module.exports.modify = function(id, newValues, callback) {
    //$set
    var val = { $set: newValues };
    Manufacturer.update({ _id: id }, val, callback);
};

module.exports.create = function(newManufacturer, callback) {
    newManufacturer.save(callback);
};
module.exports.getById = function(id, callback) {
    Manufacturer.findById(id, callback);
};

//get all records
module.exports.list = function(callback) {
    var query = {};
    Manufacturer.find(query, callback);
};

module.exports.toJsonList = function(item, descriptionMaxLength) {
    return module.exports.toJson(item, descriptionMaxLength)
}

module.exports.search = function(query, sort, itemsPerPage, page, descriptionMaxLength) {
    return routeCollectionHelper.collectionSearch('manufacturer', query, sort, itemsPerPage, page, descriptionMaxLength);
};

module.exports.getByIdAsJson = async function(id, countHowManyParts) {
    return routeCollectionHelper.collectionGetByIdAsJson('manufacturer', id, countHowManyParts);
}