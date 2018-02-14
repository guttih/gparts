var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Supplier = require('../models/supplier');


var request = require('request');
var lib = require('../utils/glib');


var config = lib.getConfig();


// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Register Supplier
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var suppliername = req.body.suppliername;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('suppliername', 'Suppliername is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newSupplier = new Supplier({
			name: name,
			email:email,
			suppliername: suppliername,
			password: password
		});

		Supplier.createSupplier(newSupplier, function(err, supplier){
			if(err) throw err;
			console.log(supplier);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/suppliers/login');
	}
});

//todo: supplier change profile
router.post('/register/:supplierID', lib.authenticateAdminRequest, function(req, res){
	//supplier modify
	var id = req.params.supplierID;
	var password = req.body.password;

	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('suppliername', 'Suppliername is required').notEmpty();
	req.checkBody('level', 'level is required').notEmpty();
	if (password !== undefined && password.length > 0 ){
		req.checkBody('password', 'Password is required').notEmpty();
		req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	}
	var errors = req.validationErrors();

	if(errors){
		//todo: supplier must type all already typed values again, fix that
		res.render('register-supplier',{errors:errors	});
	} else {
		var values = {
				name     : req.body.name,
				email    : req.body.email,
				suppliername : req.body.suppliername,
				level : req.body.level
			};
		
		if (password !== undefined && password.length > 0 ){
			values['password'] = req.body.password;
		}
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

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/suppliers/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/suppliers/login');
});

module.exports = router;