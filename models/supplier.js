// good example about mongoose: https://www.codeproject.com/Articles/356975/A-simple-log-server-using-express-nodejs-and-mongo
//             and about types: http://mongoosejs.com/docs/schematypes.html
//             http://mongoosejs.com/docs/2.7.x/docs/schematypes.html
"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var SupplierSchema = mongoose.Schema({
	name       : { type: String, index:true },
	description: { type: String },	
	url        : [{ type: String }]
}); 

var Supplier = module.exports = mongoose.model('Supplier', SupplierSchema);


module.exports.delete = function (id, callback){
	
	Supplier.findByIdAndRemove(id, callback);
};

module.exports.modify = function (id, newValues, callback){
	//$set
	var val = {$set: newValues};
	Supplier.update({_id: id}, val, callback);
};

module.exports.createSupplier = function(newSupplier,  callback){
        newSupplier.save(callback);
};
module.exports.getById = function(id, callback){
	Supplier.findById(id, callback);
};

