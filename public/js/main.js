/*
        VoffCon is a system for controlling devices and appliances from anywhere.
        It consists of two programs.  A “node server” and a “device server”.
        Copyright (C) 2016  Gudjon Holm Sigurdsson

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation, version 3 of the License.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program.  If not, see <http://www.gnu.org/licenses/>. 
        
You can contact the author by sending email to gudjonholm@gmail.com or 
by regular post to the address Haseyla 27, 260 Reykjanesbar, Iceland.
*/
//var SERVERURL = 'http://192.168.1.151:5100'; /*make a direct call bypassing sequrity for local clients*/
var CONFIG = {};
function getServer() {
	return window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
}
var SERVER = getServer();
// www.guttih.com ip 89.17.157.231

//appending put and delete to the jquery send
jQuery.each( [ "put", "delete" ], function( i, method ) {
  jQuery[ method ] = function( url, data, callback, type ) {
    if ( jQuery.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    return jQuery.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    });
  };
});

function setStartTime(date) {
		//var date = data.date;
		deviceStarted = new Date(date.year, date.month-1, date.day, date.hours, date.minutes, date.seconds, 0);
		var strDate = formaTima(deviceStarted);
		$('#server-started').text(strDate);
		
		$elm.text("Successfully connected to the device.").removeClass("alert-warning").addClass("alert-success");
}

