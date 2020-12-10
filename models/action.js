"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

//Type can be HTTP_POST or HTTP_GET  //todo: set to enum
// 0 == HTTP_GET request
// 1 == HTTP_POST request
// 2 == HTTP_PUT request
// 3 == HTTP_PATCH request
// 4 == HTTP_DELETE request

var ActionSchema = mongoose.Schema({
	name       : { type: String, index:true },
	description: { type: String },
	type       : Number,
	path       : { type: String},
}); 

var Action = module.exports = mongoose.model('Action', ActionSchema);

module.exports.toJson = function (item) {

	var ret = {
		id			 : item.id,
		name         : item.name,
		description  : item.description,
		type         : item.type,
		path         : item.path
	};
	return ret;
};

module.exports.delete = function (id, callback){
	
	Action.findByIdAndRemove(id, callback);
};

module.exports.modify = function (id, newValues, callback){
	//$set
	var val = {$set: newValues};
	Action.update({_id: id}, val, callback);
};

module.exports.create = function(newAction,  callback){
        newAction.save(callback);
};
module.exports.getById = function(id, callback){
	Action.findById(id, callback);
};

//get all records
module.exports.list = function (callback){
	var query = {};
	Action.find(query, callback);
};
