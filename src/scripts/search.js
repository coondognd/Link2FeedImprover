
const previousClients = new Set();

const searchFormElement = document.getElementById('search-forms');
const newDiv = document.createElement("div");
newDiv.id = 'searchResultsDisplay'
searchFormElement.appendChild(newDiv);
const errorDisplayElement = document.getElementById('searchResultsDisplay');

// Warn if wrong search tab is selected
function checkSearch() {
    const INTENT_NAME = 0;
    const INTENT_BARCODE = 1;
    //const INTENT_PHONE = 2;
    const barCodeStart = '9918';

    errorDisplayElement.innerText = '';

    searchParent = document.getElementById('search-forms');
    if (!searchParent) {
        //console.log("No parent element")
        return;
    }
    activeSearches = searchParent.getElementsByClassName('active');
    if (!activeSearches || activeSearches.length == 0) {
        //console.log('No active searches'); 
        return;
    }
    activeSearch = activeSearches[0];


    tabParent = document.getElementById('search-tabs');
    if (!searchParent) {
        //console.log("No parent element")
        return;
    }
    const tabs = tabParent.getElementsByTagName('a');
    //if (!activeTabs || activeTabs.length == 0) { console.log('No active Tabs'); return; }


    const nameRegex = new RegExp('^[a-zA-Z\\.\\-\',\\s]+$');
    const numericRegex = new RegExp('^[0-9]+$');

    let correctElementNames = [
        {
            tab: '#client_search_handler',
            search: 'intake_search_client_search_handler'
        },
        {
            tab: '#client_barcode_search_handler',
            search: 'intake_search_client_barcode_search_handler'
        },
        /*{ 
            tab : '#phone_search_handler',
            search : 'intake_search_phone_search_handler'
        },*/
    ]

    let actual = null;
    if (activeSearch.id == 'client_search_handler') {
        actual = INTENT_NAME;
    } else if (activeSearch.id == 'client_barcode_search_handler') {
        actual = INTENT_BARCODE;
        //} else if (activeSearch.id == 'phone_search_handler') {
        //   actual = INTENT_PHONE
    }
    //console.log("Actual is " + actual)

    // Allow "." as a shortcut for 9918
    if (actual == INTENT_BARCODE && document.getElementById(correctElementNames[actual].search).value == ".") {
        document.getElementById(correctElementNames[actual].search).value = barCodeStart;
    }

    const valSoFar = document.getElementById('intake_search_' + activeSearch.id).value;
    if (valSoFar == '') {
        errorDisplayElement.innerText = '';
    }

    let intent = null;
    if (nameRegex.test(valSoFar)) {
        intent = INTENT_NAME;
    } else if (valSoFar.length > 1 &&
        ((barCodeStart.indexOf(valSoFar.substring(0, barCodeStart.length)) == 0) ||
            (valSoFar.indexOf(barCodeStart) == 0))) {
        intent = INTENT_BARCODE;
        //} else if (valSoFar.length > 2 && ['914', '845'].includes(valSoFar.substring(0,3))) {
        //    intent = INTENT_PHONE;
    }
    //console.log("Intent is " + intent);


    if (intent !== actual && intent != null) {

        // Switch tabs
        for (let tab of tabs) {
            if (tab.attributes.href.value == correctElementNames[intent].tab) {
                //tab.parentNode.classList.add('active');
                tab.click();
            }
        }
        // Copy the value over to the new tab
        document.getElementById(correctElementNames[intent].search).value = valSoFar;
        // Reset the old tab
        document.getElementById(correctElementNames[actual].search).value = "";
        document.getElementById(correctElementNames[actual].search).style.backgroundColor = "#ffffff";
        // Nudge the autocomplete service to do a search
        const event = new KeyboardEvent('keydown', {
            key: '4', // actual key is arbitrary
            bubbles: true,
            cancelable: true
        });
        document.getElementById(correctElementNames[intent].search).dispatchEvent(event);
        return;

    }

    let backgroundColor = '#ffffff';
    if (valSoFar != '') {
        switch (activeSearch.id) {
            case 'client_id_search_handler':
                if (!numericRegex.test(valSoFar)) {
                    backgroundColor = '#ffdddd';
                }
                break;
            case 'client_barcode_search_handler':
                if (valSoFar.length > 10 || (valSoFar.length <= barCodeStart.length && barCodeStart.indexOf(valSoFar) !== 0)) {
                    backgroundColor = '#ffdddd';
                }
                break;
            case 'client_search_handler':
                if (!nameRegex.test(valSoFar)) {
                    backgroundColor = '#ffdddd';
                }
                break;
            default:

        }
    }
    document.getElementById('intake_search_' + activeSearch.id).style.backgroundColor = backgroundColor;
}
document.getElementById('intake_search_client_search_handler').addEventListener('keyup', checkSearch);
document.getElementById('intake_search_client_barcode_search_handler').addEventListener('keyup', checkSearch);
document.getElementById('intake_search_client_id_search_handler').addEventListener('keyup', checkSearch);
document.getElementById('barcode-scan-btn').innerHTML = document.getElementById('barcode-scan-btn').innerHTML.replace('Scan Barcode', 'Scan with Webcam');

