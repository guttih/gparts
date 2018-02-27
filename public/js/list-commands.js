function listCommandsInitView() {
	var $table = $('table.list-commands');
	$table.find('tr').each(function( index ) {
		$( this ).find('td').addClass('item');
		$( this ).append('<td class="commands"></td>');
	  });
	
	$table = $('table.list-commands.view');
	$table.find('tr').each(function( index ) {
		$( this ).find('td.commands').append('<span class="list-command-view btn btn-default glyphicon glyphicon-eye-open"></span>');
	});
	$table = $('table.list-commands.edit');
	$table.find('tr').each(function( index ) {
		$( this ).find('td.commands').append('<span class="list-command-edit btn btn-default glyphicon glyphicon-pencil"></span>');
	});
	$table = $('table.list-commands.delete');
	$table.find('tr').each(function( index ) {
		$( this ).find('td.commands').append('<span class="list-command-delete btn btn-default glyphicon glyphicon-remove"></span>');
	});
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function listCommandsAddItem($table, textToAdd, dataToSave) {
	
	if (dataToSave !== undefined){
		var str = JSON.stringify(dataToSave);
		
		$table.append('<tr><td data-save="' + str.replaceAll('"', '#;#') + '">'+textToAdd+'</td></tr>');
	} else {
		$table.append('<tr><td>'+textToAdd+'</td></tr>');
	}
}
function listCommandsAddObjects($table, arrayOfObjects, sortByKey) {
	if (!Array.isArray(arrayOfObjects)){ console.error('listCommandsAddObjects not passed an array'); return;}
	
	var isObject = (typeof(arrayOfObjects[0]) === 'object'),
		isString = (typeof(arrayOfObjects[0]) === 'string');
	if (!isObject && !isString) { console.error('listCommandsAddObjects not passed array of objects or strings'); return;}
	if (isObject && sortByKey !== undefined && sortByKey.length > 0) {
		arrayOfObjects.sort(function(first, second){
			var a = first[sortByKey], b = second[sortByKey];
			return (a > b)? 1 : (a < b)? -1 : 0; 
		});
	} else if (isString && sortByKey !== undefined) {
		arrayOfObjects.sort();
	}
	var textToAdd;
	for(var i = 0; i < arrayOfObjects.length; i++){
		if (isObject) {
			if ((arrayOfObjects[i].text !== undefined) ) {textToAdd = arrayOfObjects[i].text; }
			if ((arrayOfObjects[i].name !== undefined) ) {textToAdd = arrayOfObjects[i].name; }

			listCommandsAddItem($table, textToAdd, arrayOfObjects[i]);
		} else {
			listCommandsAddItem($table, arrayOfObjects[i]);
		}
	}
}
function listCommandsGetItemData($item){
	var str = $item.data('save');
	if (str === undefined) {
		return; 
	}
	str = str.replaceAll('#;#', '"');
	return JSON.parse(str);
}
function _listCommandsAddHandler(callback, selector, command){
	if (selector === undefined) {
		selector = 'table.list-commands td.commands span';
	}
	$elm = $(selector+'.list-command-'+command);
	$elm.on('click', function() {
		var $item = $( this ).parent().parent().find('.item');
		callback($item);
	  });
}
function listCommandsAddViewHandler(callback, selector){
	_listCommandsAddHandler(callback, selector, 'view');
}
function listCommandsAddEditHandler(callback, selector){
	_listCommandsAddHandler(callback, selector, 'edit');
}
function listCommandsAddDeleteHandler(callback, selector){
	_listCommandsAddHandler(callback, selector, 'delete');
}

$(function() {
	// Handler for .ready() called.
	
		var arr = [];
		for (var i = 11; i > 0; i--){
			arr.push({
				name:'textastrengur númer '+i, id:'0000000000000000'+i, description: 'lýsing á innihaldi skráarinnar',
				fileName:'slóð og nafn '+i});
		}
		var arrStr =  ['str3', 'str2', 'str1'];
		listCommandsAddObjects($('table.list-commands'), arrStr, true);
		listCommandsAddObjects($('table.list-commands'), arr, 'name');
		listCommandsInitView();
		listCommandsAddViewHandler(function($item){
			console.log('view '+ $item.text());
			console.log(listCommandsGetItemData($item));
		});
		listCommandsAddEditHandler(function($item){
			console.log('edit '+ $item.text());
			console.log(listCommandsGetItemData($item));
		});
		listCommandsAddDeleteHandler(function($item){
			console.log('delete '+ $item.text());
			console.log(listCommandsGetItemData($item));
		});
		
  });