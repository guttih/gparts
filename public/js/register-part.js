function setFormValues(item){
	if (typeof item !== 'undefined' && item !== 'undefined') {

		if (item.name !== undefined){
			$("#name").val( item.name );
		}
		
		if (item.description !== undefined){
			$("#description").val( item.description );
		}
		if (item.url !== undefined){
			$("#url").val( item.url );
		}
		var action = document.getElementById('register-form').action;
		
		if (item.id !== undefined) {
			action+='/'+item.id;
		}
		document.getElementById('register-form').action = action;
	}
}

function setSelectOptionsFromArray(id, list){

	var select = 	$("#"+id);
	var selected = select.find('option:selected');
	var required = select.attr('required') === 'required';
	select.find('option').remove();
	if (list.length == 0) {
		var opt = new Option('No ' + id + ' registered', '');
		if (required === true) { opt.setAttribute("title", 'you must add a new ' + id + ' to be able to add parts');
		} else                 { opt.setAttribute("title", 'there are ' + id + 's registered') }
		opt.setAttribute("data-toggle", "tooltip"); 
		select.append(opt);
		return;
	}
	list.forEach(element => {
		var opt = new Option(element.name, element.id);
		opt.setAttribute("data-toggle", "tooltip");
		opt.setAttribute("title", element.description);
		select.append(opt);
	});
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
			select.val(selectedOption);
		}
		select.focus();
	}, '/' + id + 's/' + id + '-list');
}


function registerPartSelect(obj) {
	var select = partSelect(obj);
	var id = select.attr('id');
	var url = '/'+id+'s/register';
	var win = window.open(url, '_blank');
	win.focus();
}
function editPartSelect(obj) {
	var select = partSelect(obj);
	var id = select.attr('id');
	var selectedOption = select.val();
	var url = '/' + id + 's/register/' + selectedOption;
	var win = window.open(url, '_blank');
	win.focus();
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
	getList( function(list) { setSelectOptionsFromArray("type",         list ); }, '/types/type-list');
	getList( function(list) { setSelectOptionsFromArray("location",     list ); }, '/locations/location-list');
	getList( function(list) { setSelectOptionsFromArray("manufacturer", list ); }, '/manufacturers/manufacturer-list');
	getList( function(list) { setSelectOptionsFromArray("supplier",     list ); }, '/suppliers/supplier-list');
}

$( document ).ready(function() {
	rowButtons.initItems();
	initRegister();
	initParts();
	rowButtons.addDeleteHandler(function($item){
		console.log('delete '+ $item.text());
		console.log(rowButtons.getItemData($item));
		rowButtons.deleteItem($item);
	});
	setLastModifiedDate();

});