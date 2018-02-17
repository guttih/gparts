"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var FileSchema = mongoose.Schema({
	name       : { type: String, index:true },
	description: String,
	fileName   : String /*Will store the path on disk, the original file name and file extension*/
}); 

var File = module.exports = mongoose.model('File', FileSchema);

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


/*

			Non Database functions

*/

var _getFileExtensions = function (fileName, includeTheDot){
	if (fileName === undefined || fileName.length < 2) {
		return "";
	}
	var n = fileName.lastIndexOf('.');
	if (n < 1) { return ""; }
	if (includeTheDot!== true) {
		n++;
	}
	var ret = fileName.substring(n);

	return ret;
};

var _getFileName = function (fileName){
	ret = fileName.replace(/^.*[\\\/]/, '');
	return ret;
};

//returns "" if not path is found.
//if includeSlashAtTheEnd is true then 
//       '/' or '\' will be added at the end of the returned path.
//       but if no path is found then the returned will also be "";
var _getFilePath = function (fileName, includeSlashAtTheEnd){
	if (fileName === undefined || fileName.length < 2) {
		return "";
	}
	var ret = "";
	var delimiter = '/';
	var n = fileName.lastIndexOf(delimiter);
	if (n < 0) {
		delimiter = '\\';
		n = fileName.lastIndexOf(delimiter);
	}
	if (n < 0) { return ""; }

	if (includeSlashAtTheEnd === true ) {
		n++;
	}
	ret = fileName.substring(0, n);

	return ret;
};



// Returns an file extension
//returns an empty string if no file extension is found
//if parameter includeTheDot is true then:
//    the "." will be the first char in the returned string, but
//    if there is no file extension then an empty string is returned with no dot.
module.exports.getFileExtensions = function (FileObject, includeTheDot){
	return _getFileExtensions(FileObject.fileName, includeTheDot); 
};

module.exports.getFileNameOnDiskWithoutExtension = function (FileObject){
	
	return FileObject.id;
}

//get original filename with the file extension.
module.exports.getOriginalFileNameWithExtension = function (FileObject){
	return _getFileName(FileObject.fileName, true);
};

//get the filename on disk which includes the Id + the file extension
module.exports.getFileNameOnDisk = function (FileObject){
	return FileObject.id + File.getFileExtensions(FileObject, true);
};

//get the filename on disk which includes the Id + the file extension
module.exports.getFilePathOnDisk = function (FileObject){
	return _getFilePath(FileObject.fileName);
};

module.exports.getFullFileNameOnDisk = function (FileObject) {
	var ret = _getFilePath(FileObject.fileName, true) + module.exports.getFileNameOnDisk(FileObject);
	return ret;
}