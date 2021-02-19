var setListValues = function setListValues(list) {
    var id, name, email;

    for (var i = 0; i < list.length; i++) {
        id = list[i].id;
        name = list[i].name;
        email = list[i].email;

        var str = createListItem(id, name, email, 'users', false, true, true, true);
        $("#list").append(str);
    }
    listFactory.updateListCount(list.length);
};

$(document).ready(function() {

});