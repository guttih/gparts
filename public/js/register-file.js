

function validateImage(input) {
	var URL = window.URL || window.webkitURL;
	if (!input || input === undefined || input.files === undefined) {
		//there is no file input field we are in edit mode
		return true;
	}
    var file = input.files[0];
	var enableButton = false;
    /*if (file && file.type !== undefined && file.type.length > 0) {
		var arr = ['image/jpeg', 'image/svg+xml', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
		enableButton = (arr.indexOf(file.type) > -1);
	}*/
	if (file && file.name){
		$('#fileName').val(file.name);
	}
	enableButton = (file && file.type !== undefined && file.type.indexOf('image') === 0);
	
	if (enableButton) {
		var reader = new FileReader();
            reader.onload = function (e) {
				var $elm = $('#image-container');
				$elm.css('display', 'unset');
				$elm.find('img').attr('src', e.target.result);
			}
			reader.readAsDataURL(input.files[0]);
	} else {
		$('#image-container').css('display', 'none');
	}
	$('#btnSave').prop("disabled", !enableButton);

	return enableButton;
}

function setFormValues(item){

	if (typeof item !== 'undefined' && item !== 'undefined') {

		if (item.name !== undefined){
			$("#name").val( item.name );
		}
		
		if (item.description !== undefined){
			$("#description").val( item.description );
		}
		if (item.fileName !== undefined){
			$("#fileName").val( item.fileName );
		}
		if (item.src !== undefined) {
			var $elm = $('#image-container');
			if ($elm.length > 0){
				$elm.css('display', 'unset');
				var $img = $elm.find('img');
				$img.attr('src', item.src);
				$img.wrap( '<a target="_blank" href="' + item.src + '"></a>' );

				//Click image instead of clicking a button
				$( "#btnView" ).hide();
			}
			
			$( "#btnView" ).click(function() {
				var win = window.open(item.src, '_blank');
  				win.focus();
			  });
		}
		
		var action = document.getElementById('register-form').action;
		
		if (item.id !== undefined) {
			action+='/'+item.id;
		}
		document.getElementById('register-form').action = action;

		var destHref = '/files/list';
		if ($('#image-container').length > 0) {
			destHref = '/files/list/image'; //we have an image.
		}
		
		$('#btnDelete').click(function() {
			deleteItem('files',item.id, function() {
						window.location.href = destHref;
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
	return validateImage(document.getElementById('image'));
}


$( document ).ready(function() {
	$('#image-container').css('display', 'none');
	initRegister();
	
	var $elm = $("#file,#image");
	$elm.change(function () {
		var name = $("#name").val();
		console.log('changed');
		var selectedFile = jQuery(this).val();
		if (name === undefined || name.length < 1 && selectedFile !== undefined && selectedFile.length > 0) {
			selectedFile = selectedFile.replace(/^.*[\\\/]/, '');
			$("#name").val( selectedFile );
		}
	});
	
});