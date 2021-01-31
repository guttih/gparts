
var listBy = null;

//returns null if no params are found
var setListValues = function setListValues(list) {
	var id, name, description;
	var listBy = getUrlParameter('listBy');
	switch (listBy) {
		case 'name': list.sort(compareNames);
			queryStr = "";
			btnText = "List by creation order";
			break;
	}
	setListByButtonUrlAndText();

	for (var i = 0; i < list.length; i++) {
		id = list[i].id;
		name = list[i].name;
		description = list[i].description,
			src = list[i].src;
		var str = createListItem(id, name, description, 'parts', false, false, true, true, src);
		$("#list").append(str);
	}
	updateListCount(list.length);
};


var filterListTimer = 0;
function filterList() {
	clearTimeout(filterListTimer)
	filterListTimer = setTimeout(function () {
		{
			var inputs = document.querySelectorAll('.search-input');
			const queryWords = []
			inputs.forEach(e => { if (e.value) { queryWords.push(e.value.toLowerCase()) } })

			var items = document.querySelectorAll('#list .list-group-item');
			if (!items) {
				updateListCount(items.length);
				return
			}
			var visibleItemCount = items.length;

			items.forEach(e => {

				if (!queryWords || !queryWords.length) {
					e.classList.remove('hidden');
				} else {
					//lets hide all elements which do not mathch query
					var name = e.querySelector('p.list-group-item-heading').textContent.toLowerCase();
					var description = e.querySelector('.list-group-item-text').textContent.toLowerCase();
					const found = [];
					for (var i = 0; i < queryWords.length; i++) {
						if (name.includes(queryWords[i]) || description.includes(queryWords[i])) {
							found.push(true);
						}
					}
					if (found.length !== queryWords.length) {
						visibleItemCount--;
						e.classList.add('hidden')
					} else {
						e.classList.remove('hidden')
					}
				}
			})
			updateListCount(list.length, `${visibleItemCount} of`);
		}
	}, 400)
}

$(document).ready(function () {
	$('.search-input').on('keyup', function () {
		filterList()
	})
	$('#filter-button').on('click', function () {
		const $elm = $('.search-inputs');
		const isHidden = $elm.hasClass('hidden')
		if (isHidden) {
			$(this).text('Remove filter')
			$elm.removeClass('hidden')
			const inputs = $('.search-input');
			if (inputs.length > 0) {
				inputs[0].focus();
			}
		} else {
			$(this).text('Filter the list')
			$('.search-input').val('');
			$elm.addClass('hidden');
		}
		filterList()
	})

	var $listBy = $('.list-by-header');
	if ($listBy.length > 0) {
		var listBy = JSON.parse($listBy.attr("data-obj"));
	}

	if (listBy !== undefined && listBy !== null && listBy.search !== undefined && listBy.id !== undefined) {
		var url = SERVER + '/' + listBy.search + 's/register/' + listBy.id;
		$listBy.find('a').attr("href", url)
		getList(setListValues, '/parts/part-list/' + listBy.search + '/' + listBy.id);
	} else {
		getList(setListValues, '/parts/part-list');
	}
});
