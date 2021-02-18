var setListValues = function setListValues(list) {
    var id, name, description;

    for (var i = 0; i < list.length; i++) {
        id = list[i].id;
        name = list[i].name;
        description = list[i].description;

        var str = createListItem(id, name, description, 'types', false, true, true, true);
        $("#list").append(str);
    }
    listFactory.updateListCount(list.length);
};

$(document).ready(function() {


});