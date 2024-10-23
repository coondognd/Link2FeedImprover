/*
 *  Move Searchbox up
 */

const elementToMove = document.querySelector('.add-margin-b');
const referenceElement = document.querySelector('.page-header');
if (referenceElement && elementToMove) {
    referenceElement.parentNode.insertBefore(elementToMove, referenceElement.nextSibling);
}

/*
 * Hide Quick Click, to prevent accidental change
 */
document.getElementById("quick-click-panel").style.display = 'none';

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
                /*
                document.getElementById('quick_click-form-esig-signature-type').options[2].selected = true;
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent('change', true, true);
                document.getElementById('quick_click-form-esig-signature-type').dispatchEvent(evt);
                */
                // Add Edit link next to client name
                /*
                const nameElements = document.querySelectorAll("#esignature-modal .client-name")
                if (nameElements && nameElements.length) {
                    nameElement = nameElements[0];
                    nameElement.innerHTML += "&nbsp;<a href='/org/27075/intake/" + qcvisit.clientId + "/page/personal?search=true'>Edit in new Tab</a>";
                }
                */

                // #esignature-modal <somestuff> .clint-name 
            }
        }
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);
// Start observing the target node for configured mutations
observer.observe(targetNode, config);

