function createListItemFiles(id, name, description, owners, topLeft, routeText, bAddRunButton, bAddAccessButton, bAddEditButton, bAddDeleteButton, imageSrc) {
    var url = SERVER + '/' + routeText + '/register/' + id;

    if (imageSrc !== undefined) {
        url = SERVER + '/' + routeText + '/register/image/' + id;
    }
    var strOwners = '';
    if (owners !== null && owners.length > 0) {
        owners.forEach(element => {
            strOwners += element + ' ';
        });
    }
    var topLeft = !topLeft ? '' : `<div class="list-top-left">${topLeft}</div>`
    var strElm =
        '<div id="listItem' + id + '" class="list-group-item clearfix">' +
        '<p class="list-group-item-heading">' + name + topLeft + '</p>' +
        '<span class="list-group-item-text">' + description + '</span>' +
        '<div class="list-group-item-owner">' + strOwners + '</div>' +
        '<span class="pull-right">';
    if (bAddRunButton) {
        strElm += '<button onclick="runItem(\'' + id + '\');" class="btn btn-xs btn-success"> <span class="glyphicon glyphicon-play"></span>&nbsp;Run </button>';
    }
    if (bAddAccessButton) {
        strElm += '<a href="/' + routeText + '/useraccess/' + id + '" class="btn btn-xs btn-warning"> <span class="glyphicon glyphicon-user"></span>&nbsp;Access </a>';
    }
    if (bAddEditButton) {
        strElm += '<a href="' + url + '" class="btn btn-xs btn-warning"> <span class="glyphicon glyphicon-edit"></span>&nbsp;Edit </a>';
    }

    if (bAddDeleteButton) {
        strElm += '<button onclick="deleteItem(\'' + routeText + '\', \'' + id + '\');" class="btn btn-xs btn-danger"> <span class="glyphicon glyphicon-trash"></span> Delete </button>';
    }
    strElm += '</span>';
    if (imageSrc) {
        strElm += '<a target="_blank" href="' + imageSrc + '"><img class="pull-right" src="' + imageSrc + '"></a>';
    }
    strElm += '</div>';

    return strElm;
}

var setListValues = function setListValues(list) {
    var id, name, description;

    for (var i = 0; i < list.length; i++) {
        id = list[i].id;
        name = list[i].name;
        description = list[i].description;

        var str = createListItem(id, name, description, null, 'files', false, true, true, true);
        $("#list").append(str);
    }
    listFactory.updateListCount(list.length);
};

$(document).ready(function() {

});