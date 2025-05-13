    //https://portal.link2feed.com/org/27075/intake/14852358/page/personal


    /* 
    * TODO: Remove unneeded tabs (e.g. "Assess")
    * TODO: Replace "Croton on Hudson" on input field onChange. (Avoid infinite loop)
    * TODO; Add custom improved error messages.  e.g. "Recertification required" vs "Review required"
    */

    
    function observeElement(element, property, callback, delay = 0) {
        let elementPrototype = Object.getPrototypeOf(element);
        if (elementPrototype.hasOwnProperty(property)) {
            let descriptor = Object.getOwnPropertyDescriptor(elementPrototype, property);
            Object.defineProperty(element, property, {
                get: function() {
                    return descriptor.get.apply(this, arguments);
                },
                set: function () {
                    let oldValue = this[property];
                    descriptor.set.apply(this, arguments);
                    let newValue = this[property];
                    if (typeof callback == "function") {
                        setTimeout(callback.bind(this, oldValue, newValue), delay);
                    }
                    return newValue;
                }
            });
        }
    }

    const API_URL = "https://ccfp.geniusstrikes.com/checkin.php";

    function recordCheckin(clientId, sessionDate) {
        const authHeader = "Basic Y2NmcF9hcGlfdXNlcjpDQ0ZQYW50cnk4MyE=";
        
        fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                clientid: clientId,
                session_date: sessionDate
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Response:", data);
        })
        .catch(error => {
            console.error("Error:", error);
        });
    }
    

    const barCodeStart = '9918';
    // Precheck all the fields!


    if (document.location.href.indexOf('/page/personal') > -1) {
        //  Consents
        if (document.forms['intake_personal_type'] && document.forms['intake_personal_type']['intake_personal_type[consentVerbal]'].value == '') {
            document.forms['intake_personal_type']['intake_personal_type[consentVerbal]'].value = 1;
        }
        if (document.forms['intake_personal_type'] && document.forms['intake_personal_type']['intake_personal_type[consentWritten]'].value == '') {
            document.forms['intake_personal_type']['intake_personal_type[consentWritten]'].value = 1;
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

        let townBox = document.querySelector("#intake_personal_type_household_address_city");

        townBox.addEventListener("input", function () {
            console.log("Input value changed via UI. New value: '%s'", this.value);
            let crotonFix = this.value;
            crotonFix = crotonFix.replace("Croton-on Hudson", "Croton-on-Hudson");
            crotonFix = crotonFix.replace("Croton on-Hudson", "Croton-on-Hudson");
            crotonFix = crotonFix.replace("Croton on Hudson", "Croton-on-Hudson");
            if (crotonFix != this.value) { // Avoid infinite loop
                this.value = crotonFix;
            }
        });
        
        observeElement(townBox, "value", function (oldValue, newValue) {
            console.log("Input value changed via API. Value changed from '%s' to '%s'", oldValue, newValue);
            let crotonFix = newValue;
            crotonFix = crotonFix.replace("Croton-on Hudson", "Croton-on-Hudson");
            crotonFix = crotonFix.replace("Croton on-Hudson", "Croton-on-Hudson");
            crotonFix = crotonFix.replace("Croton on Hudson", "Croton-on-Hudson");
            if (crotonFix != newValue) { // Avoid infinite loop
                townBox.value = crotonFix;
            }

        });


        // Alerts 
        let alerts = document.querySelectorAll(".alert .pull-left");
        let tefapRequired = false;
        for (const alert of alerts) {
            if (alert.innerText === "Recertification Required") {
                alert.innerText = "TEFAP Recertification Required. Give client TEFAP form";
                tefapRequired = true;
            } else if (alert.innerText === "Profile Review Required") {
                let alertParent = alert.closest(".alert");
                if (tefapRequired) { 
                    alertParent.remove(); // No need for multiple alerts
                } else {
                    alert.innerText = "Profile Review Required. TEFAP FORM NOT NEEDED";
                }
            }
        }
        /*
        // Ethnicity
        const targetNode = document.getElementById("hh-member-modal-container" );
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
                        
                        // TODO:  Only do this if nothing is set
                        //document.getElementById("intake_household_member_type_ethnicities_18513").checked = true;
                       
                    }, 1000);
                }
            }
            }
        };
        
        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);
        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
        */

        // Some changes can only happen after page loads.
        // TODO: Change from timeout to something more reliably
        function afterDelay() {

            // First visit
            if (document.getElementById('intake_personal_type_firstFoodBankVisit_selector').selectedIndex == 0) {

                document.getElementById('intake_personal_type_firstFoodBankVisit_selector').options[3].selected = true;
            
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent('change', true, true );
                document.getElementById('intake_personal_type_firstFoodBankVisit_selector').dispatchEvent(evt);

            }

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
            // Commenting out, as no longer needed
            //document.getElementById('intake_personal_type_ethnicities_18513').checked = true; 

            // Correct "Croton-on Hudson"
            // Only a problem for some users early on in L2F
            let crotonFix = document.getElementById('intake_personal_type_household_address_city').value;
            crotonFix = crotonFix.replace("Croton-on Hudson", "Croton-on-Hudson");
            crotonFix = crotonFix.replace("Croton on-Hudson", "Croton-on-Hudson");
            crotonFix = crotonFix.replace("Croton on Hudson", "Croton-on-Hudson");
            document.getElementById('intake_personal_type_household_address_city').value = crotonFix;
    
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
            // Warn on bad barcode
            const idField = document.getElementById('client_identity_document_identifier_new1');
            if (idField != null) {
                idField.addEventListener('keyup', function() {
                    const valSoFar = idField.value.substring(0,barCodeStart.length);
                    if (idField.value.length > 10) {
                        idField.style.color = '#ff0000';
                    } else if (barCodeStart.indexOf(valSoFar) !== 0) {
                        idField.style.color = '#ff9900';
                    } else {
                        idField.style.color = '#000000';
                    }
                });
                idField.addEventListener('blur', function() {
                    if (idField.value.length != 10) {
                        idField.style.color = '#ff0000';
                    } else if (idField.value.indexOf(barCodeStart) != 0 ) {
                        idField.style.color = '#ff9900';
                    }
                });
                // Remove error highlight when editing the field
                idField.addEventListener('focus', function() {
                    idField.style.color = '#000000';
                });
            }
        }
        // TODO: Make an age box, and set date and check approximate box  

        // TODO: Monitor address for "Croton on Hudson", and add dashes
    } else if (document.location.href.indexOf("/page/monthly-income") > -1) {
        const clientIdStartSpot = document.location.href.indexOf('/intake/') + '/intake/'.length
        const clientIdEndSpot = document.location.href.indexOf('/page/monthly-income');
        const clientId = document.location.href.substring(clientIdStartSpot, clientIdEndSpot);

        // Autocomplete income portion
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
    /*
    } else if (document.location.href.indexOf("/page/dietary-considerations") > -1) {
        function afterDelay() {

           
            // TODO:  Only do this if nothing is set
            document.getElementById('intake_dietary_considerations_type_dietaryConsiderations_18531').checked = true;

        }
        window.setTimeout(afterDelay, 500);
    */
    } else if (document.location.href.indexOf('visit_recorded=1') > -1) {
        // Record checkins
        function afterDelay() {

            const clientIdStartSpot = document.location.href.indexOf('/intake/') + '/intake/'.length
            const clientIdEndSpot = document.location.href.indexOf('/page/services');
            const clientId = document.location.href.substring(clientIdStartSpot, clientIdEndSpot);
            console.log("Client: " + clientId);
            const sessionDateElement = document.querySelector("#client-visit-events-" + clientId + " > tbody > tr.odd > td.sorting_1");
            console.log(sessionDateElement);
            if (sessionDateElement) {
                const sessionDateMMDDYY = sessionDateElement.innerText
                // Change mm-dd-YYYY to YYYY-mm-dd
                const sessionDateParts = sessionDateMMDDYY.split("-");
                if (sessionDateParts.length > 2) {
                    const sessionDate = sessionDateParts[2] + "-" + sessionDateParts[0] + "-" + sessionDateParts[1];
                    recordCheckin(clientId, sessionDate);
                }
            }

        }
        window.setTimeout(afterDelay, 1000);
    }