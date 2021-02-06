"use strict";
var mongoose = require('mongoose');
var Action = require('./action');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var LocationSchema = mongoose.Schema({
	name       : { type: String, index:true },
	description: { type: String },
	data       : { type: String },
	action     : ObjectId,
}); 

var Location = module.exports = mongoose.model('Location', LocationSchema);

module.exports.copyValues = function (item, includeId = true) {

	var ret = {
		name         : item.name,
		description  : item.description,
		data         : item.data,
		action       : item.action
	};
	if (includeId) {
		ret.id = item.id;
	}

	return ret;
};

module.exports.toJson = function (item) {
	return module.exports.copyValues(item);
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

module.exports.createPromise = function(location) {
	return new Promise((resolve, reject) => {
		location.save(location, (err, res) => {
			if (err || !res) {reject(err)}
			else resolve(res)
		})
	})
};


module.exports.getById = function(id, callback){
	Location.findById(id, callback);
};

module.exports.getByIdPromise = function(id) {
	return new Promise((resolve, reject) => {
		Location.findById(id, (err, res) => {
			if (err || !res) {reject(err)}
			else resolve(res)
		})
	})
};

module.exports.getActionUrlByLocationId = function(id, callback){
	Location.findById(id, function(err, location){
		if(err || location === null) {
			callback(err, location);
		} else {
			
			Action.findById(location.action, function(err, action) {
				if(err || action === null) {
					callback(err, location);
				} else {
					callback(err, Action.makeActionUrl(action.url, location.data));
				}
			});
		}
	});
};

//get all records
module.exports.list = function (callback){
	var query = {};
	Location.find(query, callback);
};
module.exports.createObjectId = () => {return new mongoose.mongo.ObjectId()};