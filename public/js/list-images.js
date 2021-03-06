var setListValues = function setListValues(list) {
    var id, name, description, src;

    var listBy = getUrlParameter('listBy');
    switch (listBy) {
        case 'name':
            list.sort(compareNames);
            break;
    }
    setListByButtonUrlAndText();
    for (var i = 0; i < list.length; i++) {
        id = list[i].id;
        name = list[i].name;
        description = list[i].description;
        src = list[i].src;

        var str = createListItem(id, name, description, null, 'files', false, false, true, true, src);
        $("#list").append(str);
    }
    listFactory.updateListCount(list.length);
};

$(document).ready(function() {
    getList(setListValues, '/files/image-list');
});