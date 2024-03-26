
const checkInPage = 'https://portal.link2feed.com/org/27075/'

if (tab.url === checkInPage) {

    /*
     *  Move Searchbox up
     */

    const elementToMove = document.querySelector('.add-margin-b');
    const referenceElement = document.querySelector('.page-header');
    referenceElement.parentNode.insertBefore(elementToMove, referenceElement.nextSibling);


    /*
     *  Change default attestation type
     */
    const targetNode = document.getElementById("esignature-modal");
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: false, subtree: false };
    
    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
        if (mutation.type === "attributes") {
            console.log(mutation);
            if (targetNode.style.display !== "none") {
            document.getElementById('quick_click-form-esig-signature-type').options[2].selected = true;
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent('change', true, true );
            document.getElementById('quick_click-form-esig-signature-type').dispatchEvent(evt);
            }
        }
        }
    };
    
    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
} else if (tab.url.startsWith('https://portal.link2feed.com/org/27075/intake')) {


    // Precheck all the fields!

    // Verbal consent
    if (document.forms['intake_personal_type']['intake_personal_type[consentVerbal]'].value == '') {
        document.forms['intake_personal_type']['intake_personal_type[consentVerbal]'].value = 1;
    }
    if (document.forms['intake_personal_type']['intake_personal_type[consentWritten]'].value == '') {
        document.forms['intake_personal_type']['intake_personal_type[consentWritten]'].value = 1;
    }
    // Default phone to mobile
    document.getElementById('client-contact-phone-new').click();
    // Defauly id to barcode
    if (document.getElementById('s2id_client_identity_identity_type_new0') == null) {
        document.getElementById('intake_personal_type-identity-document-new').click();
    }

}

