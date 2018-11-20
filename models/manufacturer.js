"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ManufacturerSchema = mongoose.Schema({
	name       : { type: String, index:true },
	description: { type: String },
	url        : { type: String }
}); 

var Manufacturer = module.exports = mongoose.model('Manufacturer', ManufacturerSchema);

module.exports.toJson = function (item) {

	var ret = {
		id			 : item.id,
		name         : item.name,
		description  : item.description,
		url			 : item.url
	};
	return ret;
};

module.exports.delete = function (id, callback){
	
	Manufacturer.findByIdAndRemove(id, callback);
};

module.exports.modify = function (id, newValues, callback){
	//$set
	var val = {$set: newValues};
	Manufacturer.update({_id: id}, val, callback);
};

module.exports.create = function(newManufacturer,  callback){
        newManufacturer.save(callback);
};
module.exports.getById = function(id, callback){
	Manufacturer.findById(id, callback);
};

//get all records
module.exports.list = function (callback){
	var query = {};
	Manufacturer.find(query, callback);
};
