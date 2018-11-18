
var tempValues = {
					urls  : [],
					files : []
				};

var selectedFile = {};
function setFormValues(fetchPartImage) {
	if (typeof item !== 'undefined' && item !== 'undefined') {
		Object.keys(item).forEach(function(key) {
			var val = item[key];
			if (val !== undefined && val !== null) {

				switch(key) {
					case  'firstAcquired' :
					case  'lastModified'  : 	val = val.substr(0,10); 
												break;

					case  'urls'          :	 	try {
													tempValues[key] = JSON.parse(val);
												} catch {
													tempValues[key] = [];
												}
												break;

					default: 
					
				}

				
				var $elm = $('#register-form [name="'+key+'"]');
				if ($elm.length > 0 ) {
					$elm.val( val );
				}
			}
		  });
		if (item.setFormValuesCount === undefined && item.id !== undefined) {
			item.setFormValuesCount = 1;
			var action = document.getElementById('register-form').action;
			document.getElementById('register-form').action = action+='/'+item.id;
		} else {
			item.setFormValuesCount++;
		}
		
	} else {
		setLastModifiedDate();
	}
	if (fetchPartImage !== undefined && fetchPartImage === true) {
		var $elm = $('#register-form [name="image"]');
		var imageId = $elm.val();
		if (imageId.length > 0) {
			requestData('/files/item/'+imageId, function(data){
				showPartImage(data);
			},function(data){
				$elm.text("Unable to get part image.").removeClass("alert-warning").addClass("alert-danger");
			});
		}
	}
}

function setSelectOptionsFromArray(id, list){

	var select = 	$("#"+id);
	var selected = select.find('option:selected');
	var required = select.attr('required') === 'required';
	select.find('option').remove();
	
	//add the first option
	var opt = new Option('No ' + id + ' selected', '');
	if (required === true) { 
		opt.setAttribute("title", 'you must add a new ' + id + ' to be able to add parts');
	} else { 
		opt.setAttribute("title", 'you are not required to select a ' + id);
	}
	opt.setAttribute("data-toggle", "tooltip"); 
	select.append(opt);

	// add all options in the database
	list.forEach(element => {
		var opt = new Option(element.name, element.id);
		opt.setAttribute("data-toggle", "tooltip");
		opt.setAttribute("title", element.description);
		select.append(opt);
	});
	setFormValues();
}

function partSelect(obj) {
	//get parent element
	var $elm = $(obj.parentNode.parentNode.parentNode.parentNode);
	var select = $elm.find('select');
	return select;
}
function refreshPartSelect(obj) {
	var select = partSelect(obj);
	//Get the selected item
	var selectedOption = select.val();
	var id = select.attr('id');
	//refresh the select
	getList( function(list) { 
		setSelectOptionsFromArray(id,     list ); 
		//Set the selected item again
		if (selectedOption === undefined || selectedOption === null || selectedOption === '') {
			select.val($('#'+id+' option:first').val());
		} else {
			var optionExists = (select.find('option[value="' + selectedOption + '"]').length > 0 );
			if (optionExists === true) {
				select.val(selectedOption);
			} else {
				select.val($('#'+id+' option:first').val());
			}
		}
		select.focus();
	}, '/' + id + 's/' + id + '-list');
}


function registerPartSelect(obj) {
	var select = partSelect(obj);
	var id = select.attr('id');
	var url = '/'+id+'s/register';
	openUrlInNewTab(url);
}
function editPartSelect(obj) {
	var select = partSelect(obj);
	var id = select.attr('id');
	var selectedOption = select.val();
	var url = '/' + id + 's/register/' + selectedOption;
	openUrlInNewTab(url);
}

function setLastModifiedDate(){
	var now = new Date();
	var str = now.getFullYear()+ '-' + leadingZeros(now.getMonth()+1 ,2) + '-' +leadingZeros(now.getDate(),2);
	$('#lastModified').val(str);
}


