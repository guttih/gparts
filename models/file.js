"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var FileSchema = mongoose.Schema({
	name       : { type: String, index:true },
	description: String,
	type       : String
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
