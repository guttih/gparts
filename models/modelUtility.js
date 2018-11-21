module.exports.maxStringLength = function maxStringLength(str, maxLength, appender) {
	if (maxLength === undefined || str.length < maxLength) {
		return str;
	}

	if (appender === undefined) {
		appender ='...'
	}
	
	return str.substr(0, maxLength) + appender;
}