/*
<ul id="ui-id-3" tabindex="0" class="ui-menu ui-widget ui-widget-content ui-autocomplete ui-front" style="display: none; width: 569.497px; top: 359.913px; left: 135.296px;">
<li class="ui-menu-item"><a href="/org/27075/intake/10130808/page/personal?search=true?search=true" id="ui-id-28" tabindex="-1" class="ui-menu-item-wrapper">
                    <div class="row">                        
                    <div class="col-md-8 col-sm-8 col-xs-8">test, adult</div>                        
                    <div class="col-md-3 col-sm-4 col-xs-4 text-right align-right">01-01-1972</div>  
                    </div>                </a></li></ul>
*/
function highlightPastUsers(resultsElement) {
    const clientLinks = resultsElement.querySelectorAll('a.ui-menu-item-wrapper');
    const re = /intake\/(\d+)\/page/i;
    clientLinks.forEach((clientLink) => {
        const href = clientLink.getAttribute('href');
        const found = href.match(re);
        if (found.length > 0) {
            const clientId = found[1];
            if (previousClients.has(clientId)) {
                clientLink.style.backgroundColor = '#ccffcc';
                clientLink.style.color = '#000000';
            }
        }
    });
}

/*
 *  Let the user know if the search is still going or not
 */
const STANDBY = 0;
const SEARCHING = 1;
const searchResultDropdownElements = document.getElementsByClassName('ui-autocomplete');
var state = STANDBY;


var observer = new MutationObserver(function (event) {
    const e = event[0].target;
    if (state == STANDBY && e.classList.contains('ui-autocomplete-loading')) {
        state = SEARCHING;
        errorDisplayElement.innerText = 'Searching...';
    }
    if (state == SEARCHING && e.classList.contains('ui-autocomplete-loading')) {
        errorDisplayElement.innerText = 'Searching...';
    }
    if (state == SEARCHING && !e.classList.contains('ui-autocomplete-loading')) {
        let numResults = null;
        for (searchResultDropdownElement of searchResultDropdownElements) {
            if (searchResultDropdownElement.style.display !== 'none') {
                highlightPastUsers(searchResultDropdownElement);
                const clientLinks = searchResultDropdownElement.querySelectorAll('a.ui-menu-item-wrapper')
                numResults = clientLinks.length;
                break;
            }
        }
        if (numResults !== null) {
            errorDisplayElement.innerText = ((numResults < 10) ? numResults : 'Many') +  ' Results found';
        } else {
            errorDisplayElement.innerText = 'No results';
            checkIfOffline();
        }
    }
    // TODO: Clear out errorDisplayElement when switching tabs
})


const clientSearchElements = [
    'intake_search_client_id_search_handler',
    'intake_search_client_dob_search_handler',
    'intake_search_address_search_handler',
    'intake_search_client_search_handler',
    'intake_search_phone_search_handler',
    'intake_search_client_barcode_search_handler'
]

for (clientSearchElement of clientSearchElements) {
    var e = document.getElementById(clientSearchElement)
    observer.observe(e, {
        attributes: true,
        attributeFilter: ['class'],
        childList: false,
        characterData: false
    })

}

/*
 *   End Search-still-going logic
 */


// Get clients who have visited in the past

const CLIENTS_API_URL = "https://ccfp.geniusstrikes.com/clients.php";

async function fetchClients() {
    const authHeader = "Basic Y2NmcF9hcGlfdXNlcjpDQ0ZQYW50cnk4MyE=";


    try {
        const response = await fetch(CLIENTS_API_URL, {
            method: "GET",
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json"
            }
        })
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const clients = await response.json();
        return clients;
    } catch (error) {
        console.error(error.message);
    }
}


const previousClientsString = sessionStorage.getItem("previousClients");
let previousClientsArray = [];
if (previousClientsString) {
    previousClientsArray = JSON.parse(previousClientsString);
} else {
    fetchClients().then((clients) => {
        if (clients) {
            sessionStorage.setItem("previousClients", JSON.stringify(clients))
        }
    }).catch(() => { })
}
previousClientsArray.forEach((previousClientID) => {
    previousClients.add(previousClientID, 1);
})


// If we stay on the page too long, the cookie expires.
// So call a URL that updates the cookie every so often
function keepAlive() {
    now = new Date();
    try {
        fetch("https://accounts.link2feed.com/org/27075/announcements/icon?" + now.getTime(), { mode: 'no-cors' });
        console.log("Session keep-alive success. " + now);
    } catch {
        console.log("Session keep-alive failed. " + now);
    }
}
setInterval(keepAlive, 2 * 60 * 1000);

function checkIfOffline() {
    console.log("Checking internet");

    fetch('https://ccfp.geniusstrikes.com/internet_check.php', {
        method: "GET"
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        console.log("Online");
        notifyOnline();
    }).catch((error) => {
        console.log("Offline");
        console.error(error.message);
        notifyOffline();
    });
}
// Internet checking
function notifyOffline() {
    const offlineDiv = document.createElement('div');
    offlineDiv.id = 'offline-notification';
    offlineDiv.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 20px;
        background: red;
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 9999;
    `;
    offlineDiv.textContent = 'Internet Connection Lost';
    document.body.appendChild(offlineDiv);
}

function notifyOnline() {
    const offlineDiv = document.getElementById('offline-notification');
    if (offlineDiv) {
        offlineDiv.remove();
    }
}

window.addEventListener('online', notifyOnline);
window.addEventListener('offline', notifyOffline);