function showPartModalErrorText(lowercase_property_name, message){
	var capitalized = lowercase_property_name.charAt(0).toUpperCase() + lowercase_property_name.slice(1);
	var msg = 'You must provide a "' + lowercase_property_name + '" for this part.';
	if (message !== undefined) {
		msg = message;
	}

	showModalErrorText(capitalized + ' is missing', msg);
	return false;
}

//use this function to validate the form values
function validateFormValues(){
	
	var prop = $('#name').val();
	if (prop === undefined || prop.length < 1) {
		return showPartModalErrorText('name');
	}

	prop = $('#firstAcquired').val();
	if (prop === undefined || prop.length < 1) {
		return showPartModalErrorText('acquired date', 'You must specify the date when you acquired this part.');
	}

	prop = $('#stockCount').val();
	if (prop === undefined || prop.length < 1) {
		return showPartModalErrorText('stock count');
		return false;
	}
	

	//search if all required selects contain a value
	var selectErrorFound = false;
	$('.part-form select').each( function( index ) {
		var $elm = $( this );
		var required = $elm.attr('required') === 'required';
		if (required === true) {
			var value = $elm.val();
			if (value === undefined ||value === null || value == '') {
				var id = $elm.attr('id');
				var capitalizeId = id.charAt(0).toUpperCase() + id.slice(1);
				showModalErrorText(capitalizeId + ' is missing', 'You must select a "' + id + '" for this part.');
				selectErrorFound = true;
				return false;
			}
		}
	  });

	if (selectErrorFound === true) {
		return false;
	}

	setLastModifiedDate();

	return true;
}

function initParts() {
	setFormValues(true);
	getList( function(list) { setSelectOptionsFromArray("type",         list );	}, '/types/type-list');
	getList( function(list) { setSelectOptionsFromArray("location",     list ); }, '/locations/location-list');
	getList( function(list) { setSelectOptionsFromArray("manufacturer", list ); }, '/manufacturers/manufacturer-list');
	getList( function(list) { setSelectOptionsFromArray("supplier",     list ); }, '/suppliers/supplier-list');
	if (typeof item === 'undefined' ||  item === 'undefined') {
		// hide
			$('.part-form .name-description').attr("class", ".name-description")
			$('#part-image-container').hide();
			$('.files-and-urls').addClass('hidden');
	}
	filesToView();
}

function validateNormalInput(id) {
	var $elm = $("#"+id);
	var val = $elm.val();
	return (val !== undefined && val.length > 0);
	
}

function validatePartImageOrFile(inputId) {
	var input = document.getElementById(inputId);
	var URL = window.URL || window.webkitURL;
	if (!input || input === undefined || input.files === undefined) {
		//there is no file input field we are in edit mode
		return true;
	}
	var formId = input.form.id;
    var file = input.files[0];
	var enableButton = false;
    /*if (file && file.type !== undefined && file.type.length > 0) {
		var arr = ['image/jpeg', 'image/svg+xml', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
		enableButton = (arr.indexOf(file.type) > -1);
	}*/
	if (file && file.name){
		$('#'+formId+' input.fileName').val(file.name);
	}
	
	enableButton = (file && file.type !== undefined && validateNormalInput(input.id+'-name'));
	if (enableButton && input.id === 'image') {
		enableButton=(file.type.indexOf('image') > -1);
	}

	if (enableButton) {
		var reader = new FileReader();
            reader.onload = function (e) {
				var $elm = $('#'+formId+' .image-container');
				if ($elm.length > 0 ) {
					$elm.css('display', 'unset');
					$elm.find('img').attr('src', e.target.result);
				}
			}
			reader.readAsDataURL(input.files[0]);
	} else {
		$('#'+formId+' .image-container').css('display', 'none');
	}

	$('.part-additional-values .save-button').prop("disabled", !enableButton);

	return enableButton;
}

function extractFileNameFromObject(data){
	var id = data._id !== undefined? data._id : data.id;
	var ending = data.fileName.substr(data.fileName.lastIndexOf('.'));
	return id + ending;
}

