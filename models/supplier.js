"use strict";
var mongoose = require('mongoose');
const routeCollectionHelper = require('../utils/routeCollectionHelper');
var SupplierSchema = mongoose.Schema({
    name: { type: String, index: true },
    description: { type: String },
    url: { type: String }
});

var Supplier = module.exports = mongoose.model('Supplier', SupplierSchema);

module.exports.Utils = require('./modelUtility');

module.exports.delete = function(id, callback) {

    Supplier.findByIdAndRemove(id, callback);
};

module.exports.modify = function(id, newValues, callback) {
    //$set
    var val = { $set: newValues };
    Supplier.update({ _id: id }, val, callback);
};

module.exports.create = function(newSupplier, callback) {
    newSupplier.save(callback);
};
// module.exports.getById = function(id, callback) {
//     Supplier.findById(id, callback);
// };
/**
 * Finds a Supplier schema object and converts it to a raw JSON object
 * @param {string} id 
 * @param {any|} countHowManyParts - if true a number of parts of this type
 * will be added to the returned object.
 * If you provide the object to be used
 * @returns Success: a json object containing only object properties.
 *             Fail: null if an error or type was not found.
 */
module.exports.getByIdAsJson = async function(id, countHowManyParts) {
    return routeCollectionHelper.collectionGetByIdAsJson('supplier', id, countHowManyParts);

};

//get all records
module.exports.list = function(callback) {
    var query = {};
    Supplier.find(query, callback);
};

/**
 * Converts  Shema Supplier object to a plain Json object
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

module.exports.toJsonList = function(item, descriptionMaxLength) {
    return module.exports.toJson(item, descriptionMaxLength)
}

module.exports.search = function(query, sort, itemsPerPage, page, descriptionMaxLength) {
    return routeCollectionHelper.collectionSearch('supplier', query, sort, itemsPerPage, page, descriptionMaxLength);
};