"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TypeSchema = mongoose.Schema({
	name       : { type: String, index:true },
	description: { type: String }
}); 

var Type = module.exports = mongoose.model('Type', TypeSchema);


module.exports.toJson = function (item) {

	var ret = {
		id			 : item.id,
		name         : item.name,
		description	 : item.description
	};
	return ret;
};


module.exports.delete = function (id, callback){
	
	Type.findByIdAndRemove(id, callback);
};

module.exports.modify = function (id, newValues, callback){
	//$set
	var val = {$set: newValues};
	Type.update({_id: id}, val, callback);
};

module.exports.create = function(newType,  callback){
        newType.save(callback);
};
module.exports.getById = function(id, callback){
	Type.findById(id, callback);
};

//get all records
module.exports.list = function (callback){
	var query = {};
	Type.find(query, callback);
};

module.exports.query = function (query, callback){
	Part.find(query, callback);
};



