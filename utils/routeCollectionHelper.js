module.exports = {
    /**
     *  returns a sorting object based on input value
     * @param {string} reqBodySortingMethod - The name of the attribute to convert to a 
     * sorting object.  If this parameter has the postfix "Desc" then the sorting order
     * will be in reverse  (decsending:-1).
     */
    makeSortingObject: (reqBodySortingMethod) => {

        let sorting = null;

        if (reqBodySortingMethod) {
            let inMethod = reqBodySortingMethod;
            const descPos = inMethod.indexOf('Desc');
            let order = 1;
            if (descPos > 0) {
                //order -1 if method end with "Desc"
                order = descPos + 4 === inMethod.length ? -1 : 1;
                inMethod = inMethod.substr(0, descPos);
            }
            sorting = {}
            sorting[inMethod] = order;
        }
        return sorting
    },
    escapeRegExp: (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    },
    makeRegExFromSpaceDelimitedString: (str, multilineSearch, regexOptions) => {

        if (multilineSearch === undefined) throw new Error('makeRegExFromSpaceDelimitedString -> multilineSearch is missing')
        if (regexOptions === undefined) regexOptions = "i"

        //remove white spaces and escape all regex characters. 
        const noWhiteSpaces = module.exports.escapeRegExp(str.replace(/\s\s+/g, ' '))

        //  ([\s\S]*?) or (.*?)       \s is slow
        const lineToken = multilineSearch ? '[\\s\\S]' : '.';
        //array of all words with no dublications and no empty strings
        const words = Array.from(new Set((noWhiteSpaces.split(' ').filter(e => { if (e) { return e } }))));
        let expr = words.map(e => `(?=${lineToken}*${e})`).join(''); //search in multiline string
        expr = `${expr}`
        return new RegExp(expr, regexOptions)
    },
    capitalizeFirst: (str) => str.charAt(0).toUpperCase() + str.slice(1),
    validSearchCollections: () => { return ['action', 'part', 'type', 'location', 'manufacturer', 'supplier', 'user', 'file']; },
    isValidCollection: (collectionString) => { return this.validSearchCollections().includes(collectionString) },
    getValidCollection: (collectionString, excludeCollection) => {

        if (excludeCollection && collectionString === excludeCollection) {
            return null;
        }

        switch (collectionString) {
            case 'action':
                return require('../models/action');
            case 'user':
                return require('../models/user');
            case 'file':
                return require('../models/file');
            case 'type':
                return require('../models/type');
            case 'location':
                return require('../models/location');
            case 'manufacturer':
                return require('../models/manufacturer');
            case 'supplier':
                return require('../models/supplier');
            case 'part':
                return require('../models/part');
        }

        return null;
    },
    getRouterRegisterCollectionId: async(collection, req, res) => {
        var id = req.params.id;
        if (!id) {
            return module.exports.renderResultViewErrors(res, `${collection} Id is missing from url`)
        }

        const obj = await module.exports.getValidCollection(collection).getByIdAsJson(id, true);
        if (obj) {
            return res.render(`register-${collection}`, { item: JSON.stringify(obj) });
        } else {
            return module.exports.renderResultViewErrors(res, `Could not get ${collection}.`)
        }
    },

    /**
     * 
     * @param {Responce} res - the responce to render the result page to
     * @param {string|string[]} errorStringOrArrayOfErrorStrings - one string or array of string containing error message(s).
     * @param {string} [pageTitle='Error']  - If provided result page title will changed from 'Error' to what is provided in this param.
     */
    renderResultViewErrors: (res, errorStringOrArrayOfErrorStrings, pageTitle) => {
        pageTitle = pageTitle ? pageTitle : "Error";
        if (errorStringOrArrayOfErrorStrings === undefined) {
            throw new Error('renderResultViewErrors -> error text undefined, did yo forget to add the res?')
        }
        const errors = [];
        const theType = typeof errorStringOrArrayOfErrorStrings;

        if (theType === 'object' && Array.isArray(errorStringOrArrayOfErrorStrings)) {
            errorStringOrArrayOfErrorStrings.forEach(e => {
                errors.push({ msg: e })
            });
        } else if (theType === 'string') { //just a string
            errors.push({ msg: errorStringOrArrayOfErrorStrings })
        } else {
            errors.push({ msg: "Unhandled error!!!!" })
        }

        res.render('result', { title: pageTitle, errors: errors });
    },

    /**
     * Search a Collection (Part|Type|Location|Manufacturer:Supplier)
     *
     * @param {string} collection - name of the collection valid strings are ['action', 'part', 'type', 'location', 'manufacturer', 'supplier', 'user', 'file'].   See: validSearchCollections()
     * @param {object} query - the search query.  If you want to list all pass an empty object like this {}
     * @param {object} sort - how should the list be ordered? pass null for a default order
     * @param {number} itemsPerPage - how many items should be in a responce
     * @param {number} page - Items on what page should be returned
     * @param {number} descriptionMaxLength - what is the maximum length of the item description string.
     */
    collectionSearch: (collection, query, sort, itemsPerPage, page, descriptionMaxLength) => {
        const Collection = module.exports.getValidCollection(collection);
        if (!Collection) {
            throw new Error('collectionSearch => collection is incorrect')
        }

        const sortedBy = sort ? sort : { $natural: -1 };
        page = Math.max(0, page);
        return new Promise((resolve, reject) => {
            Collection
                .find(query)
                .limit(itemsPerPage)
                .skip(itemsPerPage * page)
                .sort(sortedBy)
                .exec(function(err, list) {
                    if (err || !list) {
                        reject(err)
                    } else {
                        Collection.countDocuments(query).exec(function(err, count) {
                            if (err || !list) {
                                reject(err);
                            }
                            const rootObject = {
                                page: page,
                                itemsPerPage: itemsPerPage,
                                pages: Math.ceil(count / itemsPerPage),
                                count: count
                            }
                            module.exports.collectionItemListToClientList(Collection, list, descriptionMaxLength, rootObject)
                                .then(newList => resolve(newList))
                                .catch(err => reject(err));
                        })
                    }
                })
        })
    },
    collectionItemListToClientList: (Collection, list, descriptionMaxLength, attachListToThisObject) => {
        return new Promise((resolve, reject) => {
            if (!list) {
                reject({ code: 400, message: "List is missing!" })
            } else {
                const arr = [];
                let i, item;
                for (i = 0; i < list.length; i++) {
                    item = Collection.toJsonList(list[i], descriptionMaxLength);
                    arr.push(item);
                }
                attachListToThisObject.result = arr;
                resolve(attachListToThisObject)
            }
        })
    },

    /**
     * Finds a Collection schema object and converts it to a raw JSON object
     * @param {string} id 
     * @param {any|} countHowManyParts - if true, a count of parts beloning to 
     * this collection item will be added to the returned object.
     * You can also provied the collection object to search in a different object.
     * @returns Success: a json object containing only object properties.
     *             Fail: null if an error or collection item was not found.
     */
    collectionGetByIdAsJson: async(collection, id, countHowManyParts) => {
        const Collection = module.exports.getValidCollection(collection);
        if (!Collection) {
            throw new Error('collectionSearch => collection is incorrect')
        }

        let item;
        try {
            item = await Collection.findById(id);
        } catch (err) {
            console.log(err)
            return null;
        }

        if (!item)
            return null;

        let itemAsJson = Collection.toJson(item);
        if (!countHowManyParts || !itemAsJson) {
            return itemAsJson;
        }

        //Use part if provided
        const useProvidedPart = typeof countHowManyParts === 'function' &&
            typeof countHowManyParts.countDocuments === 'function';

        const SearchCollection = useProvidedPart ?
            countHowManyParts :
            require('../models/part');
        let partCount;
        try {
            let countQuery = {};
            countQuery[collection] = id;
            partCount = await SearchCollection.countDocuments(countQuery);
        } catch (err) {
            console.warn('error while couting parts of type');
            console.log(err);
            return null;
        }

        itemAsJson.partCount = partCount;
        return itemAsJson;

    }

};