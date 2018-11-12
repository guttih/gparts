var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Part = require('../models/part');


var request = require('request');
var lib = require('../utils/glib');


var config = lib.getConfig();


// Register
router.get('/register', lib.authenticateAdminRequest, function(req, res){
	res.render('register-part');
});

// modify page
router.get('/register/:ID', lib.authenticatePowerUrl, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		Part.getById(id, function(err, part){
				if(err || part === null) {
					req.flash('error',	'Could not find part.' );
					res.redirect('/result');
				} else{
					var obj = {id : id,
						name         : part.name,
						description  : part.description,
						category     : part.category,
						image		 : part.image,
						stockCount   : part.stockCount,
						firstAcquired: part.firstAcquired,
						lastModified : part.lastModified,
						type         : part.type,
						location     : part.location,
						manufacturer : part.manufacturer,
						supplier     : part.supplier,
						urls         : part.urls,
						files		 : part.files
					};
					var str = JSON.stringify(obj);
					res.render('register-part', {item:str});
				}
			});
		
	}

});

// Register Part
router.post('/register', lib.authenticateAdminRequest, function(req, res){

	// Validation
	req.checkBody('name'         , 'Name is required'                             ).notEmpty();
	req.checkBody('location'     , 'Location is required'                         ).notEmpty();
	req.checkBody('type'         , 'Type is required'                             ).notEmpty();
	req.checkBody('firstAcquired', 'Acquired date is required'                    ).notEmpty();
	req.checkBody('lastModified' , 'Last modified date is required'               ).notEmpty();
	req.checkBody('stockCount'   , 'Stock count is required and must be a number!').notEmpty().isNumeric();
	
	if (req.body.supplier === undefined || req.body.supplier.length < 1) {
		req.body.supplier = null;
	}
	if (req.body.manufacturer === undefined || req.body.manufacturer.length < 1) {
		req.body.manufacturer = null;
	}
	
	var errors = req.validationErrors();

	if(errors){
		res.render('register-part',{
			errors:errors
		});
	} else {
		var newPart = new Part({
			name          : req.body.name,
			description   : req.body.description,
			category      : req.body.category,
			urls          : req.body.urls,
			//image         : req.body.image,
			//files         : req.body.files,
			stockCount    : req.body.stockCount,
			firstAcquired : req.body.firstAcquired,
			lastModified  : req.body.lastModified,
			type          : req.body.type,
			location      : req.body.location,
			manufacturer  : req.body.manufacturer,
			supplier      : req.body.supplier
		});

		Part.create(newPart, function(err, part){
			if(err) throw err;
			req.flash('success_msg',	'You successfully created the \"' +  newPart._doc.name + '\" part.' );
			res.redirect('/parts/register/'+part.id);
		});

		
	}
});

router.post('/register/:ID', lib.authenticateAdminRequest, function(req, res){
	//part modify
	var id = req.params.ID;

	req.checkBody('name'         , 'Name is required'                             ).notEmpty();
	req.checkBody('location'     , 'Location is required'                         ).notEmpty();
	req.checkBody('type'         , 'Type is required'                             ).notEmpty();
	req.checkBody('firstAcquired', 'Acquired date is required'                    ).notEmpty();
	req.checkBody('lastModified' , 'Last modified date is required'               ).notEmpty();
	req.checkBody('stockCount'   , 'Stock count is required and must be a number!').notEmpty().isNumeric();
	
	if (req.body.supplier === undefined || req.body.supplier.length < 1) {
		req.body.supplier = null;
	}
	if (req.body.manufacturer === undefined || req.body.manufacturer.length < 1) {
		req.body.manufacturer = null;
	}
	if (req.body.image === undefined || req.body.image.length < 1) {
		req.body.image = null;
	}
	
	var errors = req.validationErrors();

	if(errors){
		res.render('register-part',{
			errors:errors
		});
	} else {
		var values = {
			name          : req.body.name,
			description   : req.body.description,
			category      : req.body.category,
			urls          : req.body.urls,
			image         : req.body.image,
			//files         : req.body.files,
			stockCount    : req.body.stockCount,
			firstAcquired : req.body.firstAcquired,
			lastModified  : req.body.lastModified,
			type          : req.body.type,
			location      : req.body.location,
			manufacturer  : req.body.manufacturer,
			supplier      : req.body.supplier
		};
		
		
		Part.modify(id, values, function(err, result){
			if(err || result === null || result.ok !== 1) {
					req.flash('error',	' unable to update' );
			} else{
					if (result.nModified === 0){
						req.flash('success_msg',	'Part is unchanged!' );
					} else {
						req.flash('success_msg',	'Part updated!' );
					}
			}
			res.redirect('/parts/register/'+id);
		});
			
	}
});



router.get('/item/:ID', lib.authenticateRequest, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		Part.getById(id, function(err, part){
				if(err || part === null) {
					res.status(404).send('Not found!'); 
				} else{
					
					res.json(part);
				}
			});
	}
});


//returns a part list page
router.get('/list', lib.authenticateUrl, function(req, res){
	res.render('list-part');
});
/*listing all parts and return them as a json array*/
router.get('/part-list', lib.authenticateRequest, function(req, res){
	Part.list(function(err, list){
		
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
	Part.delete(id, function(err, result){
		if(err !== null){
			res.status(404).send('unable to delete part "' + id + '".');
		} else {
			res.status(200).send('Part deleted.');
		}
	});
	
});

module.exports = router;