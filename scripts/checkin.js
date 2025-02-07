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
 *  Setup to notify on large households
 */
let largeFamilyCheckAttempts = 0;
function resetPostCheckinDisplay() {
    largeFamilyCheckAttempts = 0
}
function updatePostCheckinDisplay() {
// quick-click-visit-history-table
    var mostRecentVisitorLink = document.querySelector("#quick-click-visit-history-table > tbody > tr:nth-child(1) > td:nth-child(2) > a");
    console.log("Most Recent Vistor Link Element: ", mostRecentVisitorLink)
    console.log("Checking for " + lastClientName)
    if (mostRecentVisitorLink && mostRecentVisitorLink.innerText.indexOf(lastClientName > 1)) {
        console.log("Found most recent client. Looking for household size");
        mostRecentHouseHoldElement = document.querySelector("#quick-click-visit-history-table > tbody > tr:nth-child(1) > td:nth-child(3)");
        console.log(mostRecentHouseHoldElement)
        if (mostRecentHouseHoldElement) {
            console.log("Extracting number")
            const re = /Household Size: (\d+)/i;
            const found = mostRecentHouseHoldElement.innerText.match(re);
            console.log("Found ", found)
            if (found.length > 0) {
                houseHoldSize = found[1];
                console.log("Household size: " + houseHoldSize)
                houseHoldSize -= 0;
                /* End large family prep */
                let largeFamilyDiv = document.getElementById('largeFamilyDiv');
                if (!largeFamilyDiv) {
                    largeFamilyDiv = document.createElement('div');
                    largeFamilyDiv.id = 'largeFamilyDiv'
                    insertSpot = document.querySelector("#modal-visit-recording > div > div > div.modal-body > div.ph-item.quick-click.no-animation.quick-click-confirmation.program-content-11104")
                    insertSpot.appendChild(largeFamilyDiv);
                }
                if (houseHoldSize >= 5) {
                    largeFamilyDiv.style.fontWeight = 'bold';
                    largeFamilyDiv.style.fontSize = '2em'
                    largeFamilyDiv.innerText = 'Large Family!'
                } else {
                    largeFamilyDiv.innerText = 'Household size: ' + houseHoldSize
                }
            }
        }
    } else {
        console.log("Couldn't find the family size.")
        if (largeFamilyCheckAttempts++ < 3) {
            console.log("Retrying shortly");
            setTimeout(updatePostCheckinDisplay, 500)
        } else {
            console.log("Max attempts reached.  Not retrying")
        }
    }
}
var lastClientName = null;
/*
 * Esignature modal
 */
const targetNode = document.getElementById("esignature-modal");
// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: false, subtree: false };

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.type === "attributes") {
            
            if (targetNode.style.display !== "none") {
                /* Prep to determine if this a large family */
                console.log("Open eSig modal")
                resetPostCheckinDisplay()
                // Get client name
                const nameElements = document.querySelectorAll("#esignature-modal .client-name")
                if (nameElements && nameElements.length) {
                    nameElement = nameElements[0];
                    lastClientName = nameElement.innerText.trim();
                    console.log("Found client name: " + lastClientName)
                }

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
const esigObserver = new MutationObserver(callback);
// Start observing the target node for configured mutations
esigObserver.observe(targetNode, config);

/*
 * VisitRecording modal
 */
const visitRecordingTargetNode = document.getElementById("modal-visit-recording");
// Options for the observer (which mutations to observe)
const visitRecordingConfig = { attributes: true, childList: false, subtree: false };

// Callback function to execute when mutations are observed
const visitRecordingCallback = (mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.type === "attributes") {
            
            if (visitRecordingTargetNode.style.display !== "none") {
                console.log("Opened post-checkin modal");
                updatePostCheckinDisplay()
            }
        }
    }
};

// Create an observer instance linked to the callback function
const visitRecordingObserver = new MutationObserver(visitRecordingCallback);
// Start observing the target node for configured mutations
visitRecordingObserver.observe(visitRecordingTargetNode, visitRecordingConfig);






