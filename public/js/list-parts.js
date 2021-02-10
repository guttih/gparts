var listBy = null;
var page = 0;

//returns null if no params are found
var setListValues = function setListValues(data) {

    console.log('setting list values');
    var id, name, description;
    // var listBy = getUrlParameter('listBy');
    // switch (listBy) {
    //     case 'name':
    //         list.sort(compareNames);
    //         queryStr = "";
    //         btnText = "List by creation order";
    //         break;
    // }
    setListByButtonUrlAndText();
    if (!data.page) {
        $("#list").empty();
    }
    page = data.page;
    list = data.result;
    for (var i = 0; i < list.length; i++) {
        id = list[i].id;
        name = list[i].name;
        description = list[i].description,
            src = list[i].src;
        var str = createListItem(id, name, description, 'parts', false, false, true, true, src);
        $("#list").append(str);
    }

    var itemCount = (data.page + 1) * data.itemsPerPage;
    if (itemCount >= data.count) {
        //This is the last page
        itemCount = data.count;
        $('.button-get-more').removeClass('hidden').addClass('hidden')
    } else {
        $('.button-get-more').removeClass('hidden');
    }

    updateListCount(data.count, `${itemCount} of `);
};

function filterDomList() {
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

var filterListTimer = 0;

const postSearch = function(query) {
    const sendObj = query ? query : {};
    return new Promise((resolve, reject) => {
        var url = SERVER + '/parts/search';
        var posting = $.post(url, sendObj);
        posting
            .done(function(data) {
                setListValues(data)
                resolve(data)
            })
            .fail(function(err) {
                console.log(`Failed ${JSON.stringify(err, null, 4)}`)
                showModalErrorMsg('Error updating settings for user registration', err);
                reject(err);
            });
    })
}

function getQueryDomValues(page) {
    var name = $('#searchInput1').val();
    var description = $('#searchInput2').val();;
    var category = $('#searchInput3').val();;
    var sendObj = {};
    if (name) {
        sendObj.name = name;
    }
    if (description) {
        sendObj.description = description;
    }
    if (category) {
        sendObj.category = category;
    }

    sendObj.page = Math.max(0, page);

    return sendObj;
}

function filterList() {
    clearTimeout(filterListTimer)
    filterListTimer = setTimeout(function() {
        postSearch(getQueryDomValues(0));

    }, 1000)
}

$(document).ready(function() {
    $('.search-input').on('keyup', function() {
        filterList()
    })

    var $listBy = $('.list-by-header');
    if ($listBy.length > 0) {
        var listBy = JSON.parse($listBy.attr("data-obj"));
    }

    $('.button-get-more').on('click tap', () => {
        postSearch(getQueryDomValues(page + 1));
    })

    if (listBy !== undefined && listBy !== null && listBy.search !== undefined && listBy.id !== undefined) {
        var url = SERVER + '/' + listBy.search + 's/register/' + listBy.id;
        $listBy.find('a').attr("href", url)
        getList(setListValues, '/parts/list/' + listBy.search + '/' + listBy.id);
    } else {
        postSearch(getQueryDomValues(0));
    }
});