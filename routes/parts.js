var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Part = require('../models/part');


var request = require('request');
var lib = require('../utils/glib');


var config = lib.getConfig();


// Register
router.get('/register', function(req, res){
	res.render('register');
});

router.get('/', lib.authenticateUrl, function(req, res){
	res.render('index');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Register Part
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var partname = req.body.partname;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('partname', 'Partname is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newPart = new Part({
			name: name,
			email:email,
			partname: partname,
			password: password
		});

		Part.createPart(newPart, function(err, part){
			if(err) throw err;
			console.log(part);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/parts/login');
	}
});

//todo: part change profile
router.post('/register/:partID', lib.authenticateAdminRequest, function(req, res){
	//part modify
	var id = req.params.partID;
	var password = req.body.password;

	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('partname', 'Partname is required').notEmpty();
	req.checkBody('level', 'level is required').notEmpty();
	if (password !== undefined && password.length > 0 ){
		req.checkBody('password', 'Password is required').notEmpty();
		req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	}
	var errors = req.validationErrors();

	if(errors){
		//todo: part must type all already typed values again, fix that
		res.render('register-part',{errors:errors	});
	} else {
		var values = {
				name     : req.body.name,
				email    : req.body.email,
				partname : req.body.partname,
				level : req.body.level
			};
		
		if (password !== undefined && password.length > 0 ){
			values['password'] = req.body.password;
		}
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

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/parts/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/parts/login');
});

module.exports = router;