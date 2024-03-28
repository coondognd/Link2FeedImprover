    //https://portal.link2feed.com/org/27075/intake/14852358/page/personal

    // Precheck all the fields!

    //  Consents
    if (document.forms['intake_personal_type']['intake_personal_type[consentVerbal]'].value == '') {
        document.forms['intake_personal_type']['intake_personal_type[consentVerbal]'].value = 1;
    }
    if (document.forms['intake_personal_type']['intake_personal_type[consentWritten]'].value == '') {
        document.forms['intake_personal_type']['intake_personal_type[consentWritten]'].value = 1;
    }

    // First visit
    if (document.getElementById('intake_personal_type_firstFoodBankVisit_selector').selectedIndex == 0) {

        document.getElementById('intake_personal_type_firstFoodBankVisit_selector').options[1].selected = true;
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent('change', true, true );
        document.getElementById('intake_personal_type_firstFoodBankVisit_selector').dispatchEvent(evt);

    }

    // Phone Number
    let phoneTemplate =  document.getElementById('client-contact-item-phone-template').innerHTML;
    phoneTemplate = phoneTemplate.replace('<option value="home" selected="selected">Home</option>', '<option value="home">Home</option>');
    phoneTemplate = phoneTemplate.replace('<option value="mobile" >Mobile</option>', '<option value="mobile" selected="selected">Mobile</option>')
    document.getElementById('client-contact-item-phone-template').innerHTML = phoneTemplate;

    // Barcode
    let barcodeTemplate =  document.getElementById('intake_personal_type-identity-document-template').innerHTML;
    barcodeTemplate = barcodeTemplate.replace('<option value="10404">Barcode</option>', '<option value="10404" selected="selecte">Barcode</option>')
    document.getElementById('intake_personal_type-identity-document-template').innerHTML = barcodeTemplate;

    // Ethnicity
    //window.setTimeout(function() {document.getElementById('intake_personal_type_ethnicities_18513').checked = true}, 500);

    // Open phone and barcode fields
    // - Disabled because it makes the page scroll down
    function afterDelay() {
        if (document.getElementsByClassName('phone-number').length == 0) {
            document.getElementById('client-contact-phone-new').click();
        }
        if (document.getElementById('s2id_client_identity_identity_type_new0') == null) {
            document.getElementById('intake_personal_type-identity-document-new').click();
        }
        document.getElementById('intake_personal_type_ethnicities_18513').checked = true;
        window.scrollTo(0,0);
        document.getElementById('intake_personal_type_lastName').focus();
    }
    window.setTimeout(afterDelay, 1000);
    //

    // Autocomplete income portion
    // https://portal.link2feed.com/org/27075/intake/14852239/page/monthly-income

    // Verify barcode on submit
