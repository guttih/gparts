const enableButtonLocate = (bEnable) => {
    $('.view.part button.locate').prop('disabled', !bEnable);
}

function runLocationActionUrl() {
    if (typeof item === 'undefined' || item === 'undefined' ||
        item.locations === undefined || item.locations === "") {
        return;
    }
    actionLocations = item.locations.filter(e => e.action);
    var delay = 3000;
    actionLocations.forEach((e, index) => {
        setTimeout(() => {
            requestData('/locations/run-action/' + e.id, function(data) {}, function(data) {
                console.log("Unable to get data", data);
            });
        }, delay * index);
    })
}

$(document).ready(function() {
    $('.view.part button.locate').on('click', function(e) {
        runLocationActionUrl();
    });


    $(".hide-if-small-height").each(function() {
        var testHeight = document.body.scrollHeight * 1.4;
        var windowInnerHeight = Number(window.innerHeight) * 2;
        if (testHeight < windowInnerHeight) {
            $(this).addClass('hidden');
        }
    });
    runLocationActionUrl();

});