var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var File = require('../models/file');


var request = require('request');
var lib = require('../utils/glib');


var config = lib.getConfig();


// Register
router.get('/register', lib.authenticateAdminRequest, function(req, res){
	res.render('register-file');
});

// modify page
router.get('/register/:ID', lib.authenticatePowerUrl, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		File.getById(id, function(err, file){
				if(err || file === null) {
					req.flash('error',	'Could not find file.' );
					res.redirect('/result');
				} else{
					var obj = {id : id,
						name: file.name,
						description: file.description,
						url: file.url,
					};
					var str = JSON.stringify(obj);
					res.render('register-file', {item:str});
				}
			});
		
	}

});

// Register File
router.post('/register', lib.authenticateAdminRequest, function(req, res){
	var name        = req.body.name;
	var description = req.body.description;
	var url         = req.body.url;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newFile = new File({
			name: name,
			description:description,
			url: url
		});

		File.create(newFile, function(err, file){
			if(err) throw err;
			console.log(file);
		});

		req.flash('success_msg',	'You successfully created the \"' +  newFile._doc.name + '\" file.' );
			res.redirect('/files/list');
	}
});

router.post('/register/:ID', lib.authenticateAdminRequest, function(req, res){
	//file modify
	var id = req.params.ID;

	req.checkBody('name', 'Name is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		res.render('register-file',{errors:errors	});
	} else {
		var values = {
				name        : req.body.name,
				description : req.body.description,
				url         : req.body.url
			};
		
		
		File.modify(id, values, function(err, result){
			if(err || result === null || result.ok !== 1) {
					req.flash('error',	' unable to update' );
			} else{
					if (result.nModified === 0){
						req.flash('success_msg',	'File is unchanged!' );
					} else {
						req.flash('success_msg',	'File updated!' );
					}
			}
			res.redirect('/files/register/'+id);
		});
			
	}
});



router.get('/item/:ID', lib.authenticateRequest, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		File.getById(id, function(err, file){
				if(err || file === null) {
					res.send('Error 404 : Not found! ');
				} else{
					res.json(file);
				}
			});
	}
});


//returns a file list page
router.get('/list', lib.authenticateUrl, function(req, res){
	res.render('list-file');
});
/*listing all parts and return them as a json array*/
router.get('/file-list', lib.authenticateRequest, function(req, res){
	File.list(function(err, list){
		
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
	File.delete(id, function(err, result){
		if(err !== null){
			res.status(404).send('unable to delete file "' + id + '".');
		} else {
			res.status(200).send('File deleted.');
		}
	});
	
});

module.exports = router;