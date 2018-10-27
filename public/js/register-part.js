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

//use this function to validate the form values
function validateFormValues(){
	var strName = $('#name').val();

	if (strName === undefined || strName.length < 1) {
		showModalErrorText('Name is missing', 'You must provide a name.');
		return false;
	}

	var prop = $('#first-acquired').val();
	if (prop === undefined || prop.length < 1) {
		showModalErrorText('first acquired date is missing', 'You must provide a date.');
		return false;
	}

	setLastModifiedDate();

	return true;
}

function setSelectOptionsFromArray(id, list){

	var $elm = 	$("#"+id);
	var selected = $elm.find('option:selected');
	console.log(selected);
	$elm.find('option').remove();
	list.forEach(element => {
		var opt = new Option(element.name, element.id);
		opt.setAttribute("data-toggle", "tooltip");
		opt.setAttribute("title", element.description);
		$elm.append(opt);
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
		select.val(selectedOption);
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
	$('#last-modified').val(str);
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