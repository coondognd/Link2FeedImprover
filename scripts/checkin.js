
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
