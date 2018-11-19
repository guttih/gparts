var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Supplier = require('../models/supplier');


var request = require('request');
var lib = require('../utils/glib');


var config = lib.getConfig();


// Register
router.get('/register', lib.authenticateRequest, function(req, res){
	res.render('register-supplier');
});

// modify page
router.get('/register/:ID', lib.authenticateRequest, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		Supplier.getById(id, function(err, supplier){
				if(err || supplier === null) {
					req.flash('error',	'Could not find supplier.' );
					res.redirect('/result');
				} else{
					var obj = {id : id,
						name: supplier.name,
						description: supplier.description,
						url: supplier.url,
					};
					var str = JSON.stringify(obj);
					res.render('register-supplier', {item:str});
				}
			});
		
	}

});

//returns a supplier list page
router.get('/list', lib.authenticateUrl, function(req, res){
	res.render('list-supplier');
});

/*listing all parts and return them as a json array*/
router.get('/supplier-list', lib.authenticateRequest, function(req, res){
	Supplier.list(function(err, list){
		
		var arr = [];
		var isOwner;
		var item; 
		for(var i = 0; i < list.length; i++){
				item = list[i];

				arr.push({	id         :item._id,
							name       :item.name, 
							description:item.description,
							url        :item.url
						});
		}
		res.json(arr);
	});
});

router.get('/item/:ID', lib.authenticateRequest, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		Supplier.getById(id, function(err, supplier){
				if(err || supplier === null) {
					res.status(404).send('Not found!'); 
				} else{
					res.json(supplier);
				}
			});
	}
});

// Register Supplier
router.post('/register', lib.authenticateAdminRequest, function(req, res){
	var name        = req.body.name;
	var description = req.body.description;
	var url         = req.body.url;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('register-supplier',{
			errors:errors
		});
	} else {
		var newSupplier = new Supplier({
			name: name,
			description:description,
			url: url
		});

		Supplier.create(newSupplier, function(err, supplier){
			if(err) throw err;
			req.flash('success_msg',	'You successfully created the \"' +  newSupplier._doc.name + '\" supplier.' );
			res.redirect('/suppliers/register/'+supplier.id);
		});

		
	}
});

router.post('/register/:ID', lib.authenticateAdminRequest, function(req, res){
	//supplier modify
	var id = req.params.ID;

	req.checkBody('name', 'Name is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		res.render('register-supplier',{errors:errors	});
	} else {
		var values = {
				name        : req.body.name,
				description : req.body.description,
				url         : req.body.url
			};
		
		
		Supplier.modify(id, values, function(err, result){
			if(err || result === null || result.ok !== 1) {
					req.flash('error',	' unable to update' );
			} else{
					if (result.nModified === 0){
						req.flash('success_msg',	'Supplier is unchanged!' );
					} else {
						req.flash('success_msg',	'Supplier updated!' );
					}
			}
			res.redirect('/suppliers/register/'+id);
		});
			
	}
});


router.delete('/:ID', lib.authenticateAdminRequest, function(req, res){
	var id = req.params.ID;
	Supplier.delete(id, function(err, result){
		if(err !== null){
			res.status(404).send('unable to delete supplier "' + id + '".');
		} else {
			res.status(200).send('Supplier deleted.');
		}
	});
	
});

module.exports = router;