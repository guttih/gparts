function setFormValues(item) {

    if (typeof item !== 'undefined' && item !== 'undefined') {

        if (item.action !== undefined && item.action !== null && item.action.length > 0) {
            $("#item_action").val(item.action);
        }

        if (item.name !== undefined) {
            $("#name").val(item.name);
        }

        if (item.data !== undefined) {
            $("#data").val(item.data);
        }

        if (item.description !== undefined) {
            $("#description").val(item.description);
        }

        var action = document.getElementById('register-form').action;

        if (item.id !== undefined) {
            action += '/' + item.id;
        }

        if (item.partCount) {
            const oldText = $('#btnView').text();
            $('#btnView').text(`${oldText} (${item.partCount})`)
        }


        document.getElementById('register-form').action = action;
        RegisterViewButtonClick();
        onDataChange();
        runAction(item);
    }
}

//use this function to validate the form values
function validateFormValues() {
    var strName = $('#name').val();

    if (strName === undefined || strName.length < 1) {
        showModalErrorText('Name is missing', 'You must provide a name.');
        return false;
    }
    return true;
}

var onDataChange = function onDataChange() {
    var url = "";
    var actionId = $('#item_action').val();
    var data = $('#data').val();
    if (data === undefined) { data = ""; }
    var actionFiltered = (typeof actions !== 'undefined' && actions !== 'undefined' && actions.length > 0) ?
        actions.filter(item => item.id === actionId) :
        [];

    if (actionFiltered.length > 0 && actionId.length > 0) {
        url = actionFiltered[0].url.replace("<<DATA>>", data);
    }
    $('#url').text(url);
};

var onSelectActionChange = function onSelectActionChange() {

    var val = $('#item_action').val();
    if (val === '') {
        $('.url').hide();
    } else {
        $('.url').show();
    }
    onDataChange();
};

function setFormActionOptions() {

    if (typeof actions !== 'undefined' && actions !== 'undefined' && actions.length > 0) {
        //There are some actions
        actions.forEach(function(element) {
            $("#item_action").append(new Option(element.name, element.id));
            //Now we need to get the location data
        });

    } else {
        //No action exists so let's not show it
        $('.action-related').hide();
        console.log('actions do not exist');
    }
}

function runAction(item) {
    requestData('/locations/run-action/' + item.id,
        function(data) {
            console.log("got data", data);
        },
        function(data) {
            console.log("Unable to get data", data);
        });
}

$(document).ready(function() {
    setFormActionOptions();
    initRegister();
    deleteButtonClickRegister('locations');
    cloneButtonClickRegister('locations');
    onSelectActionChange();
    $('#item_action').on('change', function() {
        onSelectActionChange();
    });
    $('#data').on('keyup change', function() {
        onDataChange();
    });


});