"use strict";
var mongoose = require('mongoose');
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
module.exports.getByIdAsJson = async function(id, CountThisObject) {
    let item;
    try {
        item = await Type.findById(id);
    } catch (err) {
        console.log(err)
        return null;
    }

    let itemAsJson = Type.toJson(item);
    if (!CountThisObject || !itemAsJson) {
        return itemAsJson;
    }

    //Use part if provided
    const useProvidedPart = typeof CountThisObject === 'function' &&
        typeof CountThisObject.countDocuments === 'function';

    console.log(`useProvidedPart: ${useProvidedPart}`)

    const Part = useProvidedPart ?
        CountThisObject :
        require('../models/part');
    let partCount;
    try {
        partCount = await Part.countDocuments({ type: id });
    } catch (err) {
        console.warn('error while couting parts of type');
        console.log(err);
        return null;
    }

    itemAsJson.partCount = partCount;
    return itemAsJson;

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

module.exports.itemListToClientList = function(list, descriptionMaxLength, attachListToThisObject) {
    return new Promise((resolve, reject) => {
        if (!list) {
            reject({ code: 400, message: "List is missing!" })
        } else {
            const arr = [];
            let i, item;
            for (i = 0; i < list.length; i++) {
                item = Type.toJsonList(list[i], descriptionMaxLength);
                arr.push(item);
            }

            attachListToThisObject.result = arr;
            resolve(attachListToThisObject)

        }
    })
}

/**
 * List types.
 *
 * @param {Object} query Query object to search for.  Pass null to list all types.
 * @param {Number} maxDescriptionLength How long can Type.descriptions. pass null for no length restriction
 * @param {requestCallbackWithError} callback callback function where fist parameter is err and second is result
 */

module.exports.search = function(query, sort, itemsPerPage, page, descriptionMaxLength) {
    const sortedBy = sort ? sort : { lastModified: -1 };
    page = Math.max(0, page);
    return new Promise((resolve, reject) => {
        Type
            .find(query)
            .limit(itemsPerPage)
            .skip(itemsPerPage * page)
            .sort(sortedBy)
            .exec(function(err, list) {
                if (err || !list) {
                    reject(err)
                } else {
                    Type.countDocuments(query).exec(function(err, count) {
                        if (err || !list) {
                            reject(err);
                        }
                        const rootObject = {
                            page: page,
                            itemsPerPage: itemsPerPage,
                            pages: Math.ceil(count / itemsPerPage),
                            count: count
                        }
                        Type.itemListToClientList(list, descriptionMaxLength, rootObject)
                            .then(newList => resolve(newList))
                            .catch(err => reject(err));
                    })
                }
            })
    })
};