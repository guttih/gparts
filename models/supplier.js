"use strict";
var mongoose = require('mongoose');
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
 * @param {any|} CountThisObject - if true a number of parts of this type
 * will be added to the returned object.
 * If you provide the object to be used
 * @returns Success: a json object containing only object properties.
 *             Fail: null if an error or type was not found.
 */
module.exports.getByIdAsJson = async function(id, CountThisObject) {
    let item;
    try {
        item = await Supplier.findById(id);
    } catch (err) {
        console.log(err)
        return null;
    }

    let itemAsJson = Supplier.toJson(item);
    if (!CountThisObject || !itemAsJson) {
        return itemAsJson;
    }

    //Use part if provided
    const useProvidedPart = typeof CountThisObject === 'function' &&
        typeof CountThisObject.countDocuments === 'function';

    const Part = useProvidedPart ?
        CountThisObject :
        require('../models/part');
    let partCount;
    try {
        partCount = await Part.countDocuments({ supplier: id });
    } catch (err) {
        console.warn('error while couting parts of supplier');
        console.log(err);
        return null;
    }

    itemAsJson.partCount = partCount;
    return itemAsJson;

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

module.exports.itemListToClientList = function(list, descriptionMaxLength, attachListToThisObject) {
    return new Promise((resolve, reject) => {
        if (!list) {
            reject({ code: 400, message: "List is missing!" })
        } else {
            const arr = [];
            let i, item;
            for (i = 0; i < list.length; i++) {
                item = module.exports.toJsonList(list[i], descriptionMaxLength);
                arr.push(item);
            }
            attachListToThisObject.result = arr;
            resolve(attachListToThisObject)
        }
    })
}

/**
 * List suppliers.
 *
 * @param {Object} query Query object to search for.  Pass null to list all suppliers.
 * @param {Number} maxDescriptionLength How long can Supplier.descriptions. pass null for no length restriction
 * @param {requestCallbackWithError} callback callback function where fist parameter is err and second is result
 */

module.exports.search = function(query, sort, itemsPerPage, page, descriptionMaxLength) {
    const sortedBy = sort ? sort : { lastModified: -1 };
    page = Math.max(0, page);
    return new Promise((resolve, reject) => {
        Supplier
            .find(query)
            .limit(itemsPerPage)
            .skip(itemsPerPage * page)
            .sort(sortedBy)
            .exec(function(err, list) {
                if (err || !list) {
                    reject(err)
                } else {
                    Supplier.countDocuments(query).exec(function(err, count) {
                        if (err || !list) {
                            reject(err);
                        }
                        const rootObject = {
                            page: page,
                            itemsPerPage: itemsPerPage,
                            pages: Math.ceil(count / itemsPerPage),
                            count: count
                        }
                        Supplier.itemListToClientList(list, descriptionMaxLength, rootObject)
                            .then(newList => resolve(newList))
                            .catch(err => reject(err));
                    })
                }
            })
    })
};