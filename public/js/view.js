const enableButtonLocate = (bEnable) => {
    $('.view.part button.locate').prop('disabled', !bEnable);
}

function runLocationActionUrl() {

    enableButtonLocate(false);

    requestData('/locations/run-action/' + item.location.id, function() {
        enableButtonLocate(true);
    }, function(err) {
        showModalErrorText('Unable to run the locate action', "Problem with running the associated action");
        enableButtonLocate(true);
    });

}

$(document).ready(function() {
    $('.view.part button.locate').on('click', function(e) {
        runLocationActionUrl()
    });


    $(".hide-if-small-height").each(function() {
        var testHeight = document.body.scrollHeight * 1.4;
        var windowInnerHeight = Number(window.innerHeight) * 2;
        if (testHeight < windowInnerHeight) {
            $(this).addClass('hidden');
        }
    });

});