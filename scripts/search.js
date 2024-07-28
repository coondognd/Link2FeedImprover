
// Warn if wrong search tab is selected
function checkSearch() {
    const INTENT_NAME = 0;
    const INTENT_BARCODE = 1;
    //const INTENT_PHONE = 2;
    const barCodeStart = '99182';

    searchParent = document.getElementById('search-forms');
    if (!searchParent) {
        console.log("No parent element")
        return;
    }
    activeSearches = searchParent.getElementsByClassName('active');
    if (!activeSearches || activeSearches.length == 0) { console.log('No active searches'); return; }
    activeSearch = activeSearches[0];

    
    tabParent = document.getElementById('search-tabs');
    if (!searchParent) {
        console.log("No parent element")
        return;
    }
    const tabs = tabParent.getElementsByTagName('a');
    //if (!activeTabs || activeTabs.length == 0) { console.log('No active Tabs'); return; }


    const nameRegex = new RegExp('^[a-zA-Z\.\-, ]+$');
    const numericRegex = new RegExp('^[0-9]+$');

    let correctElementNames = [
        { 
            tab : '#client_search_handler',
            search : 'intake_search_client_search_handler'
        },
        { 
            tab : '#client_barcode_search_handler',
            search : 'intake_search_client_barcode_search_handler'
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

    // Allow "." as a shortcut for 99182
    if (actual == INTENT_BARCODE && document.getElementById(correctElementNames[actual].search).value == ".") {
        document.getElementById(correctElementNames[actual].search).value = barCodeStart;
    }

    const valSoFar = document.getElementById('intake_search_' + activeSearch.id).value;

    let intent = null;
    if (nameRegex.test(valSoFar)) {
        intent = INTENT_NAME;
    } else if (valSoFar.length > 1 && barCodeStart.indexOf(valSoFar.substring(0, 7)) == 0) {
        intent = INTENT_BARCODE;
    //} else if (valSoFar.length > 2 && ['914', '845'].includes(valSoFar.substring(0,3))) {
    //    intent = INTENT_PHONE;
    }
    //console.log("Intent is " + intent);


    if (intent !== actual && intent != null) {
        /*
        correctElementNames.forEach((elementName) => {
            document.getElementById(elementName.search).classList.remove('active');
        })
        */
        //document.getElementById(correctElementNames[INTENT].search).classList.add('active');
        
        for (let tab of tabs) {
            //tab.parentNode.classList.remove('active');
            //console.log("Comparing " + tab.attributes.href.value + " and " + correctElementNames[intent].tab);
            if (tab.attributes.href.value == correctElementNames[intent].tab) {
                //tab.parentNode.classList.add('active');
                tab.click();
            }
        }
        document.getElementById(correctElementNames[intent].search).value = valSoFar;
        document.getElementById(correctElementNames[actual].search).value = "";
        //var evt = document.createEvent("HTMLEvents");
        //evt.initEvent('keyup', true, true);
        //document.getElementById(correctElementNames[intent].search).dispatchEvent(evt);
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
                if (valSoFar.length > 10 || (valSoFar.length <= 7 && barCodeStart.indexOf(valSoFar) !== 0)) {
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