function showPartImage(data) {
	var fileName = '/files/images/' + extractFileNameFromObject(data);
	$('#part-image-container img').attr('src', fileName);
	
}

function setNewPartFile(dataResponseStr, formId){
	var data;
	try {
        data = JSON.parse(dataResponseStr);
    } catch(e) {
		console.log("error in object returned from part image ");
		console.error(e);
		return;
	}
	var $inputPartId = $('#'+formId+' [name="partId"]');
	//todo: select by formid and then attribute name="partId"
	var id = data._id !== undefined? data._id : data.id;
	$inputPartId.val(id);
	$('.part-additional-values' ).addClass('hidden');$('#part-values' ).removeClass("hidden");
	$('#imageId').val(id);
	if (formId==='register-image') {
		showPartImage(data);
	} else {
		item = data;
		setFormValues();
		filesToView();
	}
}

function submitFormInBackground(formId) {
	var $part = $('#'+formId+' [name="partId"]');
	$part.val(item.id);
	var form = document.getElementById(formId);
	var action      = form.action;
	var formData = new FormData(form);
	$.ajax({
		url: action, 
		dataType: 'text',  
		cache: false,
		contentType: false,
		processData: false,
		data: formData,                         
		type: 'post',
		success: function(data){
			console.log('new image success');
			setNewPartFile(data, formId);
		}, 
		error: function(data){
			showModalErrorMsg("Unable to save file", data);
			console.log(data);
		}, 
	});
}

function showImageCommands(bShowImageCommands) {
	
	if (!bShowImageCommands) {
		$('#part-image-container .commands.item').addClass('hidden');
	} else {
		//Do not show view and delete if default image
		var image = $('#register-form [name="image"]').val();
		var bDeaultImage = (image !== undefined && image.length < 1);
		if (bDeaultImage) {
			$('#part-image-container .list-command-view').addClass('hidden');
			$('#part-image-container .list-command-delete').addClass('hidden');
		} else {
			$('#part-image-container .list-command-view').removeClass('hidden');
			$('#part-image-container .list-command-delete').removeClass('hidden');
		}
		$('#part-image-container .commands.item').removeClass('hidden');
	}
}

function setupImageFunctionsAndButtons() {
	$('#part-image-container .list-command-view').bind('click tap',function(){
		var src= $('.part-form .image-container img').attr('src');
		openUrlInNewTab(src);
	});
	$('#part-image-container .list-command-edit').bind('click tap',function(){
		$('#part-values').addClass("hidden");$('#image-values').removeClass('hidden');
	});
	$('#part-image-container .list-command-delete').bind('click tap',function(){
		var image = $('#register-form [name="image"]').val();
		var partId = item.id;
		if (  (image !== undefined && image.length > 0) &&
			  (partId !== undefined && partId.length > 0)     ){
			deleteItem('files/part/'+partId, image, function(data){
				//Now, when we have deleted the image, let's remove it from the form and view
				$('#register-form [name="image"]').val("");
				$('#part-image-container img').attr('src', '/images/part-image.jpg');
			});
		} else {
			showModalErrorText("Image not found for this part", "No image is selected.");
		}
	});
	$('#part-image-container').mouseover(function(){
		showImageCommands(true);
	});
	$('#part-image-container').mouseout(function(){
		showImageCommands(false);
	});
	
	$("#image-name").bind('keyup change cut paste',function(){
		//when name of image is changed
		validatePartImageOrFile('image');
	});

	$("#file-name").bind('keyup change cut paste',function(){
		//todo: select by formId and then attribute name
		validatePartImageOrFile('file');
	});

	$('.part-additional-values > button.cancel-button').click(function() {
		$('.part-additional-values' ).addClass('hidden');$('#part-values' ).removeClass("hidden");
	});

	

	showImageCommands(false);
}

