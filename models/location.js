"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var LocationSchema = mongoose.Schema({
	name       : { type: String, index:true },
	description: { type: String }
}); 

var Location = module.exports = mongoose.model('Location', LocationSchema);

module.exports.toJson = function (item) {

	var ret = {
		id			 : item.id,
		name         : item.name,
		description  : item.description,
	};
	return ret;
};

module.exports.delete = function (id, callback){
	
	Location.findByIdAndRemove(id, callback);
};

module.exports.modify = function (id, newValues, callback){
	//$set
	var val = {$set: newValues};
	Location.update({_id: id}, val, callback);
};

module.exports.create = function(newLocation,  callback){
        newLocation.save(callback);
};
module.exports.getById = function(id, callback){
	Location.findById(id, callback);
};

//get all records
module.exports.list = function (callback){
	var query = {};
	Location.find(query, callback);
};
