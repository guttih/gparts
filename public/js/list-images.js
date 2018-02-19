
var setListValues = function setListValues(list){
	var id, name, description, src;
	for(var i = 0; i < list.length; i++){
		id 		= list[i].id;
		name 		= list[i].name;
		description = list[i].description;
		src = 		  list[i].src;
		
		var str =  createListItem(id, name, description, 'files', false, false, true, true, src);
		$("#list").append(str);
	}
};

$( document ).ready(function() {
	getList(setListValues, '/files/image-list');
});