function setupUrlCommands(){

	// View button for url item
	$('#urls td.commands .list-command-view.btn').unbind();
	$('#urls td.commands .list-command-view.btn').bind('click tap',function(){
		$elm = $(this).parent().parent();
		//var elmData = $elm.data("elm");
		var url = $elm.data("elm").url;
		openUrlInNewTab(url);
		
	});

	// Edit button for url item
	$('#urls td.commands .list-command-edit.btn').unbind();
	$('#urls td.commands .list-command-edit.btn').bind('click tap',function() {
		$elm = $(this).parent().parent();
		var index = new Number($elm.attr("data-index"));
		var urlObject = tempValues.urls[index];
		showModalInputTwo("Adding a Url",  "Name", "Url",
						   urlObject.name, urlObject.url,             "Add",
							function(name, url) {
													if (name.length > 0 && url.length > 0) {
														if (url.indexOf('www.') === 0) {
															url = 'http://' + url;
														}
														tempValues.urls.splice(index, 1, {name:name, url:url});
													}
													urlsToView();
							}
		);
		
	});

	// View button for url item
	$('#urls td.commands .list-command-delete.btn').unbind();
	$('#urls td.commands .list-command-delete.btn').bind('click tap',function() {
		$elm = $(this).parent().parent();
		var index = new Number($elm.attr("data-index"));
		tempValues.urls.splice(index, 1);
		urlsToView();
	});
}
function setupFileCommands(){

	// View button for url item
	$('#files td.commands .list-command-view.btn').unbind();
	$('#files td.commands .list-command-view.btn').bind('click tap',function() {
		$elm = $(this).parent().parent();
		//var elmData = $elm.data("elm");
		var fileName = extractFileNameFromObject($elm.data("elm"));
		openUrlInNewTab('/files/'+fileName);
		
	});

	// Edit button for url item
	$('#files td.commands .list-command-edit.btn').unbind();
	$('#files td.commands .list-command-edit.btn').bind('click tap',function() {
		$elm = $(this).parent().parent();
		$('#part-values').addClass("hidden");$('#file-values').removeClass('hidden');
		setFileFormValues($elm.data("elm"));
	});

	// View button for url item
	$('#files td.commands .list-command-delete.btn').unbind();
	$('#files td.commands .list-command-delete.btn').bind('click tap',function() {
		$elm = $(this).parent().parent();
		//var elmData = $elm.data("elm");
		var xdata = $elm.data("elm");

		var url = SERVER+'/files/part/'+item.id+'/'+xdata.id;
				var request = $.delete(url);
				request.done(function( data ) {
					console.log("Deleted file "+data.name);
					console.log(data);
					var iFound = -1;
					for(var i = 0; i < item.files.length; i++) {
						if (xdata.id == item.files[i].id) {
							iFound = i;
							break;
						}
					}
					if (iFound > -1) {
						item.files.splice(iFound, 1);
						filesToView();
					}
					
					
				}).fail(function( data ) {
					if (data.status===401){
						showModal("You need to be logged in!", data.responseText);
					}
				});
		
	});
}

function urlsToView() {
	var $table = $('#urls');
	$table.empty();
	
	tempValues.urls.forEach(function(element, index) {
		$table.append("<tr data-index='"+index+"' data-elm='"+JSON.stringify(element)+"'><td>"+element.name+"</td></tr>");
	});
	
	rowButtons.initItems();
	setupUrlCommands();
	var strUrls = JSON.stringify(tempValues.urls);
	$('#register-form [name="urls"]').val(strUrls);
}

function filesToView() {
	var $table = $('#files');
	$table.empty();

	if (item === undefined || item.files === undefined || item.files.length < 1) {
		return;
	}
/*	
	if (item !== undefined && item.files !== undefined && item.files.length > 0) {
		for(var index in item.files) {
			console.log(item.files[index]);
		}
	}

	
}*/



	item.files.forEach(function(element, index) {
		$table.append("<tr data-index='"+index+"' data-elm='"+JSON.stringify(element)+"'><td>"+element.name+"</td></tr>");
	});
	
	rowButtons.initItems();
	setupFileCommands();
	var strUrls = JSON.stringify(tempValues.urls);
	$('#register-form [name="urls"]').val(strUrls);
}

