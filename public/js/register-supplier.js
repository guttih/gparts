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

$( document ).ready(function() {
	initRegister();
	deleteButtonClickRegister('suppliers');
});