function leadingZeros(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function logger(str){
	console.log("Logger : "+ str);
}

$('#btnSetStarted').click(function() {
	getWhenServerStarted();
});
$('#btnGetDevices').click(function() {
	getUserDeviceList();
});

var serverStartedTime;

//adds '0' in front of all numbers smaller than 10
function zeroFirst(number){
	return (number < 10) ? '0'+number : number;
}

function formaTima(d) {
var str =  d.getDate() + "." + (d.getMonth()+1) + "." + d.getFullYear() + " " +
			zeroFirst(d.getHours()) + ":" + zeroFirst(d.getMinutes()) + ":" + zeroFirst(d.getSeconds());

return str;
}

function msToStr(duration) {
	var milliseconds = parseInt((duration%1000)/100), 
		seconds = parseInt((duration/1000)%60),
		minutes = parseInt((duration/(1000*60))%60), 
		hours   = parseInt((duration/(1000*60*60))%24),
		days    = parseInt((duration/(1000*60*60*24)));

	days   = (days   < 10) ? "0" + days : days;
	hours   = (hours   < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
	var str = "";
	if (days > 0) {str+=days+" days ";}
	if (hours > 0) {str+=hours+" hrs ";}
	if (minutes > 0) {str+=minutes+" min ";}
	str+=seconds+" sec";
	return days + "d:" + hours + "h:" + minutes + "m:" + seconds + "s";
	//return str;
}

function updateServerRunningtime(){
	var now = new Date(); //"now"
	var diff = Math.abs(now - serverStartedTime);
	$('#serverRunning').text(msToStr(diff));
}
function setServerStartedValue(date){
	console.log("date");
	console.log(date);
	serverStartedTime = new Date(date.year, date.month-1, date.day, date.hours, date.minutes, date.seconds, 0);
	
	$('#serverStarted').text(formaTima(serverStartedTime));
	updateServerRunningtime();
	
}


function getUserDeviceList(){
	var url = SERVER+'/devices/device-list';
		var request = $.get(url);
	request.done(function( data ) {
		// Put the results in a div
		setDevicelistValues(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}

function getWhenServerStarted(){
	var url = SERVER+'/devices/started';
	var selected = $( "#devicelist" ).val();
	if (selected===undefined){
		console.log("NOTHING selected");
		return;
	}
	selected = JSON.parse(selected);
	var request = $.get(SERVER+'/devices/started/'+selected.id);
		
	request.done(function( data ) {
		// Put the results in a div
		setServerStartedValue(data.date);
	}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}


/*routeText is the element type to be deleted 'cards', 'controls' or 'devices'*/
function createListItem(id, name, description, routeText, bAddRunButton, bAddListByButton, bAddEditButton, bAddDeleteButton, imageSrc){
	var url = SERVER+'/'+ routeText +'/register/'+ id;
	
	if (imageSrc!== undefined && routeText ==='files' ) {
		url = SERVER+'/'+ routeText +'/register/image/'+ id;
	}
	var strElm = 
'<div id="listItem'+ id +'" class="list-group-item clearfix">' +
	'<p class="list-group-item-heading">' + name + '</p>' + 
	'<span class="list-group-item-text">' +description + '</span>'+
	'<span class="pull-right">';
	//window.location.href = '/cards/useraccess/'+ card.id;
	if (bAddRunButton){
		strElm +='<button onclick="runItem(\''+id+'\');" class="btn btn-xs btn-success"> <span class="glyphicon glyphicon-play"></span>&nbsp;Run </button>';
	}
	if (bAddListByButton){
		var singular = routeText.substr(0, routeText.length-1);
		var listPartByUrl = SERVER+ '/parts/list/'+ singular +'/'+ id;
		strElm += '<a href="'+ listPartByUrl +'" class="btn btn-xs btn-info"> <span class="glyphicon glyphicon-list-alt"></span>&nbsp;List Parts by</a>';
	}
	if (bAddEditButton){
		strElm += '<a href="'+ url +'" class="btn btn-xs btn-warning"> <span class="glyphicon glyphicon-edit"></span>&nbsp;Edit </a>';
	}

	if (bAddDeleteButton){
	 strElm +='<button onclick="deleteItem(\''+ routeText +'\', \''+id+'\');" class="btn btn-xs btn-danger"> <span class="glyphicon glyphicon-trash"></span> Delete </button>';
	}
	strElm +='</span>';
	if (imageSrc) {
		strElm +='<a target="_blank" href="'+ imageSrc +'"><img class="pull-right" src="'+ imageSrc +'"></a>';
	}
	strElm +='</div>';

	return strElm; 
}

function createListItemUserAccess(id, name, description, routeText, selectedOption, includeOption1){
	var url = SERVER+'/'+ routeText +'/register/'+ id;
	var sel0, sel1, sel2;
	sel0 = (selectedOption === 0) ? ' selected' : '';
	sel1 = (selectedOption === 1) ? ' selected' : '';
	sel2 = (selectedOption === 2) ? ' selected' : '';
	var strElm = 
'<div id="' + id +'" class="list-group-item clearfix">' +
	'<p class="list-group-item-heading">' + name + '</p>' + 
	'<span class="list-group-item-text">' +description + '</span>'+
	'<span class="pull-right">';
	strElm+='<select class="access-select form-control">'+
  				'<option value="0"' + sel0 + '>No access</option>';
	if (includeOption1 === true){
		strElm+=    '<option value="1"' + sel1 + '>User</option>';
	}
	strElm+=	'<option value="2"' + sel2 + '>Owner</option>'	+
			'</select>';
	strElm +='</span>' +'</div>';

	return strElm; 
}

// changes the background color of a select box which handles user access to items
function setSelectAccessBackgroundClick(){
	var $elm = $('.access-select');
	$elm.on('change', function() {
		var color = 'white';

		switch(this.value){
			case "1" : color = '#F0F7ED'; break;
			case "2" : color = '#A1D490'; break;
		}
		$(this).css("background-color", color);
	});

	// run the onChange
	$elm.each(function( index ) {
  		$( this ).trigger("change");
	});
}

/*routeText is the element type to be deleted 'cards', 'controls' or 'devices'*/
function deleteItem(routeText, id, deleteSuccessCallback){
	var singular;
	singular = routeText.substring(0, routeText.length-1);
	//showModal('Delete item',	'Are you sure you want to delete this '+ routeText +'?');
	
	showModalConfirm('Delete ' + singular,	
		'Are you sure you want to delete this '+ singular +'?',
		'Delete', 
		function(){
			var url = SERVER+'/'+ routeText +'/'+id;
			$.ajax({
				url: url,
				type: 'DELETE',
				success: function(data) {
					if (deleteSuccessCallback !== undefined){
						deleteSuccessCallback(data);
					} else{
						console.log(data);
						$('#listItem'+ id).remove();
						updateListCount();
					}
				},
				error: function (res){
					console.log(res);
					showModalError('Error when deleting', res);
				}
			});
		
		});
		
}

function cloneItem(routeText, cloneSuccessCallback){
	var singular;
	singular = routeText.substring(0, routeText.length-1);
	
	showModalConfirm('Clone ' + singular,	
		'Are you sure you want to copy all values in this '+ singular +
		' and create a new one?',
		'Yes, clone it', 
		function() {
			cloneSuccessCallback()
		});		
}

function showModalError(title, response){

	showModal(title, 
			'Error ' + response.status + ' : ' + response.statusText + 
			'\n\n<p class="error-response-text">' + response.responseText + '</p>');
}
function showModalErrorText(title, errorMessage){

	showModal(title, 
			'Error ' + 
			'\n\n<p class="error-response-text">' + errorMessage + '</p>');
}

function showModalErrorMsg(title, response) {
var text = {};
if (typeof response === 'object' && response !== null )
try {
	obj = JSON.parse(response.responseText);
	if (obj.msg !== undefined && obj.msg.length > 0) {
		text = obj.msg;
	}
	if (obj.message !== undefined &&  obj.message.length > 0) {
		text = obj.message;
	}
	if (obj.text !== undefined &&  obj.text.length > 0) {
		text = obj.text;
	}
} catch (e) {
	text = response.statusText;
}
	showModal(title, 
		'Error ' + response.status + ' : ' + response.statusText + 
		'\n\n<p class="error-response-text">' + text + '</p>');
}

function showModal(title, message){
	$(".modal-title").text(title);
	if (message.indexOf('\n')>-1)
	{
		message = message.replace('\n', '<br/>');
		$(".modal-body").html(message);
	}
	else {
		$(".modal-body").text(message);
	}
	$('#myModal .btn-default').show();
	$('#btn-confirm').hide(); 
	$('#myModal').modal('show');
}


function showModalConfirm(title, message, confirmButtonText, confirmCallback){
	$(".modal-title").text(title);
	$(".modal-body").text(message); 
	if (confirmCallback === undefined){
		//no button text provided
		$('#btn-confirm').text("Confirm");
		confirmCallback = confirmButtonText; /**/

	} else {
		$('#btn-confirm').text(confirmButtonText);
	}
	$('#btn-confirm').removeClass('btn-success').addClass('btn-danger');
	$('#btn-confirm').unbind();
	$('#btn-confirm').on('click', function(e) {
		$('#myModal').modal('hide');
		setTimeout(function(){
			confirmCallback();
		}, 400);
		
		
	});
	$('#myModal .btn-default').show();
	$('#btn-confirm').show();
	$('#myModal').modal('show');
}

// 	--Ask for user input, Example

function showModalInputHelperHideInputs() {
	$('#modal-input1').addClass('hidden');
	//$('.modal-body2').addClass('hidden');
	$('.modal-value2').addClass('hidden');
}

/**
 * Ask the user for imput
 *
 * @param {string} title Title of the Modal
 * @param {string} message Text to show under title
 * @param {string} defaultText1  Value in the input when the modal is shown
 * @param {string} confirmButtonText Text on the OK/confirm button
 * @param {string} confirmCallback what function to call when the user clicks the OK/confirm button
 * @param {boolean} onlyNumbers Ask for a number.  If not then modal will ask for text.
 *
 * @example Ask the user for a name
 *  showModalInput("Name needed", "Please type in your name", "OK",
 *     function(value) { 
 *	        alert(value);
 *	   });
  * @example Ask the user for his age
 *  showModalInput("Age needed", "Please type in your age", "25",
 *     function(value) { 
 *	        alert(value);
 *	   }, true);
 * @example Ask the user for a number between 0 and 256
 *	  showModalInput("Number needed", "Please provide a number Allowed are numbers (1-255)",22,"OK",
 *	     function(value) { 
 *		        alert(value);
 *		   }, true, 1, 255 );
 */
function showModalInput(title, message, defaultText1, confirmButtonText, confirmCallback, onlyNumbers, minNumber, maxNumber){
	showModalInputHelperHideInputs();
	$(".modal-title").text(title);
	$(".modal-body").text(message); 
	if (confirmCallback === undefined || confirmCallback === null){
		//no button text provided
		$('#btn-confirm').text("Confirm");
		confirmCallback = confirmButtonText; /**/

	} else {
		$('#btn-confirm').text(confirmButtonText);
	}
	$('#modal-input1').val(defaultText1);
	if (onlyNumbers !== undefined && onlyNumbers !== null && onlyNumbers === true){
		{	var obj = {type:"number"};
			if (minNumber !== undefined && minNumber !== null){ 
				obj.min = minNumber;
			}
			if (maxNumber !== undefined && maxNumber !== null){ 
				obj.max = maxNumber;
			}
			$('#modal-input1').attr(obj);
		}
	} else {
		$('#modal-input1').attr({type:"text"});
	}
	
	$('#btn-confirm').removeClass('btn-danger').addClass('btn-success');
	$('#modal-input1').removeClass('hidden');
	$('#btn-confirm').unbind();
	$('#btn-confirm').on('click', function(e) {
		var value = $('#modal-input1').val();
		$('#modal-input1').addClass('hidden');
		$('#myModal').modal('hide');
		showModalInputHelperHideInputs();
		setTimeout(function(){
			confirmCallback(value);
		}, 100);
	});
	$('#myModal .btn-default').show();
	$('#btn-confirm').show();
	$('#myModal').modal('show');
}

function showModalInputTwo(title, message1, message2, defaultText1, defaultText2, confirmButtonText, confirmCallback){
	$(".modal-title").text(title);
	$(".modal-body").text(message1); 
	$(".modal-body2").text(message2); 
	if (confirmCallback === undefined){
		//no button text provided
		$('#btn-confirm').text("Confirm");
		confirmCallback = confirmButtonText; /**/

	} else {
		$('#btn-confirm').text(confirmButtonText);
	}
	$('#modal-input1').attr({type:"text"});
	$('#modal-input1').val(defaultText1);
	$('#modal-input2').val(defaultText2);
	$('#btn-confirm' ).removeClass('btn-danger').addClass('btn-success');
	
	$(".modal-value2" ).removeClass('hidden');
	$('#modal-input1').removeClass('hidden');
	$('.modal-value2').removeClass('hidden');
	$('#btn-confirm' ).unbind();
	$('#btn-confirm' ).on('click', function(e) {
		var value1 = $('#modal-input1').val();
		var value2 = $('#modal-input2').val();
		//$(".modal-body2" ).addClass('hidden');
		$('#modal-input1').addClass('hidden');
		$('.modal-value2').addClass('hidden');
		$('#myModal').modal('hide');
		setTimeout(function(){
			confirmCallback(value1, value2);
		}, 100);
	});
	$('#myModal .btn-default').show();
	$('#btn-confirm').show();
	$('#myModal').modal('show');
}

function showModalOk(title, message, confirmButtonText, okCallback) {
	$(".modal-title").text(title);
	$(".modal-body").text(message); 
	if (okCallback === undefined) {
		//no button text provided
		$('#btn-confirm').text("OK");
		okCallback = confirmButtonText; /**/

	} else {
		$('#btn-confirm').text(confirmButtonText);
	}
	$('#btn-confirm').removeClass('btn-danger').addClass('btn-success');
	
	$('#btn-confirm').on('click', function(e) {
		$('#myModal').modal('hide');
		okCallback();
		
	});
	$('#myModal .btn-default').hide();
	$('#btn-confirm').show();
	$('#myModal').modal('show');
}

function changeHref(from, to){
	window.location.href = window.location.href.replace(from,to);
}




function getServerUrl(){
	var serverUrl = window.location.protocol + '//' + window.location.hostname +(window.location.port ? ':'+window.location.port: '');
	return serverUrl;
}


function changeServerSettingsUsersCanRegister(){
	var $elm = $('#allow-user-registration');
	var checked = $elm.hasClass( "checked" );
	var allow = true;  
	if (checked === true){
		allow = false; //checked was, and is  true, so we are denying access
	}
	var sendObj = {};
	sendObj.allowUserRegistration = allow;
	var posting = $.post(SERVER+'/settings/allow-user-registration', sendObj);
	posting
		.done(function(data){
			//successful update let's change the class "checked"
			if (allow === true) {//successfully able to ALLOW users to register 
				$elm.addClass("checked");
			} else { //successfully able to DENY users to register 
				$elm.removeClass("checked");
			}
		})
		.fail(function(data){
			console.log("failed posting");
			console.log(data);
			showModalErrorMsg('Error updating settings for user registration', data);
		});
	
	//window.location.href = asdf
}

function changeFileUploadSize(){
	var $elm = $('#change-file-upload-size');
	var oldSize = $elm.attr('data-limit');
	showModalInput("Changing the upload file size", "Please provide in bytes how big files can be when users upload.",oldSize,"Change", function (value) { 
		changeServerSettingsChangeFileUploadSize(value)
	}, true, 0 );
}

function changeListDescriptionMaxLength(){
	var $elm = $('#change-list-description-max-length');
	var oldSize = $elm.attr('data-maxlength');
	showModalInput("Changing part description max length", "Please provide max length of a part description in a list.",oldSize,"Change", function (value) { 
		changeServerSettingsListDescriptionMaxLength(value);
	}, true, 0 );
}

function changeServerSettingsChangeFileUploadSize(newValue){
	
	var $elm = $('#change-file-upload-size');
	var sendObj = {};
	sendObj.fileSizeLimit = newValue;
	var posting = $.post(SERVER+'/settings/file-size-limit', sendObj);
	posting
		.done(function(data){
			$elm.attr('data-limit', newValue);
			$elm.find('a').text('Change file upload size from '+ bytesToUnitString(newValue,2));
		})
		.fail(function(data){
			console.log("failed posting");
			console.log(data);
			showModalErrorMsg('Error updating settings for user registration', data);
		});
	
	//window.location.href = asdf
}

function changeServerSettingsListDescriptionMaxLength(newValue){
	
	var $elm = $('#change-list-description-max-length');
	var sendObj = {};
	sendObj.listDescriptionMaxLength = newValue;
	var posting = $.post(SERVER+'/settings/list-description-max-length', sendObj);
	posting
		.done(function(data){
			$elm.attr('data-maxlength', newValue);
			$elm.find('a').text('Change file upload size from '+newValue);
		})
		.fail(function(data){
			console.log("failed posting");
			console.log(data);
			showModalErrorMsg('Error updating settings for user registration', data);
		});
	
	//window.location.href = asdf
}


function getUserUserList(callback){
	var url = '/users/user-list';
	requestData(url, callback);
}


// makes a call to the API requesting data
// the subUrl should not contain the protocol, hostname nor port number
function requestData(subUrl, callback, errorCallback){
		var url = SERVER + subUrl;
		var request = $.get(url);
	request.done(function( data ) {
		callback(data);
		}).fail(function( data ) {
			if (errorCallback !== undefined){
				errorCallback(data);
			} else {
				if (data.status===401){
					showModal("You need to be logged in!", data.responseText);
				}
			}
		});
}

function runItem(id){
	window.location.assign("run/"+id);
}

function changeHref(from, to){
	window.location.href = window.location.href.replace(from,to);
}

function changeHelpHref(caller, id){
	var newValue = caller.value;
	var $elm = $("#"+id);
	if ( $elm.length < 1 ) { 
		return;
	}
	$elm.attr({href: newValue});
}

function initRegister(){
	if (typeof item !== 'undefined') {
		setFormValues(item);
	}
	$('#btnSave').click(function() {
		if (validateFormValues() === true) {
			var action = document.getElementById('register-form').action; 
			document.getElementById('register-form').submit();
		}
	});
}

//used on list pages like /public/js/list-types.js
function getList(callback, url){
	requestData(url, callback);
}

function openUrlInNewTab(url) {
	var win = window.open(url, '_blank');
	win.focus();
  }

/**
 * @param {Number} number The bytes to be formatted
 * @param {Number} [decimalPoints] The number of decimal points to be used (Default is 2)
 * @param {String} [unit]  The units to be formatted to. (Default is automatically)
 * 					Possible values are 'KB','MB','GB','TB','PB'  if this parameter is not provided or invalid then the unit will be selected automatically.
 * @returns A formatted string on the form xxx.dd XB   where xxx is the integer part of the formatted number and dd is the fractional part of the formatted number and XB is the unit which the number is presented in.
 */
function bytesToUnitString(number, decimalPoints, unit) {
	var power = 2; //for 'MB'
	var decimals = 2 //two numbers right of the dot;
	var usingUnit = 'MB';
	var automatic = false;
	if (decimalPoints !== undefined || decimalPoints !== null || decimalPoints > -1 ) {
		decimals = decimalPoints;
	} 
	if (unit !== undefined && unit === null && unit.length === 2) {
		usingUnit = usingUnit.toUpperCase();
	} else { 
		automatic = true;
	}
	
	if (automatic === true) {
		//automatically selecting unit;
		var power = Math.floor(Math.log(number)/Math.log(1024));

		switch (power) {
			case 0: usingUnit = 'bytes'; break;
			case 1: usingUnit = 'KB';    break;
			case 2: usingUnit = 'MB';    break;
			case 3: usingUnit = 'GB';    break;
			case 4: usingUnit = 'TB';    break;
			case 5: usingUnit = 'PB';    break;
			case 6: usingUnit = 'EB';    break;
			case 7: usingUnit = 'ZB';    break;
			case 8: usingUnit = 'YB';    break;
		}
	} else {
		switch (usingUnit) {
			case 'bytes': power = 0; break;
			case 'KB': power = 1; break;
			case 'MB': power = 2; break;
			case 'GB': power = 3; break;
			case 'TB': power = 4; break;
			case 'PB': power = 5; break;
			case 'EB': power = 6; break;
			case 'ZB': power = 7; break;
			case 'YB': power = 8; break;
		}
	}
	
	number/=Math.pow(1024, power);
	var str = parseFloat(number).toFixed(decimals) + ' '+ usingUnit;
	return str;
}

function compareNames(a,b) {
	if (a.name < b.name)
	  return -1;
	if (a.name > b.name)
	  return 1;
	return 0;
}

//returns null if error
function getUrlFirstPath(href, removeLastChar){
	if (SERVER === undefined || SERVER.length < 6 ||
		href    === undefined || href < SERVER.length ){
		return null;
	}
	var url = href.substr(SERVER.length+1);
	if (url.length < 2) {
		return null;
	}
	var iSlash = url.indexOf('/');
	if (iSlash < 1) {
		iSlash = url.indexOf('?');
	}
	if (iSlash < 1) {
		return url;
	}
	if (removeLastChar !== undefined && removeLastChar === true) {
		iSlash--;
	}
	var ret = url.substr(0, iSlash);
	return ret;
}

function setListByButtonUrlAndText() {
	var listBy = getUrlParameter('listBy');
	var queryStr = "?listBy=name";
	var btnText = "Order by name";
	var desText = "Ordered by creation time";
	var page = getUrlFirstPath(window.location.href);
	if (page !== undefined && page === 'parts') {
		desText = "Ordered by last modified time";
	}

	 if (listBy === 'name') {
		var queryStr =""  
		var btnText ="Order by creation order";
		if (page !== undefined && page === 'parts') {
			btnText = "Order by last modified";
		}
		desText = "Ordered by name";
	 }

	var btn = $('.list-by button');
	var par = $('.list-by p');
	btn.unbind();
	btn.text(btnText);
	par.text(desText);

	
	btn.bind('click tap',function() {
		//var page = 'parts';
		var url = SERVER+'/'+ page +'/list'+ queryStr;
		window.location.href = url;
	});
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function deleteButtonClickRegister(collection){
	$('#btnDelete').click(function() {
		var subPath = collection;
		deleteItem(subPath,item.id, function() {
			window.location.href = '/'+subPath+'/list';
		});
	});	
}

function cloneButtonClickRegister(collection){
	$('#btnClone').click(function() {
		var subPath = collection;

		cloneItem(subPath, function() {
			window.location.href = '/'+subPath+'/clone/'+item.id;
		});
	});	
}

function RegisterViewButtonClick(){
	var $button = $( "#btnView" );
	var $form = $('#register-form');
	if ($form.length < 1 || $button.length < 1) {
		return;
	}
	var action =  $form.attr("action");
	if (action === undefined || action.length < 2) {
		return; 
	}

	var collection = getUrlFirstPath(action, true);
	if (collection === null) {
		return;
	}
	var url = SERVER+'/parts/list/'+ collection +'/'+ item.id;

	$( "#btnView" ).click(function() {
		var win = window.open(url, '_blank');
		win.focus();
	});}

function updateListCount(newCount, prefix) {
	if (newCount === undefined || newCount === null)
	{
		newCount = $('.list-group-item-heading').length;
	}
	var e = $('.list-count');
	var strItem = e.attr('data-name');
	strItem+= (newCount > 1)? 's' : '';
	e.find('.text').text(strItem);
	e.find('.number').text(newCount);
	{
		e.find('.prefix').text(prefix? prefix: '');
	}
}

$(function () {  
	/* this is the $( document ).ready(function( $ ) but jshint does not like that*/
	var SERVER = getServer();
	//todo: run this only if logged in getWhenServerStarted();
	$('.dropdown-toggle').dropdown();/*for the dropdown-toggle bootstrap class*/
	$("[rel='tooltip']").tooltip();/*activate boostrap tooltips*/
	$('#myModal > div > div > div.modal-footer > button.btn.btn-default').click(function(){
		showModalInputHelperHideInputs();
	});
});
