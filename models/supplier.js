"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var SupplierSchema = mongoose.Schema({
	name       : { type: String, index:true },
	description: { type: String },
	url        : { type: String }
}); 

var Supplier = module.exports = mongoose.model('Supplier', SupplierSchema);

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
	
	Supplier.findByIdAndRemove(id, callback);
};

module.exports.modify = function (id, newValues, callback){
	//$set
	var val = {$set: newValues};
	Supplier.update({_id: id}, val, callback);
};

module.exports.create = function(newSupplier,  callback){
        newSupplier.save(callback);
};
module.exports.getById = function(id, callback){
	Supplier.findById(id, callback);
};

//get all records
module.exports.list = function (callback){
	var query = {};
	Supplier.find(query, callback);
};
