const storageFolderFile = './public/files';
const storageFolderImage = './public/files/images';

var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var File = require('../models/file');
var Part = require('../models/part');


var request = require('request');
var lib       = require('../utils/glib');
var validator = require('../utils/validator');
const fs = require('fs');

var multer  = require('multer');
var storageFile = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, storageFolderFile)
	},
	filename: function (req, file, cb) {
		var name        = req.body.name;
		var description = req.body.description;
		var filename    = storageFolderFile + '/' + file.originalname;
		
		var newFile = new File({
			name: name,
			description:description,
			fileName: filename
		});

		File.create(newFile, function(err, file){
		
			if(err) throw err;
			
			var fileNameOnDisk = File.getFileNameOnDisk(file);
			req.body.fileObjectId = file.id;
			cb(null, fileNameOnDisk);
		}); 
	}
  });

  var storageImage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, storageFolderImage)
	},
	filename: function (req, file, cb) {
		var name        = req.body.name;
		var description = req.body.description;
		var filename    = storageFolderImage + '/' + file.originalname;
		
		var newFile = new File({
			name: name,
			description:description,
			fileName: filename
		});

		File.create(newFile, function(err, file){
		
			if(err) throw err;
			
			var fileNameOnDisk = File.getFileNameOnDisk(file);
			req.body.fileObjectId = file.id;
			cb(null, fileNameOnDisk);
		}); 
	}
  });


 var uploadFile  = multer({ storage: storageFile,   limits: { fileSize: 3000000 } }).single('file');
 var uploadImage = multer({ storage: storageImage , limits: { fileSize: 3000000 } }).single('image');

var config = lib.getConfig();


// Register
router.get('/register', lib.authenticateAdminRequest, function(req, res){
	res.render('register-file');
});
router.get('/register/image', lib.authenticateAdminRequest, function(req, res){
	res.render('register-image');
});

// modify page
router.get('/register/:ID', lib.authenticatePowerUrl, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		File.getById(id, function(err, file){
				if(err || file === null) {
					req.flash('error',	'Could not find file.' );
					res.render('register-file');
				} else{
					var obj = {id : id,
						name: file.name,
						description: file.description,
						fileName: file.fileName,
						src: File.getFullFileNameOnDisk(file).replace('./public', '')
					};
					var str = JSON.stringify(obj);
					res.render('register-file', {item:str});
				}
		});
	}

});

router.get('/register/image/:ID', lib.authenticatePowerUrl, function(req, res){
	var id = req.params.ID;
	if (id !== undefined){
		File.getById(id, function(err, file){
				if(err || file === null) {
					req.flash('error',	'Could not find file.' );
					res.render('register-file');
				} else{
					var obj = {id : id,
						name: file.name,
						description: file.description,
						fileName: file.fileName,
						src: File.getFullFileNameOnDisk(file).replace('./public', '')
					};
					var str = JSON.stringify(obj);
					res.render('register-image', {item:str});
				}
		});
	}

});

router.post('/register', lib.authenticateAdminRequest, function (req, res, next) {
		// req.file is the `avatar` file
		// req.body will hold the text fields, if there were any
		
			uploadFile(req, res, function (err) {
				if (err) {
				// An error occurred when uploading
				console.log(err);
				return
				}
				var name  = req.body.name;
				var id    = req.body.fileObjectId;
				var ownerId = req.user._id;
				if (req.body.partId !== undefined) {
					ownerId = req.body.partId;
				}
			
				req.checkBody('fileObjectId', 'A file to upload, must be selected.').notEmpty();
				req.checkBody('name', 'Name is required').notEmpty();
				var errors = req.validationErrors();
				
				if(errors){
					res.render('register-file',{ errors:errors 	});
				} else {
					req.flash('success_msg',	'File uploaded and created!' );
					File.addOwner(id, ownerId, function(err, item){
						res.redirect('/files/register/'+id);
					});
					
					
				}
			});
		
});

