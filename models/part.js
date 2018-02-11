// good example about mongoose: https://www.codeproject.com/Articles/356975/A-simple-log-server-using-express-nodejs-and-mongo
//             and about types: http://mongoosejs.com/docs/schematypes.html
//             http://mongoosejs.com/docs/2.7.x/docs/schematypes.html
"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var PartSchema = mongoose.Schema({
	name       : { type: String, index:true },
	description: { type: String },	
	helpUrls   : [{ type: String }],
	partType   : Number,
	firstPurchased  : Date
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

module.exports.createPart = function(newPart,  callback){
        newPart.save(callback);
};
module.exports.getById = function(id, callback){
	Part.findById(id, callback);
};

