
// Warn if wrong search tab is selected
function checkSearch() {
    parent = document.getElementById('search-forms');
    if (!parent) {
        console.log("No parent element")
        return;
    }
    activeTabs = parent.getElementsByClassName('active');
    if (!activeTabs || activeTabs.length == 0) { console.log('No active tabs'); return; }

    activeTab = activeTabs[0];

    const nameRegex = new RegExp('^[a-zA-Z\., ]+$');
    const numericRegex = new RegExp('^[0-9]+$');

    const valSoFar = document.getElementById('intake_search_' + activeTab.id).value;
    let backgroundColor = '#ffffff';
    if (valSoFar != '') {
        switch (activeTab.id) {
            case 'client_id_search_handler':
                if (!numericRegex.test(valSoFar)) {
                    backgroundColor = '#ffdddd';
                }
                break;
            case 'client_barcode_search_handler':
                if (valSoFar.length > 10 || (valSoFar.length <= 7 && '9918222'.indexOf(valSoFar) !== 0)) {
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
    document.getElementById('intake_search_' + activeTab.id).style.backgroundColor = backgroundColor;
}
document.getElementById('intake_search_client_search_handler').addEventListener('keyup', checkSearch);
document.getElementById('intake_search_client_barcode_search_handler').addEventListener('keyup', checkSearch);
document.getElementById('intake_search_client_id_search_handler').addEventListener('keyup', checkSearch);
document.getElementById('barcode-scan-btn').innerHTML = document.getElementById('barcode-scan-btn').innerHTML.replace('Scan Barcode', 'Scan with Webcam');