module.exports.maxStringLength = function maxStringLength(str, maxLength, appender) {
    if (maxLength === undefined || maxLength === null || str.length < maxLength) {
        return str;
    }

    if (appender === undefined) {
        appender = '...'
    }

    return str.substr(0, maxLength) + appender;
}


module.exports.escapeRegExp = function(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

module.exports.makeRegExFromSpaceDelimitedString = (str, multilineSearch, regexOptions) => {

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
}