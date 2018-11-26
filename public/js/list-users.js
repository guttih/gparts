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
/*client javascript file for the list-user page*/
var SERVER;

/*
function runItem(id){
	console.log('todo: run this item : ' + id);
}*/


var setUserlistValues = function setUserlistValues(list){
	var id, name, description;
	
	var listBy = getUrlParameter('listBy');
	switch (listBy) {
		case 'name' : list.sort(compareNames); break;
	}
	setListByButtonUrlAndText();
	for(var i = 0; i < list.length; i++){
		id 		= list[i].id;
		name 		= list[i].name;
		description = list[i].description;
		
		var str =  createListItem(id, name, description, 'users', false, false, true, true);
		$("#user-list").append(str);
	}
	updateListCount(list.length);
};

$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = getServer();
	
	getUserUserList(setUserlistValues, true);
	
});
