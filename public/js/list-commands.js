
var listCommands = {

	_isEmpty: function _isEmpty(obj) {
		for(var key in obj) {
			if(obj.hasOwnProperty(key))
				return false;
		}
		return true;
	},

	//needs a tr object
	_addButtons: function _addButtons($row){
		if ( $row.children().length > 1 ) {
			return; //not added yet
		}
		
		$row.find('td').addClass('item');
		if ($row.find('td.commands').length > 0 ){
			return;
		}

		var $tdCommands = $('<td class="commands"></td>');
		//check if view class is on table
		var $table = $row.parent().parent();
		if ($table.hasClass('view')) {
			$tdCommands.append('<span class="list-command-view btn btn-default glyphicon glyphicon-eye-open"></span>');
		}
		if ($table.hasClass('edit')) {
			$tdCommands.append('<span class="list-command-edit btn btn-default glyphicon glyphicon-pencil"></span>');
		}
		if ($table.hasClass('delete')) {
			$tdCommands.append('<span class="list-command-delete btn btn-default glyphicon glyphicon-remove"></span>');
		}
		$row.append($tdCommands);
	},
	_addHandler: function _addHandler(callback, selector, command){
		if (selector === undefined) {
			selector = 'table.list-commands td.commands span';
		}
		$elm = $(selector + '.list-command-'+command);
		$elm.on('click', function() {
			var $item = $( this ).parent().parent().find('.item');
			callback($item);
		  });
	},
	initItems: function create() {
		var $table = $('table.list-commands');
		$table.find('tr').each(function( index ) {
			$( this ).find('td').addClass('item');
			if ($( this ).find('td.commands').length < 1 ){
				$( this ).append('<td class="commands"></td>');
			}
		  });
		$table = $('table.list-commands.view');
		$table.find('tr').each(function( index ) {
			if ($( this ).find('td.commands span.list-command-view').length < 1) {
				$( this ).find('td.commands').append('<span class="list-command-view btn btn-default glyphicon glyphicon-eye-open"></span>');
			}
		});
		$table = $('table.list-commands.edit');
		$table.find('tr').each(function( index ) {
			if ($( this ).find('td.commands span.list-command-edit').length < 1) {
				$( this ).find('td.commands').append('<span class="list-command-edit btn btn-default glyphicon glyphicon-pencil"></span>');
			}
		});
		$table = $('table.list-commands.delete');
		$table.find('tr').each(function( index ) {
			if ($( this ).find('td.commands span.list-command-delete').length < 1) {
				$( this ).find('td.commands').append('<span class="list-command-delete btn btn-default glyphicon glyphicon-remove"></span>');
			}
		});
	}, 
	addItem : function addItem($table, textToAdd, dataToSave) {
		var $elm;
		if (dataToSave !== undefined){
			$elm = $('<tr><td>'+textToAdd+'</td></tr>');
			$elm.data(dataToSave);
		} else {
			$elm = $('<tr><td>'+textToAdd+'</td></tr>');
		}

		$table.append($elm);
		this._addButtons($elm);
	},
	addObjects: function addObjects($table, arrayOfObjects, sortByKey) {
		if (!Array.isArray(arrayOfObjects)){ console.error('listCommands.addObjects not passed an array'); return;}
		
		var isObject = (typeof(arrayOfObjects[0]) === 'object'),
			isString = (typeof(arrayOfObjects[0]) === 'string');
		if (!isObject && !isString) { console.error('listCommands.addObjects not passed array of objects or strings'); return;}
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
	
				listCommands.addItem($table, textToAdd, arrayOfObjects[i]);
			} else {
				listCommands.addItem($table, arrayOfObjects[i]);
			}
		}
	},
	// returns undefined if not data is found
	getItemData: function getItemData($item){
		var ret = $item.parent().data();
		if (this._isEmpty(ret)) { return; }
		return ret;

	},
	addViewHandler: function addViewHandler(callback, selector){
		this._addHandler(callback, selector, 'view');
	},
	addEditHandler: function addEditHandler(callback, selector){
		this._addHandler(callback, selector, 'edit');
	},
	addDeleteHandler: function addDeleteHandler(callback, selector){
		this._addHandler(callback, selector, 'delete');
	},
	deleteItem: function deleteItem($item){
		$item.parent().closest('tr').remove();
	}
};


$(function() {
	
		var arr = [];
		for (var i = 11; i > 0; i--){
			arr.push({
				name:'textastrengur númer '+i, id:'0000000000000000'+i, description: 'lýsing á innihaldi skráarinnar',
				fileName:'slóð og nafn '+i});
		}
		var arrStr =  ['str3', 'str2', 'str1'];
		listCommands.addObjects($('#files'), arrStr, true);
		listCommands.addObjects($('#files'), arr, 'name');
		listCommands.initItems();
		listCommands.addItem($('#files'),'texti', {name:'nafni ', id:'idiið', description: 'lýsingin',fileName:'filenafnið '});
		
		listCommands.addViewHandler(function($item) {
			console.log('view '+ $item.text());
			console.log(listCommands.getItemData($item));
		});
		listCommands.addEditHandler(function($item){
			console.log('edit '+ $item.text());
			console.log(listCommands.getItemData($item));
		});
		listCommands.addDeleteHandler(function($item){
			console.log('delete '+ $item.text());
			console.log(listCommands.getItemData($item));
			listCommands.deleteItem($item);
		});
		listCommands.initItems();
  });