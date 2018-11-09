"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
/*how to load an image example: https://gist.github.com/aheckmann/2408370*/
var PartSchema = mongoose.Schema({
	name         : { type: String, index:true },
	description  : { type: String },	
	category     : { type: String },	
	urls         : [{ type: String }],
	image		 : ObjectId,
	files		 : [{ObjectId}],
	stockCount   : Number,
	firstAcquired : Date,
	lastModified  : Date,
	type          : ObjectId,
	location      : ObjectId,
	manufacturer  : ObjectId,
	supplier      : ObjectId
}); 

var Part = module.exports = mongoose.model('Part', PartSchema);


module.exports.delete = function (id, callback){
	
	Part.findByIdAndRemove(id, callback);
};

module.exports.modify = function (id, newValues, callback){
	//$set
	var val = {$set: newValues};
	Part.update({_id: id}, val, callback);
};

module.exports.create = function(newPart,  callback){
        newPart.save(callback);
};
module.exports.getById = function(id, callback){
	Part.findById(id, callback);
};

//get all records
module.exports.list = function (callback){
	var query = {};
	Part.find(query, callback);
};
