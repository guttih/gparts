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
		console.log(data);
		setDevicelistValues(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}
/*
function setDevicelistValues(devicelist){
	var key, name, shallDisable = true;
	$("#devicelist").empty().prop( "disabled", true );
	for(var i = 0; i < devicelist.length; i++){
		shallDisable=false;
		console.log(devicelist[i]);
		
		key = devicelist[i].id;
		name = devicelist[i].name;
		$('#devicelist')
			.append($('<option>', { value : JSON.stringify(devicelist[i])})
			.text(name));
	}
	$('#devicelist').prop( "disabled", shallDisable );
	$("#devicelist option").each(function(item){
			console.log(item);
		// Add $(this).val() to your list
	});
}
*/
function getWhenServerStarted(){
	var url = SERVER+'/devices/started';
	var selected = $( "#devicelist" ).val();
	if (selected===undefined){
		console.log("NOTHING selected");
		return;
	}
	selected = JSON.parse(selected);
	console.log("selected");
	console.log(selected);
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
function createListItem(id, name, description, routeText, bAddRunButton, bAddAccessButton, bAddEditButton, bAddDeleteButton, imageSrc){
	var url = SERVER+'/'+ routeText +'/register/'+ id;
	
	if (imageSrc!== undefined) {
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
	if (bAddAccessButton){
		strElm += '<a href="/'+ routeText +'/useraccess/'+ id +'" class="btn btn-xs btn-warning"> <span class="glyphicon glyphicon-user"></span>&nbsp;Access </a>';
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
					console.log("delete success.");
					if (deleteSuccessCallback !== undefined){
						deleteSuccessCallback(data);
					} else{
						console.log(data);
						$('#listItem'+ id).remove();
					}
				},
				error: function (res){
					console.log(res);
					showModalError('Error when deleting', res);
				}
			});
		
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
//  showModalInput("test", "texti", "vista", function(value) {
//		alert(value);
//	});
function showModalInput(title, message, defaultText1, confirmButtonText, confirmCallback){
	$(".modal-title").text(title);
	$(".modal-body").text(message); 
	if (confirmCallback === undefined){
		//no button text provided
		$('#btn-confirm').text("Confirm");
		confirmCallback = confirmButtonText; /**/

	} else {
		$('#btn-confirm').text(confirmButtonText);
	}
	$('#modal-input1').val(defaultText1);
	$('#btn-confirm').removeClass('btn-danger').addClass('btn-success');
	$('#modal-input1').removeClass('hidden');
	$('#btn-confirm').unbind();
	$('#btn-confirm').on('click', function(e) {
		var value = $('#modal-input1').val();
		$('#modal-input1').addClass('hidden');
		$('#myModal').modal('hide');
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
	$('#modal-input1').val(defaultText1);
	$('#modal-input2').val(defaultText2);
	$('#btn-confirm' ).removeClass('btn-danger').addClass('btn-success');
	$(".modal-body2" ).removeClass('hidden');
	$('#modal-input1').removeClass('hidden');
	$('#modal-input2').removeClass('hidden');
	$('#btn-confirm' ).unbind();
	$('#btn-confirm' ).on('click', function(e) {
		var value1 = $('#modal-input1').val();
		var value2 = $('#modal-input2').val();
		$(".modal-body2" ).addClass('hidden');
		$('#modal-input1').addClass('hidden');
		$('#modal-input2').addClass('hidden');
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

/*function getUserUserList(callback){
	var url = SERVER+'/users/user-list';
		var request = $.get(url);
	request.done(function( data ) {
		callback(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}*/

function changeUsersCanRegister(){
	var $elm = $('#allow-user-registration');
	var checked = $elm.hasClass( "checked" );
	var allow = true;  
	if (checked === true){
		allow = false; //checked was, and is  true, so we are denying access
	}
	var sendObj = {};
	sendObj.allowUserRegistration = allow;
	//var posting = $.post( '/users/settings', sendObj);
	var posting = $.post( '/settings', sendObj);
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
			showModalError('Error updating settings for user registration', data);
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
/*
function changeHref(caller, id){
	console.log(caller);
	var newValue = caller.value;
	var $elm = $("#"+id);
	if ( $elm.length < 1 ) { 
		return;
	}
	$elm.attr({href: newValue});
}*/

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


$(function () {  
	/* this is the $( document ).ready(function( $ ) but jshint does not like that*/
	var SERVER = getServer();
	//todo: run this only if logged in getWhenServerStarted();
	$('.dropdown-toggle').dropdown();/*for the dropdown-toggle bootstrap class*/
	$("[rel='tooltip']").tooltip();/*activate boostrap tooltips*/
	
});
