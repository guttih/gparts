var listBy = null;
var page = 0;

var PageProperties = {
    addViewButton: false,
    removeEditButton: false,
}

var listFactory = {
    getServer: function() {
        return window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    },
    getSearchValues: function() {
        var ret = [];
        $('.search-input').each(function() {
            var $el = $(this)
            var name = $el.attr('data-property-name');
            if (!name) name = $el.attr('name');
            ret.push({ name: name, value: $el.val() })
        });
        return ret;
    },
    makeListSortItem: function(dataMethod, text, reverse) {
        if (reverse)
            return `<li><a href="#" data-method="${dataMethod}Desc">${text} descending</a></li>`;

        return `<li><a href="#" data-method="${dataMethod}">${text}</a></li>`;
    },
    init: function() {
        var dropdownList = $('.sorting.dropdown  > ul');
        var searchValues = this.getSearchValues();
        var that = this;
        dropdownList.prepend(that.makeListSortItem('$natural', 'Created', true));
        dropdownList.prepend(that.makeListSortItem('$natural', 'Created'));
        searchValues.forEach(item => {
            dropdownList.append(that.makeListSortItem(item.name, capitalize(item.name)));
            dropdownList.append(that.makeListSortItem(item.name, capitalize(item.name), true));
        });
        // })
        // <li><a href="#" data-method="name">Name</a></li>
        // 		<li><a href="#" data-method="nameDesc">Name descending</a></li>
        console.log('listFactory.init()')
        $('.sorting.dropdown  > ul > li a').on('click tap', (event) => {
            var $el = $(event.target);
            var text = $el.text()
            var text = text[0].toLowerCase() + text.slice(1);
            var sortingMethod = $el.attr('data-method');
            $('.sorting.dropdown .sorting-text').text(text).attr('data-method', sortingMethod);

            this.postSearch(this.getQueryDomValues(0))
        })
        this.postSearch(this.getQueryDomValues(0))
    },
    showLoading: function(showSpinner) {
        if (showSpinner) {
            $('.spinner').addClass('active')
            $('.list-count .values').addClass('hidden')
        } else {
            $('.spinner').removeClass('active')
            $('.list-count .values').removeClass('hidden')

        }
    },

    getQueryDomValues: function(page, sortingMethod) {

        var sendObj = {};
        var searchValues = this.getSearchValues();
        searchValues.forEach(item => {
            sendObj[item.name] = item.value;
        });

        $listBy = $('.listby');
        if ($listBy.length) {
            const collection = $listBy.attr('data-collection')
            const collectionId = $listBy.attr('data-collection-id')
            if (collection && collectionId) {
                sendObj.collectionName = collection
                sendObj.collectionId = collectionId;
            }
        }
        // $('.search-input').each(function() {
        //     var $el = $(this)
        //     var vals = { name: $el.attr('name'), value: $el.val() };
        //     if (vals.name && vals.value)
        //         sendObj[vals.name] = vals.value;
        // });

        sendObj.page = Math.max(0, page);

        if (sortingMethod) {
            sendObj.sortingMethod = sortingMethod;
        } else {
            var method = $('.sorting.dropdown .sorting-text').attr('data-method');
            if (method) {
                sendObj.sortingMethod = method;
            }
        }

        return sendObj;
    },
    postSearch: function(query) {
        console.log('posting')
        const sendObj = query ? query : {};
        var path = $('.search-inputs').attr('data-url');
        path = path ? decodeURIComponent(path) : `/${$('.search-inputs').attr('data-name')}s/search`;
        this.SERVER = SERVER;
        return new Promise((resolve, reject) => {
            var url = listFactory.SERVER + path;
            this.showLoading(true);
            var posting = $.post(url, sendObj);
            console.log(`postSearch: ${url}: ${JSON.stringify(sendObj, null, 4)}`)
            posting
                .done(function(data) {
                    listFactory.showLoading(false)
                    listFactory.setListValues(data)
                    resolve(data)
                })
                .fail(function(err) {
                    listFactory.showLoading(false)
                    console.log(`Failed ${JSON.stringify(err, null, 4)}`)
                    showModalErrorMsg('Error retriving list', err);
                    reject(err);
                });
        })
    },
    filterListTimer: 0,
    filterList: function() {
        clearTimeout(listFactory.filterListTimer)
        listFactory.filterListTimer = setTimeout(function() {
            listFactory.postSearch(listFactory.getQueryDomValues(0));

        }, 1000)
    },

    setListValues: function(data) {

        var dataName = $('.search-inputs').attr('data-name') + 's';
        var id, name, description, topLeft;

        if (!data.page) {
            $("#list").empty();
        }
        page = data.page;
        list = data.result;
        if (list.length) {
            const keys = Object.keys(list[0]);
            //todo: what is the best way to select replacement for description
            const descKey = keys.includes('description') ? 'description' : keys[2];

            for (var i = 0; i < list.length; i++) {
                const item = list[i];
                id = item.id;
                name = item.name;
                description = item[descKey];
                src = item.src;
                topLeft = item.size ? bytesToUnitString(item.size, 2) : '';
                var str = createListItem(id, name, description, topLeft, dataName, false, false, true, true, src);
                $("#list").append(str);
            }
        }

        var itemCount = (data.page + 1) * data.itemsPerPage;
        if (itemCount >= data.count) {
            //This is the last page
            itemCount = data.count;
            $('.button-get-more').removeClass('hidden').addClass('hidden')
        } else {
            $('.button-get-more').removeClass('hidden');
        }

        listFactory.updateListCount(data.count, `${itemCount} of `);
    },
    updateListCount: function(newCount, prefix) {
        if (newCount === undefined || newCount === null) {
            newCount = $('.list-group-item-heading').length;
        }
        var e = $('.list-count');
        var strItem = $('.search-inputs').attr('data-name')
        strItem += (newCount > 1) ? 's' : '';
        e.find('.text').text(strItem);
        e.find('.number').text(newCount); {
            e.find('.prefix').text(prefix ? prefix : '');
        }
    }

}


$(document).ready(function() {
    listFactory.init();
    $('.search-input').on('keyup', function() {
        listFactory.filterList()
    })

    $('.button-get-more').on('click tap', () => {
        listFactory.postSearch(listFactory.getQueryDomValues(page + 1));
    })
});