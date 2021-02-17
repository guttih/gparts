var setListValues = function setListValues(list) {
    var id, name, description;

    setListByButtonUrlAndText();
    for (var i = 0; i < list.length; i++) {
        id = list[i].id;
        name = list[i].name;
        description = list[i].description;

        var str = createListItem(id, name, description, 'locations', false, true, true, true);
        $("#list").append(str);
    }
    listFactory.updateListCount(list.length);
};

$(document).ready(function() {

    //getList(setListValues, '/locations/location-list');
    // if (listBy !== undefined && listBy !== null && listBy.search !== undefined && listBy.id !== undefined) {
    //     var url = SERVER + '/' + listBy.search + 's/register/' + listBy.id;
    //     $listBy.find('a').attr("href", url)
    //     console.log('todo: from here')
    //     getList(listFactory.setListValues, '/locations/list/' + listBy.search + '/' + listBy.id);
    // } else {
    //     console.log('insert search')
    //     listFactory.postSearch(listFactory.getQueryDomValues(0));
    // }

});