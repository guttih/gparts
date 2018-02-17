"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var FileSchema = mongoose.Schema({
	name       : { type: String, index:true },
	description: String,
	originalFilename: String
}); 

var File = module.exports = mongoose.model('File', FileSchema);

// returns an file estendion
//returns an empty string if no file extension is found
//if parameter includeTheDot is true then:
//    the "." will be the first char in the returned string, but
//    if there is no file extension then an empty string is returned with no dot.
module.exports.getFileExtensions = function (FileObject, includeTheDot){
	var ret = "";
	if (FileObject.originalFilename === undefined || FileObject.originalFilename.indexOf('.') < 1) {
			return "";
	}
	ret = FileObject.originalFilename.split('.').pop();

	if (includeTheDot === true && ret.length > 0) {
		ret = '.' + ret;
	}
	return ret;
};

module.exports.getFileNameOnDisk = function (FileObject){
	return FileObject.id + File.getFileExtensions(FileObject, true);
};
module.exports.delete = function (id, callback){
	
	File.findByIdAndRemove(id, callback);
};

module.exports.modify = function (id, newValues, callback){
	//$set
	var val = {$set: newValues};
	File.update({_id: id}, val, callback);
};

module.exports.create = function(newFile,  callback){
        newFile.save(callback);
};
module.exports.getById = function(id, callback){
	File.findById(id, callback);
};

//get all records
module.exports.list = function (callback){
	var query = {};
	File.find(query, callback);
};
