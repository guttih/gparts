var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Manufacturer = require('../models/manufacturer');


var request = require('request');
var lib = require('../utils/glib');


var config = lib.getConfig();


// Register
router.get('/register', lib.authenticateAdminRequest, function(req, res){
	res.render('register-manufacturer');
});

// modify page
router.get('/register/:ID', lib.authenticatePowerUrl, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		Manufacturer.getById(id, function(err, manufacturer){
				if(err || manufacturer === null) {
					req.flash('error',	'Could not find manufacturer.' );
					res.redirect('/result');
				} else{
					var obj = {id : id,
						name: manufacturer.name,
						description: manufacturer.description,
						url: manufacturer.url,
					};
					var str = JSON.stringify(obj);
					res.render('register-manufacturer', {item:str});
				}
			});
		
	}

});

// Register Manufacturer
router.post('/register', lib.authenticateAdminRequest, function(req, res){
	var name        = req.body.name;
	var description = req.body.description;
	var url         = req.body.url;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('register-manufacturer',{
			errors:errors
		});
	} else {
		var newManufacturer = new Manufacturer({
			name: name,
			description:description,
			url: url
		});

		Manufacturer.create(newManufacturer, function(err, manufacturer){
			if(err) throw err;
			console.log(manufacturer);
			req.flash('success_msg',	'You successfully created the \"' +  newManufacturer._doc.name + '\" manufacturer.' );
			res.redirect('/manufacturers/register/'+manufacturer.id);
		});

		
	}
});

router.post('/register/:ID', lib.authenticateAdminRequest, function(req, res){
	//manufacturer modify
	var id = req.params.ID;

	req.checkBody('name', 'Name is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		res.render('register-manufacturer',{errors:errors	});
	} else {
		var values = {
				name        : req.body.name,
				description : req.body.description,
				url         : req.body.url
			};
		
		
		Manufacturer.modify(id, values, function(err, result){
			if(err || result === null || result.ok !== 1) {
					req.flash('error',	' unable to update' );
			} else{
					if (result.nModified === 0){
						req.flash('success_msg',	'Manufacturer is unchanged!' );
					} else {
						req.flash('success_msg',	'Manufacturer updated!' );
					}
			}
			res.redirect('/manufacturers/register/'+id);
		});
			
	}
});



router.get('/item/:ID', lib.authenticateRequest, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		Manufacturer.getById(id, function(err, manufacturer){
				if(err || manufacturer === null) {
					res.send('Error 404 : Not found! ');
				} else{
					res.json(manufacturer);
				}
			});
	}
});


//returns a manufacturer list page
router.get('/list', lib.authenticateUrl, function(req, res){
	res.render('list-manufacturer');
});
/*listing all parts and return them as a json array*/
router.get('/manufacturer-list', lib.authenticateRequest, function(req, res){
	Manufacturer.list(function(err, list){
		
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

router.delete('/:ID', lib.authenticateAdminRequest, function(req, res){
	var id = req.params.ID;
	Manufacturer.delete(id, function(err, result){
		if(err !== null){
			res.status(404).send('unable to delete manufacturer "' + id + '".');
		} else {
			res.status(200).send('Manufacturer deleted.');
		}
	});
	
});

module.exports = router;