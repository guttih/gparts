var listBy = null;
var page = 0;



function filterDomList() {
    var inputs = document.querySelectorAll('.search-input');
    const queryWords = []
    inputs.forEach(e => { if (e.value) { queryWords.push(e.value.toLowerCase()) } })

    var items = document.querySelectorAll('#list .list-group-item');
    if (!items) {
        listFactory.updateListCount(items.length);
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
    listFactory.updateListCount(list.length, `${visibleItemCount} of`);
}



$(document).ready(function() {


    // if (listBy !== undefined && listBy !== null && listBy.search !== undefined && listBy.id !== undefined) {
    //     var url = SERVER + '/' + listBy.search + 's/register/' + listBy.id;
    //     $listBy.find('a').attr("href", url)
    //     getList(listFactory.setListValues, '/parts/list/' + listBy.search + '/' + listBy.id);
    // } else {
    //     listFactory.postSearch(listFactory.getQueryDomValues(0));
    // }
});