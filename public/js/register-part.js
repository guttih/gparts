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
	return true;
}

function setSelectOptionsFromArray(id, list){

	var selector = "#"+id;
	$(selector).find('option').remove();
	list.forEach(element => {
		var opt = new Option(element.name, element.id);
		opt.setAttribute("data-toggle", "tooltip");
		opt.setAttribute("title", element.description);
		$(selector).append(opt);
	});
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
});