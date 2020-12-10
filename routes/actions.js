var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Action = require('../models/action');


var request = require('request');
var lib = require('../utils/glib');


var config = lib.getConfig();

// Register
router.get('/register', lib.authenticateUrl, function(req, res){
	res.render('register-action');
});

// modify page
router.get('/register/:ID', lib.authenticateRequest, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		Action.getById(id, function(err, action){
				if(err || action === null) {
					req.flash('error',	'Could not find action.' );
					res.redirect('/result');
				} else{
					var obj = {id : id,
						name: action.name,
						description: action.description
					};
					var str = JSON.stringify(obj);
					res.render('register-action', {item:str});
				}
			});
		
	}

});

router.get('/item/:ID', lib.authenticateRequest, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		Action.getById(id, function(err, action){
				if(err || action === null) {
					res.status(404).send('Not found!'); 
				} else{
					res.json(action);
				}
			});
	}
});

//returns a action list page
router.get('/list', lib.authenticateUrl, function(req, res){
	res.render('list-action');
});

/*listing all parts and return them as a json array*/
router.get('/action-list', lib.authenticateRequest, function(req, res){
	Action.list(function(err, list){
		
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

// Register Action
router.post('/register', lib.authenticateAdminRequest, function(req, res){
	var name = req.body.name;
	var description = req.body.description;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('register-action',{
			errors:errors
		});
	} else {
		var newAction = new Action({
			name: name,
			description:description
		});
		
		Action.create(newAction, function(err, action){
			if(err) throw err;
			req.flash('success_msg',	'You successfully created the \"' +  newAction._doc.name + '\" action.' );
			res.redirect('/actions/register/' + action.id);
		});

		
			
	}
});

router.post('/register/:ID', lib.authenticateAdminRequest, function(req, res){
	//action modify
	var id = req.params.ID;

	req.checkBody('name', 'Name is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		res.render('register-action',{errors:errors	});
	} else {
		var values = {
				name     : req.body.name,
				description    : req.body.description,
			};
		
		
		Action.modify(id, values, function(err, result){
			if(err || result === null || result.ok !== 1) {
					req.flash('error',	' unable to update' );
			} else{
					if (result.nModified === 0){
						req.flash('success_msg',	'Action is unchanged!' );
					} else {
						req.flash('success_msg',	'Action updated!' );
					}
			}
			res.redirect('/actions/register/'+id);
		});
			
	}
});

router.delete('/:ID', lib.authenticateAdminRequest, function(req, res){
	var id = req.params.ID;
	Action.delete(id, function(err, result){
		if(err !== null){
			res.status(404).send('unable to delete action "' + id + '".');
		} else {
			res.status(200).send('Action deleted.');
		}
	});
	
});

module.exports = router;