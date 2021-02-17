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
    validSearchCollections: () => { return ['part', 'type', 'location', 'manufacturer', 'supplier']; },
    isValidCollection: (collectionString) => { return this.validSearchCollections().includes(collectionString) },
    getValidCollection: (collectionString, excludeCollection) => {

        if (excludeCollection && collectionString === excludeCollection) {
            return null;
        }

        switch (collectionString) {
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

        /*
        const File =         require('../models/file');
        const Type =         require('../models/type');
        const Location =     require('../models/location');
        const Manufacturer = require('../models/manufacturer');
        const Supplier =     require('../models/supplier');
        const Part =         require('../models/part');
        */

        return null;
    }

};