var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Location = require('../models/location');


var request = require('request');
var lib = require('../utils/glib');


var config = lib.getConfig();

// Register
router.get('/register', lib.authenticateUrl, function(req, res){
	res.render('register-location');
});

// modify page
router.get('/register/:ID', lib.authenticateRequest, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		Location.getById(id, function(err, location){
				if(err || location === null) {
					req.flash('error',	'Could not find location.' );
					res.redirect('/result');
				} else{
					var obj = {id : id,
						name: location.name,
						description: location.description
					};
					var str = JSON.stringify(obj);
					res.render('register-location', {item:str});
				}
			});
		
	}

});

router.get('/item/:ID', lib.authenticateRequest, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		Location.getById(id, function(err, location){
				if(err || location === null) {
					res.status(404).send('Not found!'); 
				} else{
					res.json(location);
				}
			});
	}
});

//returns a location list page
router.get('/list', lib.authenticateUrl, function(req, res){
	res.render('list-location');
});

/*listing all parts and return them as a json array*/
router.get('/location-list', lib.authenticateRequest, function(req, res){
	Location.list(function(err, list){
		
		var arr = [];
		var isOwner;
		var item; 
		for(var i = 0; i < list.length; i++){
				item = list[i];

				arr.push({	id         :item._id,
							name       :item.name, 
							description:item.description,
						});
		}
		res.json(arr);
	});
});

// Register Location
router.post('/register', lib.authenticateAdminRequest, function(req, res){
	var name = req.body.name;
	var description = req.body.description;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('register-location',{
			errors:errors
		});
	} else {
		var newLocation = new Location({
			name: name,
			description:description
		});
		
		Location.create(newLocation, function(err, location){
			if(err) throw err;
			req.flash('success_msg',	'You successfully created the \"' +  newLocation._doc.name + '\" location.' );
			res.redirect('/locations/register/' + location.id);
		});

		
			
	}
});

router.post('/register/:ID', lib.authenticateAdminRequest, function(req, res){
	//location modify
	var id = req.params.ID;

	req.checkBody('name', 'Name is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		res.render('register-location',{errors:errors	});
	} else {
		var values = {
				name     : req.body.name,
				description    : req.body.description,
			};
		
		
		Location.modify(id, values, function(err, result){
			if(err || result === null || result.ok !== 1) {
					req.flash('error',	' unable to update' );
			} else{
					if (result.nModified === 0){
						req.flash('success_msg',	'Location is unchanged!' );
					} else {
						req.flash('success_msg',	'Location updated!' );
					}
			}
			res.redirect('/locations/register/'+id);
		});
			
	}
});

router.delete('/:ID', lib.authenticateAdminRequest, function(req, res){
	var id = req.params.ID;
	Location.delete(id, function(err, result){
		if(err !== null){
			res.status(404).send('unable to delete location "' + id + '".');
		} else {
			res.status(200).send('Location deleted.');
		}
	});
	
});

module.exports = router;