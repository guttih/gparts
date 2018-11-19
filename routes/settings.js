var express = require('express');
var router = express.Router();
var lib = require('../utils/glib');

router.post('/allow-user-registration', lib.authenticateAdminRequest, function(req, res) {
	
	req.checkBody('allowUserRegistration', 'allowUserRegistration is missing').notEmpty();

	var errors = req.validationErrors();
	
	if(errors){
		return res.status(400).send({text:(errors.length > 0 )? errors[0].msg : "Unable to change allow user registration"});
	}


	var allowUserRegistration;

	try {
		allowUserRegistration = JSON.parse(req.body.allowUserRegistration);
	} catch(e) {
		return res.status(400).send({text:"Unable to extract value from object."});
	}
	
	//read the config file into a variable.
	var config = lib.getConfig();
	config.allowUserRegistration = allowUserRegistration;
	lib.setConfig(config);
	console.log("Ok, let's change allowUserRegistration to " + allowUserRegistration);
	res.status(200).send('Settings changed.');
});

router.post('/file-size-limit', lib.authenticateAdminRequest, function(req, res) {
	req.checkBody('fileSizeLimit', 'fileSizeLimit is missing').notEmpty();

	var errors = req.validationErrors();

	if(errors){
			return res.status(400).send({text:(errors.length > 0 )? errors[0].msg : "Unable to change file limit"}); 
	}

	var fileSizeLimit;

	try {
		fileSizeLimit = JSON.parse(req.body.fileSizeLimit);
	} catch(e) {
		return res.status(400).send({text:"Unable to extract value from object."});
	}


	//read the config file into a variable.
	var config = lib.getConfig();
	console.log("Ok, let's change fileSizeLimit to " + fileSizeLimit);
	config.fileSizeLimit = fileSizeLimit;
	lib.setConfig(config);
	res.status(200).send('Settings changed.');
});

module.exports = router;