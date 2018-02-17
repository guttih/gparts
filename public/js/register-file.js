function setFormValues(item){

	if (typeof item !== 'undefined' && item !== 'undefined') {

		if (item.name !== undefined){
			$("#name").val( item.name );
		}
		
		if (item.description !== undefined){
			$("#description").val( item.description );
		}
		if (item.originalFilename !== undefined){
			$("#originalFilename").val( item.originalFilename );
		}
		var action = document.getElementById('register-form').action;
		
		if (item.id !== undefined) {
			action+='/'+item.id;
		}
		document.getElementById('register-form').action = action;


		$('#btnDelete').click(function() {
			deleteItem('files',item.id, function() {
						window.location.href ='/files/list';
				});
				
			});


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
	console.log( "ready!" );
	initRegister();

	var $elm = $("#file");
	console.log('registering on change');
	$elm.change(function () {
		var name = $("#name").val();
		console.log('changed');
		var selectedFile = jQuery(this).val();
		if (name === undefined || name.length < 1 && selectedFile !== undefined && selectedFile.length > 0) {
			selectedFile = selectedFile.replace(/^.*[\\\/]/, '')
			$("#name").val( selectedFile );
		}

	
	});
});