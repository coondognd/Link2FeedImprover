    //https://portal.link2feed.com/org/27075/intake/14852358/page/personal

    // Precheck all the fields!

    console.log(document.location.href);

    if (document.location.href.indexOf('/page/personal') > -1) {
        //  Consents
        if (document.forms['intake_personal_type'] && document.forms['intake_personal_type']['intake_personal_type[consentVerbal]'].value == '') {
            document.forms['intake_personal_type']['intake_personal_type[consentVerbal]'].value = 1;
        }
        if (document.forms['intake_personal_type'] && document.forms['intake_personal_type']['intake_personal_type[consentWritten]'].value == '') {
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
        if (document.getElementById('client-contact-item-phone-template')) {
            let phoneTemplate =  document.getElementById('client-contact-item-phone-template').innerHTML;
            phoneTemplate = phoneTemplate.replace('<option value="home" selected="selected">Home</option>', '<option value="home">Home</option>');
            phoneTemplate = phoneTemplate.replace('<option value="mobile" >Mobile</option>', '<option value="mobile" selected="selected">Mobile</option>')
            document.getElementById('client-contact-item-phone-template').innerHTML = phoneTemplate;
        }
        // Barcode
        if (document.getElementById('intake_personal_type-identity-document-template')) {
            let barcodeTemplate = document.getElementById('intake_personal_type-identity-document-template').innerHTML;
            barcodeTemplate = barcodeTemplate.replace('<option value="10404">Barcode</option>', '<option value="10404" selected="selected">Barcode</option>')
            document.getElementById('intake_personal_type-identity-document-template').innerHTML = barcodeTemplate;
        }

        const targetNode = document.getElementById("hh-member-modal-container");
        // Options for the observer (which mutations to observe)
        const config = { attributes: true, childList: false, subtree: false };
        
        // Callback function to execute when mutations are observed
        const callback = (mutationList, observer) => {
            for (const mutation of mutationList) {
            if (mutation.type === "attributes") {
                //console.log(mutation);
                if (targetNode.style.display !== "none") {
                    window.setTimeout(function() {
                        //console.log(document.getElementById("intake_household_member_type_ethnicities_18513"));
                        //console.log(document.getElementById("intake_household_member_type_ethnicities_18513").selected)
                        document.getElementById("intake_household_member_type_ethnicities_18513").checked = true;
                    }, 1000);
                }
            }
            }
        };
        
        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);
        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
    

        // Some changes can only happen after page loads.
        // TODO: Change from timeout to something more reliably
        function afterDelay() {

            let stoleFocus = false;
            // Open phone and barcode fields.  Will steal focus
            if (document.getElementsByClassName('phone-number').length == 0) {
                document.getElementById('client-contact-phone-new').click();
                stoleFocus = true;
            }
            if (document.getElementsByClassName('identification_type').length == 0) {
                document.getElementById('intake_personal_type-identity-document-new').click();
                stoleFocus = true;
            }
            // Ethnicity
            document.getElementById('intake_personal_type_ethnicities_18513').checked = true;

            // Put focus back at top
            if (stoleFocus) {
                window.scrollTo(0,0);
                document.getElementById('intake_personal_type_lastName').focus();
            }
            window.setTimeout(afterSecondDelay, 1000);
        }
        window.setTimeout(afterDelay, 1000);  
        
        function afterSecondDelay() {
            if (document.getElementById('client_phone_is_primary_new0') != null) {
                document.getElementById('client_phone_is_primary_new0').checked= true;
            }
            const idField = document.getElementById('client_identity_document_identifier_new1');
            if (idField != null) {
                idField.addEventListener('keyup', function() {
                    const valSoFar = idField.value.substring(0,7);
                    if ('9918222'.indexOf(valSoFar) !== 0) {
                        idField.style.color = '#ff0000';
                    } else {
                        idField.style.color = '#000000';
                    }
                });
                idField.addEventListener('blur', function() {
                    if (idField.value.length != 10 || idField.value.indexOf('9918222') != 0 ) {
                        idField.style.color = '#ff0000';
                    }
                });
                idField.addEventListener('focus', function() {
                    idField.style.color = '#000000';
                });
            }
        }
        // Make an age box, and set date and check approximate box  
    } else if (document.location.href.indexOf("/page/monthly-income") > -1) {
        const clientIdStartSpot = document.location.href.indexOf('/intake/') + '/intake/'.length
        const clientIdEndSpot = document.location.href.indexOf('/page/monthly-income');
        const clientId = document.location.href.substring(clientIdStartSpot, clientIdEndSpot);

        // Autocomplete income portion
        // https://portal.link2feed.com/org/27075/intake/14852239/page/monthly-income
        // Click Add, select Undisclosed
        const incomeDiv = document.getElementById('client-income-' + clientId + '-template');
        if (incomeDiv) {
            let incomeTemplate =  incomeDiv.innerHTML;
            incomeTemplate = incomeTemplate.replace('<option value="10405">Undisclosed</option>', '<option value="10405" selected="selected">Undisclosed</option>')
            incomeDiv.innerHTML = incomeTemplate;
        }
        
        // Some changes can only happen after page loads.
        // TODO: Change from timeout to something more reliably
        function afterDelay() {

            let stoleFocus = false;

            if (document.getElementsByClassName('primary-income-field').length == 0) {
                document.getElementsByClassName('btn-add-income')[0].click();
                stoleFocus = true;
            }
            
            // Put focus back at top
            if (stoleFocus) {
                window.scrollTo(0,0);
            }
            window.setTimeout(afterSecondDelay, 1000);
        }
        window.setTimeout(afterDelay, 1000);


        function afterSecondDelay() {
            if (document.getElementById('client_income_is_primary_new0') != null) {
                document.getElementById('client_income_is_primary_new0').checked= true;
            }
        }
    } else if (document.location.href.indexOf("/page/dietary-considerations") > -1) {
        function afterDelay() {

           
            // Ethnicity
            document.getElementById('intake_dietary_considerations_type_dietaryConsiderations_18531').checked = true;

        }
        window.setTimeout(afterDelay, 500);
    }
    //

    // Verify barcode on submit
    // Ethnicity for Household members

    //https://portal.link2feed.com/org/27075/intake/14881254/page/dietary-considerations
    // Check "Didn't Ask"
    // intake_dietary_considerations_type_dietaryConsiderations_18531 .checked = true