function setFileFormValues(values) {
	var formId = 'register-file';
	$('#'+formId).trigger("reset");
	var $form = $('#'+formId);
	$form.find('.file-input-gruppan').removeClass('hidden');
	if (values !== undefined && values) {
		console.log(values);
		
		var $form = $('#'+formId);
		$form.find('[name="fileId"]').val(values.id);
		$form.find('[name="name"]').val(values.name);
		$form.find('[name="partId"]').val(item.id);
		$form.find('[name="description"]').val(values.description);
		$form.find('[name="file-fileName"]').val(values.fileName);
		$form.find('.file-input-gruppan').addClass('hidden');
		//$('#'+formId+' div > label > span').addClass('disabled');
	} 
}

function setupFilesAndUrls() {
	
	$('.files-and-urls .urls .btn-add').bind('click tap',function() {
		showModalInputTwo("Adding a Url", "Please provide the name", 
											"Please provide the url",
											"", 
											"",
											"Add",
											function(name, url) {
												if (name.length > 0 && url.length > 0){
													if (url.indexOf('www.') === 0) {
														url = 'http://' + url;
													}
													tempValues.urls.push({name:name, url:url});
												}
												urlsToView(tempValues.urls);
											});
	});
	$('.files-and-urls .files .btn-add').bind('click tap',function() {
		$('#part-values').addClass("hidden");$('#file-values').removeClass('hidden');
		setFileFormValues();
	});
	urlsToView();
}

$( document ).ready(function() {
	rowButtons.initItems();
	initParts();
	rowButtons.addDeleteHandler(function($item){
		console.log('delete '+ $item.text());
		console.log(rowButtons.getItemData($item));
		rowButtons.deleteItem($item);
	});
	initRegister();

	var $elm = $('.part-additional-values > form input.btn-file');
	$elm.change(function () {
		var id = $(this)[0].id;
		var formId = this.form.id;
		var $elmName = $('#'+formId+' [name="name"]');
		var name = $elmName.val();
		console.log('changed');
		var selectedFile = jQuery(this).val();
		if (name === undefined || name.length < 1 && selectedFile !== undefined && selectedFile.length > 0) {
			selectedFile = selectedFile.replace(/^.*[\\\/]/, '');
			$elmName.val( selectedFile );
		}
		validatePartImageOrFile(id);
	});

	$("#image-name").bind('keyup change cut paste',function(){
		validatePartImageOrFile('image');
	});
	$("#image-name").bind('keyup change cut paste',function(){
		validatePartImageOrFile('image');
	});
	
	$('#btnSavePartImage').click(function() {
		if (validatePartImageOrFile('image') === true) {
			//here we must delete the old partImage

			var $elm = $('#register-form [name="image"]');
			var oldPartImageId = $elm.val();
			if (oldPartImageId !== undefined && oldPartImageId.length > 0) {
				var url = SERVER+'/files/part/'+item.id+'/'+oldPartImageId;
				var request = $.delete(url);
				request.done(function( data ) {
					console.log("Deleted file "+oldPartImageId);
					console.log(data);
					submitFormInBackground('register-image');
					
				}).fail(function( data ) {
					if (data.status===401){
						showModal("You need to be logged in!", data.responseText);
					}
				});
			} else {
				submitFormInBackground('register-image');
			}
		}
	});

	$('#btnSavePartFile').click(function() {
		if (validatePartImageOrFile('file') === true) {
			//here we must delete the old partImage
			console.log("need to get selected part if any");
			//no part selected let's add one
			submitFormInBackground('register-file');
			var $elm = $('#register-form [name="file"]');
			console.log("todo");
		}
	});
	

	//validate for the first time
	validatePartImageOrFile('image');
	setupImageFunctionsAndButtons();
	setupFilesAndUrls();
});