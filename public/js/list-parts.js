var listBy = null;

//returns null if no params are found
var setListValues = function setListValues(list){
	var id, name, description;
	var listBy = getUrlParameter('listBy');
	switch (listBy) {
		case 'name' : list.sort(compareNames);
					  queryStr="";
					  btnText = "List by creation order";
					  break;
	}
	setListByButtonUrlAndText();
	
	for(var i = 0; i < list.length; i++){
		id 		= list[i].id;
		name 		= list[i].name;
		description = list[i].description,
		src = 		  list[i].src;
		var str =  createListItem(id, name, description, 'parts', false, false, true, true, src);
		$("#list").append(str);		
	}
	updateListCount(list.length);
};

$( document ).ready(function() {
	
	var $listBy = $('.list-by-header');
	if ($listBy.length > 0) {
		console.log($listBy.attr("data-id"));
		var listBy = JSON.parse($listBy.attr("data-obj"));
		console.log(listBy);
	}

	if (listBy !== undefined && listBy !== null && listBy.search !== undefined && listBy.id !== undefined) {
		getList(setListValues, '/parts/part-list/'+listBy.search+'/'+listBy.id);
	} else {
		getList(setListValues, '/parts/part-list');
	}	
});
