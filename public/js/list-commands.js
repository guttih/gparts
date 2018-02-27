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
		
		$table.append('<tr><td data-save="' + str.replaceAll('"', '--#--') + '">'+textToAdd+'</td></tr>');
	} else {
		$table.append('<tr><td>'+textToAdd+'</td></tr>');
	}
}
function listCommandsGetItemData($item){
	var str = $item.data('save');
	if (str === undefined) {
		return; 
	}
	str = str.replaceAll('--#--', '"');
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
	
		listCommandsAddItem($('table.list-commands'), 'add me', {hello:"stuff", data:323});
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