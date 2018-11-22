module.exports.maxStringLength = function maxStringLength(str, maxLength, appender) {
	if (maxLength === undefined || maxLength === null || str.length < maxLength) {
		return str;
	}

	if (appender === undefined) {
		appender ='...'
	}
	
	return str.substr(0, maxLength) + appender;
}