function findActionById(actionId) {
    // return actions.find(action => action.id === id);
    var actionFiltered = (typeof actions !== 'undefined' && actions !== 'undefined' && actions.length > 0) ?
    actions.filter(item => item.id === actionId) : [];
    if (actionFiltered.length > 0) {
        return actionFiltered[0];
    }
}

function enableDataInput(dataInputId) {
    var enableId, disableId;
    if (dataInputId === 'dataInputGroupPost') {
        enableId = 'dataInputGroupPost';
        disableId = 'dataInputGroupGet';
    } else {
        enableId = 'dataInputGroupGet';
        disableId = 'dataInputGroupPost';
    }
    $('#' + disableId).hide();
    $('#' + enableId).show();
    $('#' + disableId).attr('name', '');
    $('#' + enableId).attr('name', 'data');
}

function setFormValues(item) {
    if (typeof item !== 'undefined' && item !== 'undefined') {

        if (item.action !== undefined && item.action !== null && item.action.length > 0) {
            $("#item_action").val(item.action);
        }

        if (item.name !== undefined) {
            $("#name").val(item.name);
        }
        var currAction = findActionById(item.action);

        if (currAction.type === 'HTTP_POST') {
            enableDataInput('dataInputGroupPost');
        }
        else {
            enableDataInput('dataInputGroupGet');
        }

        if (item.data !== undefined) {
            if (currAction) {
                $('form [name="data"]').val(item.data)
            }
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
    var data = $('form [name="data"]').val();
    var currAction = findActionById(actionId);
    if (data ) { 
        url = currAction.url.replace("<<DATA>>", data); 
    }

    if (currAction) {
        if (currAction.type === 'HTTP_POST') {
            enableDataInput('dataInputGroupPost');
        }
        else {
            enableDataInput('dataInputGroupGet');
        }
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
    var data = $('form [name="data"]').val();
    onDataChange();
    $('form [name="data"]').val(data);
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
    $('#dataInputGroupGet, #dataInputGroupPost').on('keyup change', function() {
        onDataChange();
    });
});