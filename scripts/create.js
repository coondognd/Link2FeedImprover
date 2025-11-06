//https://portal.link2feed.com/org/27075/intake/14852358/page/personal


/* 
* TODO: Remove unneeded tabs (e.g. "Assess")
* TODO: Highlight clients in autocomplete who have been there before
*/


function observeElement(element, property, callback, delay = 0) {
    let elementPrototype = Object.getPrototypeOf(element);
    if (elementPrototype.hasOwnProperty(property)) {
        let descriptor = Object.getOwnPropertyDescriptor(elementPrototype, property);
        Object.defineProperty(element, property, {
            get: function () {
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

function checkIn() {

    console.log("Checking In...");
    //const todayYYYYMMDD = new Date().toISOString().split('T')[0];

    const date = new Date(); 

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, so add 1
    const day = date.getDate().toString().padStart(2, '0');

    const todayYYYYMMDD = `${year}-${month}-${day}`;


    const formData = new FormData();
    formData.append('clientIds[]', getClientIdFromURL());
    formData.append('visit_details[0][visit_date]', todayYYYYMMDD);
    formData.append('visit_details[0][program_id]', '11104');
    formData.append('visit_details[0][sign_type]', 'verbal_consent');
    formData.append('visit_details[0][typed_signature]', '');
    formData.append('visit_details[0][pre_typed]', '');
    formData.append('visit_details[0][signed_canvas]', '');
    formData.append('visit_details[0][signatory]', '');
    formData.append('visit_details[0][signatory_other]', '');
    formData.append('visit_details[0][sign_date]', todayYYYYMMDD);
    formData.append('visit_details[0][quick_click]', 'true');
    console.log("Form data prepared:", formData);
    //clientIds%5B%5D=14764723&visit_details%5B0%5D%5Bvisit_date%5D=2025-11-03&visit_details%5B0%5D%5Bprogram_id%5D=11104&visit_details%5B0%5D%5Bsign_type%5D=verbal_consent&visit_details%5B0%5D%5Btyped_signature%5D=&visit_details%5B0%5D%5Bpre_typed%5D=&visit_details%5B0%5D%5Bsigned_canvas%5D=&visit_details%5B0%5D%5Bsignatory%5D=&visit_details%5B0%5D%5Bsignatory_other%5D=&visit_details%5B0%5D%5Bsign_date%5D=2025-11-03&visit_details%5B0%5D%5Bquick_click%5D=true

    const button = document.getElementById("updateAndCheckIn");
    // Post data using the Fetch API
    fetch('https://portal.link2feed.com/org/27075/foodbank/standard-foodbank-visit-attendance', {
        method: 'POST',
        body: formData
    })

        // We turn the response into text as we expect HTML
        .then((res) => res.text())

        // Let's turn it into an HTML document
        .then((text) => new DOMParser().parseFromString(text, 'text/html'))

        // Now we have a document to work with let's replace the <form>
        .then((doc) => {
            button.innerText = "Done!";
        })
        .catch((err) => {
            // Some form of connection failure
            button.innerText = "Whoops, that didn't work!";
            console.error("Error submitting checkIn:", err);
            console.log("Checkin Result: ", res);
            console.log("Checkin text: ", text);
        }).finally(() => { });
}

//function changeToAsync(e) {
function submitFormAsync() {
    console.log("Submitting");
    //console.log(e.target);
    // Prevent the default form submit
    //e.preventDefault();
    //e.stopPropagation();

    // Store reference to form to make later code easier to read
    //const form = e.target;

    const form = document.getElementById("intake_personal_type");
    const button = document.getElementById("updateAndCheckIn");

    console.log("Submitting form asynchronously");
    // Post data using the Fetch API
    fetch(form.action, {
        method: form.method,
        body: new FormData(form),
    })
        // We turn the response into text as we expect HTML
        .then((res) => res.text())

        // Let's turn it into an HTML document
        .then((text) => new DOMParser().parseFromString(text, 'text/html'))

        // Now we have a document to work with let's replace the <form>
        .then((doc) => {

            /*
            // Create result message container and copy HTML from doc
            const result = document.createElement('div');
            result.innerHTML = doc.body.innerHTML;

            // Allow focussing this element with JavaScript
            result.tabIndex = -1;

            // And replace the form with the response children
            form.parentNode.replaceChild(result, form);

            // Move focus to the status message
            result.focus();
            */
            console.log("Profile updated.  Checking In...");
            console.log("Doc: ", doc);

            const button = document.getElementById("updateAndCheckIn");
            button.innerText = "Checking In...";
            checkIn();


        })
        .catch((err) => {
            // Some form of connection failure
            button.innerText = "Whoops, that didn't work!";
            console.error("Error submitting form asynchronously:", err);
            console.log("Result: ", res);
            console.log("Result text: ", text);

        }).finally(() => {
            //form.removeEventListener('submit', changeToAsync);
        });

    // Make sure connection failure message is hidden
    //form.querySelector('[role=alert]').hidden = true;
    // return false;

};

function updateAndCheckIn() {
    const button = document.getElementById("updateAndCheckIn");
    button.disabled = true;
    button.innerText = "Updating profile...";

    const checkboxes = document.querySelectorAll("input[name='intake_personal_type[ethnicities][]']");
    const selectedEthnicities = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    // First, Check that the Ethnicity field has been set
    if (selectedEthnicities.length == 0) {
        // If not, select "Other"
        const ethnicityParentElement = document.getElementsByClassName("ethnicities")[0];
        ethnicityParentElement.querySelector("input[data-type-name=other]").checked = true;
    }
    form = document.getElementById("intake_personal_type");
    //form.addEventListener('submit', changeToAsync);
    //console.log("Clicking Save button");
    //document.getElementById("intake-wizard-save-btn").click();
    //form.submit();
    //form.requestSubmit();
    submitFormAsync();
}

const barCodeStart = '9918';


function getClientIdFromURL() {
    const clientIdStartSpot = document.location.href.indexOf('/intake/') + '/intake/'.length
    const clientIdEndSpot = document.location.href.indexOf('/page/');
    return document.location.href.substring(clientIdStartSpot, clientIdEndSpot);
}

function fixCroton(townName) {

    townName = townName.replace("Croton-on Hudson", "Croton-on-Hudson");
    townName = townName.replace("Croton on-Hudson", "Croton-on-Hudson");
    townName = townName.replace("Croton on Hudson", "Croton-on-Hudson");

    return townName;
}

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
        let phoneTemplate = document.getElementById('client-contact-item-phone-template').innerHTML;
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

    // Shotgun approach to eliminating the Croton-on-Hudson variations
    // TODO:  De-duplicate this code
    let townBox = document.querySelector("#intake_personal_type_household_address_city");
    townBox.addEventListener("input", function () {
        console.log("Input value changed via UI. New value: '%s'", this.value);
        let crotonFix = fixCroton(this.value);
        if (crotonFix != this.value) { // Avoid infinite loop
            this.value = crotonFix;
        }
    });

    observeElement(townBox, "value", function (oldValue, newValue) {
        console.log("Input value changed via API. Value changed from '%s' to '%s'", oldValue, newValue);
        let crotonFix = fixCroton(newValue);
        if (crotonFix != newValue) { // Avoid infinite loop
            townBox.value = crotonFix;
        }

    });
    const addressBox = document.getElementById('intake_personal_type_household_address_addressLine1');
    if (addressBox) {
        addressBox.addEventListener('blur', function () {
            let crotonFix = fixCroton(townBox.value);
            if (crotonFix != townBox.value) { // Avoid infinite loop
                townBox.value = crotonFix;
            }
        });
    }


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
                alertHTML = "Profile Review Required. TEFAP FORM NOT NEEDED. ";
                alertHTML += "<button  id='updateAndCheckIn'>Kevin's SuperFix Button</button>";


                alert.innerHTML = alertHTML;

                superFixButton = document.getElementById("updateAndCheckIn");
                superFixButton.addEventListener("click", updateAndCheckIn);
            }
        }
    }

    // DEBUGGING
    /*
    debugElement = document.getElementById('current-client-name');
    debugElement.innerHTML +="<button  id='updateAndCheckIn'>Kevin's SuperFix Button</button>";
    superFixButton = document.getElementById("updateAndCheckIn");
    superFixButton.addEventListener("click", updateAndCheckIn);
    */

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
            evt.initEvent('change', true, true);
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
        let crotonFix = fixCroton(document.getElementById('intake_personal_type_household_address_city').value);
        document.getElementById('intake_personal_type_household_address_city').value = crotonFix;

        // Put focus back at top
        if (stoleFocus) {
            window.scrollTo(0, 0);
            document.getElementById('intake_personal_type_lastName').focus();
        }
        window.setTimeout(afterSecondDelay, 1000);
    }
    window.setTimeout(afterDelay, 1000);

    function afterSecondDelay() {
        if (document.getElementById('client_phone_is_primary_new0') != null) {
            document.getElementById('client_phone_is_primary_new0').checked = true;
        }
        // Warn on bad barcode
        const idField = document.getElementById('client_identity_document_identifier_new1');
        if (idField != null) {
            idField.addEventListener('keyup', function () {
                const valSoFar = idField.value.substring(0, barCodeStart.length);
                if (idField.value.length > 10) {
                    idField.style.color = '#ff0000';
                } else if (barCodeStart.indexOf(valSoFar) !== 0) {
                    idField.style.color = '#ff9900';
                } else {
                    idField.style.color = '#000000';
                }
            });
            idField.addEventListener('blur', function () {
                if (idField.value.length != 10) {
                    idField.style.color = '#ff0000';
                } else if (idField.value.indexOf(barCodeStart) != 0) {
                    idField.style.color = '#ff9900';
                }
            });
            // Remove error highlight when editing the field
            idField.addEventListener('focus', function () {
                idField.style.color = '#000000';
            });
        }
    }
    // TODO: Make an age box, and set date and check approximate box  

    // TODO: Monitor address for "Croton on Hudson", and add dashes
} else if (document.location.href.indexOf("/page/monthly-income") > -1) {
    const clientId = getClientIdFromURL();

    // Autocomplete income portion
    // Click Add, select Undisclosed
    const incomeDiv = document.getElementById('client-income-' + clientId + '-template');
    if (incomeDiv) {
        let incomeTemplate = incomeDiv.innerHTML;
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
            window.scrollTo(0, 0);
        }
        window.setTimeout(afterSecondDelay, 1000);
    }
    window.setTimeout(afterDelay, 1000);


    function afterSecondDelay() {
        if (document.getElementById('client_income_is_primary_new0') != null) {
            document.getElementById('client_income_is_primary_new0').checked = true;
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

        const sessionDateElement = document.querySelector("#client-visit-events-" + clientId + " > tbody > tr.odd > td.sorting_1");

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