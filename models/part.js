"use strict";
var mongoose = require('mongoose');
var File = require('./file');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
/*how to load an image example: https://gist.github.com/aheckmann/2408370*/
var PartSchema = mongoose.Schema({
	name         : { type: String, index:true },
	description  : { type: String },	
	category     : { type: String },	
	urls         : { type: String },
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

module.exports.addFile = function (id, newFileId, callback){
	var query = {	_id: id	};

	if (newFileId === undefined ) {
		return callback(errorToUser("File id is missing", 400)); 
	} 

	Part.findOne(query, function(err, item){
		if (err) {
			return callback(err); 
		}

		if(item.files === undefined || item.files === null) {
			item.files = [];
		}
		item.files.push(newFileId);

		item.save(callback);
	});
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

module.exports.PartToSendObject = function (item, callback) {

		var ret = {
			id			 : item.id,
			name         : item.name,
			description  : item.description,
			category     : item.category,	
			urls         : item.urls,
			files		 : [],
			stockCount   : item.stockCount,
			firstAcquired: item.firstAcquired,
			lastModified : item.lastModified,
			type         :(item.type        !== undefined && item.type        !== null)? item.type.toString()        : null,
			location     :(item.location    !== undefined && item.location    !== null)? item.location.toString()    : null,
			manufacturer :(item.manufacturer!== undefined && item.manufacturer!== null)? item.manufacturer.toString(): null,
			supplier     :(item.supplier    !== undefined && item.supplier    !== null)? item.supplier.toString()    : null,
			image		 :(item.image       !== undefined && item.image       !== null)? item.image.toString()       : null

		};
		File.listByOwnerId(item.id, function(err, fileList) {
			if (err) { callback(err);return;}
			for(var index in fileList) {
				var file = fileList[index];
				var fItem = {
					id:file.id,
					name:file.name,
					description:file.description,
					fileName:file.fileName,
					
				}
				var owners = [];
				if (file.owners !== undefined && file.owners !== null){
					for(var i = 0; i<file.owners.length; i++){
						owners.push(file.owners[i].id.toString());
					}
				}
				
				ret.files.push({	id:file.id,
									name:file.name,
									description:file.description,
									fileName:file.fileName,
									owners: owners
								}
				);
			}
			callback(err, ret);
		});
};


module.exports.getSendObject = function (partId, callback) {
	Part.getById(partId,function(err, item){
		if (err) { callback(err);	return; }
		Part.PartToSendObject(item, callback);
	});
};

function errorToUser(msg, statusCode){
	var obj = {
		messageToUser : msg
	};
	if (statusCode !== undefined){
		obj["statusCode"] = statusCode;
	}
	return obj;
}
