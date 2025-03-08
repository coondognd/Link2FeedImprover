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



/*
 *  Setup to notify on large households
 */
function updatePostCheckinDisplay(lastClientName, attemptNumber) {
    if (!attemptNumber) {
        attemptNumber = 1;
    }
// quick-click-visit-history-table
    var mostRecentVisitorLink = document.querySelector("#quick-click-visit-history-table > tbody > tr:nth-child(1) > td:nth-child(2) > a");
    //console.log("Most Recent Vistor Link Element: ", mostRecentVisitorLink)
    //console.log("Checking for " + lastClientName)
    //console.log("Name to compare: " +  mostRecentVisitorLink.innerText)
    if (mostRecentVisitorLink && mostRecentVisitorLink.innerText.indexOf(lastClientName) > -1) {
        //console.log("Found most recent client. Looking for household size");
        // Example usage:
        clientIdElement = document.querySelector("#quick-click-visit-history-table > tbody > tr:nth-child(1) > td:nth-child(1) > a");
        if (clientIdElement) {
            recordCheckin(clientIdElement.innerText.trim(), new Date().toISOString().split('T')[0]);
        }
        mostRecentHouseHoldElement = document.querySelector("#quick-click-visit-history-table > tbody > tr:nth-child(1) > td:nth-child(3)");
        //console.log(mostRecentHouseHoldElement)
        if (mostRecentHouseHoldElement) {
            //console.log("Extracting number")
            const re = /Household Size: (\d+)/i;
            const found = mostRecentHouseHoldElement.innerText.match(re);
            //console.log("Found ", found)
            if (found.length > 0) {
                houseHoldSize = found[1];
                //console.log("Household size: " + houseHoldSize)
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
//                    largeFamilyDiv.innerText = 'Large Family!'
                } //else {
                    largeFamilyDiv.innerText = 'Household size: ' + houseHoldSize
                //}
            }
        }
    } else {
        //console.log("Couldn't find the family size.")
        if (attemptNumber <= 3) {
            attemptNumber++;
            //console.log("Retrying shortly");
            setTimeout(function() {updatePostCheckinDisplay(lastClientName, attemptNumber)}, 500)
        } else {
            //console.log("Max attempts reached.  Not retrying")
        }
    }
}
/*
 * Esignature modal
 */
/*
const targetNode = document.getElementById("esignature-modal");
// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: false, subtree: false };

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.type === "attributes") {
            
            if (targetNode.style.display !== "none") {
                //console.log("Open eSig modal")

                
                //document.getElementById('quick_click-form-esig-signature-type').options[2].selected = true;
                //var evt = document.createEvent("HTMLEvents");
                //evt.initEvent('change', true, true);
                //document.getElementById('quick_click-form-esig-signature-type').dispatchEvent(evt);
                
                // Add Edit link next to client name
                //const nameElements = document.querySelectorAll("#esignature-modal .client-name")
                //if (nameElements && nameElements.length) {
                //    nameElement = nameElements[0];
                //    nameElement.innerHTML += "&nbsp;<a href='/org/27075/intake/" + qcVisit.clientId + "/page/personal?search=true'>Edit in new Tab</a>";
                //}

            }
        }
    }
};

// Create an observer instance linked to the callback function
const esigObserver = new MutationObserver(callback);
// Start observing the target node for configured mutations
esigObserver.observe(targetNode, config);
*/

/*
 * VisitRecording modal
 */
const visitRecordingTargetNode = document.getElementById("modal-visit-recording");
// Options for the observer (which mutations to observe)
const visitRecordingConfig = { attributes: true, childList: false, subtree: false };

var modalAlreadyOpen = false;
// Callback function to execute when mutations are observed
const visitRecordingCallback = (mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.type === "attributes") {
            
            if (visitRecordingTargetNode.style.display !== "none") {
                //console.log("Opened post-checkin modal");
                const nameElements = document.querySelectorAll("#modal-visit-recording .client-name")
                if (nameElements && nameElements.length && !modalAlreadyOpen) {
                    modalAlreadyOpen = true;
                    const nameElement = nameElements[0];
                    const labelAndName = nameElement.innerText.split(":");
                    if (labelAndName.length > 0) {
                        const lastClientName = labelAndName[1].trim();
                        //console.log("Found client name: " + lastClientName);
                        updatePostCheckinDisplay(lastClientName)
                    }
                }

            } else {
                modalAlreadyOpen = false;
            }
        }
    }
};

// Create an observer instance linked to the callback function
const visitRecordingObserver = new MutationObserver(visitRecordingCallback);
// Start observing the target node for configured mutations
visitRecordingObserver.observe(visitRecordingTargetNode, visitRecordingConfig);