router.post('/register/image', lib.authenticateAdminRequest, function (req, res, next) {
	// req.file is the `avatar` file
	// req.body will hold the text fields, if there were any
	
		uploadImage(req, res, function (err) {
			if (err) {
				// An error occurred when uploading
				console.log(err);
				return;
			}
			var name    = req.body.name;
			var id      = req.body.fileObjectId;
			var ownerId = req.user._id;
			if (req.body.partId !== undefined) {
				ownerId = req.body.partId;
			}
		
			req.checkBody('fileObjectId', 'A image to upload, must be selected.').notEmpty();
			req.checkBody('name', 'Name is required').notEmpty();
			var errors = req.validationErrors();
			
			if(errors){
				res.render('register-image',{ errors:errors 	});
			} else {
				req.flash('success_msg',	'File uploaded and created!' );
				File.addOwner(id, ownerId, function(err, item){
					res.redirect('/files/register/image/'+id);
				});
				
				
			}
		});
	
});
router.post('/register/part/image', lib.authenticateAdminRequest, function (req, res, next) {
	// req.file is the `avatar` file
	// req.body will hold the text fields, if there were any
	
		uploadImage(req, res, function (err) {
			if (err) {
				// An error occurred when uploading
				console.log(err);
				return;
			}
			var name    = req.body.name;
			var id      = req.body.fileObjectId;
			var ownerId = req.user._id;
			if (req.body.partId !== undefined) {
				ownerId = req.body.partId;
			}
		
			req.checkBody('fileObjectId', 'A image to upload, must be selected.').notEmpty();
			req.checkBody('name', 'Name is required').notEmpty();
			var errors = req.validationErrors();
			
			if(errors){
				res.render('register-image',{ errors:errors 	});
			} else {
				req.flash('success_msg',	'File uploaded and created!' );
				File.addOwner(id, ownerId, function(err, item){
					if (err !== null) 	{ 	res.statusCode = 404;
											var obj = {text:'Error 404: Could not add owner!'};
											return res.json(obj); 
										  }
					//Fyrst við ödduðum owner þá þurfum við að adda myndinni í partinn
					if (ownerId !== req.user._id){
						Part.modify(ownerId, {image:id},function(err, res) {
							console.log('added image:' + id + ' to part ' + ownerId);
						});
					}
					File.getById(id, function(err, item){
						if (err !== null)	{ 	res.statusCode = 404;
												var obj = {text:'Error 404: Image not found!'};
												return res.json(obj); 
											}
						return res.json(item);
					});
					
				});
				
				
			}
		});
	
});

router.post('/register/image/:ID', lib.authenticateAdminRequest, function(req, res){
	//file modify
	var id = req.params.ID;

	req.checkBody('name', 'Name is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		res.render('register-file',{errors:errors	});
	} else {
		var values = {
				name        : req.body.name,
				description : req.body.description
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
			res.redirect('/files/register/image/'+id);
		});
			
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
				description : req.body.description
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

router.post('/register/image/:ID', lib.authenticateAdminRequest, function(req, res){
	//file modify
	var id = req.params.ID;

	req.checkBody('name', 'Name is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		res.render('register-image',{errors:errors	});
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

router.get('/list/image', lib.authenticateUrl, function(req, res){
	res.render('list-image');
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
/*listing all parts which have the same path as storageFolderImage path and return them as a json array*/
router.get('/image-list', lib.authenticateRequest, function(req, res){
	File.listByPath(storageFolderImage, function(err, list){
		
		var arr = [];
		var isOwner;
		var item; 
		for(var i = 0; i < list.length; i++){
				item = list[i];

				arr.push({	id         :item._id,
							name       :item.name, 
							description:item.description,
							src: File.getFullFileNameOnDisk(item).replace('./public', '')
						});
		}
		res.json(arr);
	});
});

router.delete('/:ID', lib.authenticateAdminRequest, function(req, res){
	var id = req.params.ID;
	if (id !== undefined) {
		File.getById(id, function(err, file) {
			if(err || file === null) {
				req.flash('error',	'Could not find file.' );
				res.render('list-file');
			} else {			
				File.deleteIfOwner(id, req.user._id, function(err, result){
					if(err !== null) {
						if (err.status !== undefined && err.status === 409) {
							res.status(200).send('Part no longer owner of this image.');
						} else {
							res.status(404).send('unable to delete file "' + id + '".');
						}
					} else {
						var fileName = File.getFullFileNameOnDisk(file);
						if (validator.fileExists(fileName)) {
							//The file exists so lets delete it
							fs.unlink(fileName, (err) => {
								if (err) {
									res.status(404).send('unable to delete the file "' + fileName + '" from disk.');
								} else {
									res.status(200).send('File and file on disk deleted.');                               
								}
						});
						} else {
							res.status(200).send('File deleted.');
						}
					}
				});
			}
		});
	}
	
});
router.delete('/part/:pardID/:ID', lib.authenticateAdminRequest, function(req, res){
	var id = req.params.ID;
	var partId = req.params.pardID;
	if (id !== undefined) {
		File.getById(id, function(err, file) {
			if(err || file === null) {
				req.flash('error',	'Could not find file.' );
				res.render('list-file');
			} else {
				File.deleteIfOwner(id, partId, function(err, result) {
					if(err !== null) {
						if (err.status !== undefined && err.status === 409) {
							res.status(200).send('Part no longer owner of this image.');
						} else {
							res.status(404).send('unable to delete file "' + id + '".');
						}
					} else {  //file was deleted, so let's remove it from disk
						var fileName = File.getFullFileNameOnDisk(file);
						if (validator.fileExists(fileName)) {
							//The file exists so lets delete it
							fs.unlink(fileName, (err) => {
								if (err) {
									res.status(404).send('unable to delete the file "' + fileName + '" from disk.');
								} else {
									res.status(200).send('File and file on disk deleted.');                               
								}
						});
						} else {
							res.status(200).send('File deleted.');
						}
					}
				});
			}
		});
	}
	
});

module.exports = router;