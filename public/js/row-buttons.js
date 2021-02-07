var rowButtons = {

    _isEmpty: function _isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    },

    //needs a tr object
    _addButtons: function _addButtons($row) {
        if ($row.children().length > 1) {
            return; //not added yet
        }

        $row.find('td').addClass('item');
        if ($row.find('td.commands').length > 0) {
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
    _addHandler: function _addHandler(callback, selector, command) {
        if (selector === undefined) {
            selector = 'table.row-buttons td.commands span';
        }
        $elm = $(selector + '.list-command-' + command);
        $elm.on('click', function() {
            var $item = $(this).parent().parent().find('.item');
            callback($item);
        });
    },
    initItems: function create() {
        var $table = $('table.row-buttons');
        $table.find('tr').each(function(index) {
            $(this).find('td').addClass('item');
            if ($(this).find('td.commands').length < 1) {
                $(this).append('<td class="commands"></td>');
            }
        });
        $table = $('table.row-buttons.view');
        $table.find('tr').each(function(index) {
            if ($(this).find('td.commands span.list-command-view').length < 1) {
                $(this).find('td.commands').append('<span class="list-command-view btn btn-default glyphicon glyphicon-eye-open"></span>');
            }
        });
        $table = $('table.row-buttons.edit');
        $table.find('tr').each(function(index) {
            if ($(this).find('td.commands span.list-command-edit').length < 1) {
                $(this).find('td.commands').append('<span class="list-command-edit btn btn-default glyphicon glyphicon-pencil"></span>');
            }
        });
        $table = $('table.row-buttons.delete');
        $table.find('tr').each(function(index) {
            if ($(this).find('td.commands span.list-command-delete').length < 1) {
                $(this).find('td.commands').append('<span class="list-command-delete btn btn-default glyphicon glyphicon-remove"></span>');
            }
        });
        /*
        		$('#files > tbody tr').mouseover(function(){
        			$( this ).find('.commands.item').removeClass('hidden');
        		});
        		$('#files > tbody tr').mouseout(function(){
        			$( this ).find('.commands.item').addClass('hidden');
        		});*/





    },
    addItem: function addItem($table, textToAdd, dataToSave) {
        var $elm;
        if (dataToSave !== undefined) {
            $elm = $('<tr><td>' + textToAdd + '</td></tr>');
            $elm.data(dataToSave);
        } else {
            $elm = $('<tr><td>' + textToAdd + '</td></tr>');
        }

        $table.append($elm);
        this._addButtons($elm);
    },
    addObjects: function addObjects($table, arrayOfObjects, sortByKey) {
        if (!Array.isArray(arrayOfObjects)) { console.error('rowButtons.addObjects not passed an array'); return; }

        var isObject = (typeof(arrayOfObjects[0]) === 'object'),
            isString = (typeof(arrayOfObjects[0]) === 'string');
        if (!isObject && !isString) { console.error('rowButtons.addObjects not passed array of objects or strings'); return; }
        if (isObject && sortByKey !== undefined && sortByKey.length > 0) {
            arrayOfObjects.sort(function(first, second) {
                var a = first[sortByKey],
                    b = second[sortByKey];
                return (a > b) ? 1 : (a < b) ? -1 : 0;
            });
        } else if (isString && sortByKey !== undefined) {
            arrayOfObjects.sort();
        }
        var textToAdd;
        for (var i = 0; i < arrayOfObjects.length; i++) {
            if (isObject) {
                if ((arrayOfObjects[i].text !== undefined)) { textToAdd = arrayOfObjects[i].text; }
                if ((arrayOfObjects[i].name !== undefined)) { textToAdd = arrayOfObjects[i].name; }

                rowButtons.addItem($table, textToAdd, arrayOfObjects[i]);
            } else {
                rowButtons.addItem($table, arrayOfObjects[i]);
            }
        }
    },
    // returns undefined if not data is found
    getItemData: function getItemData($item) {
        var ret = $item.parent().data();
        if (this._isEmpty(ret)) { return; }
        return ret;

    },
    addViewHandler: function addViewHandler(callback, selector) {
        this._addHandler(callback, selector, 'view');
    },
    addEditHandler: function addEditHandler(callback, selector) {
        this._addHandler(callback, selector, 'edit');
    },
    addDeleteHandler: function addDeleteHandler(callback, selector) {
        this._addHandler(callback, selector, 'delete');
    },
    deleteItem: function deleteItem($item) {
        $item.parent().closest('tr').remove();
    }
};


$(function() {
    rowButtons.initItems();
});