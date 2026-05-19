// content-script.js
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";


/**
 * Load PDF (from extension file). Because content scripts run in page context,
 * fetch the web-accessible resource using runtime.getURL.
 */
async function loadExtensionPdf(path = "english.pdf") {
  const url = chrome.runtime.getURL(path);
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Could not fetch PDF: " + resp.status);
  const arrayBuffer = await resp.arrayBuffer();
  return arrayBuffer;
}

/**
 * Add some text to the first page and return a Blob of the new PDF.
 * Simple example: puts text near the top-left of page 1.
 */
async function addTextToPdf(originalPdfArrayBuffer, entries, options = {}) {
  const pdfDoc = await PDFDocument.load(originalPdfArrayBuffer);

  // You can embed fonts if needed. Use standard fonts or embed a TTF shipped with your extension.
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  const marginx = 20;
  const marginy = 40;
  const fontSize = 12;

  for (let i = 0; i < entries.length; i++) {
    //const page = pages[i];

    const { width, height } = pages[i].getSize();

    let y = height - marginy;

    for (const entry of entries[i]) {
      pages[i].drawText(entry.text, {
        x: marginx + entry.x,
        y: y - entry.y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      //y -= fontSize + 4;
    }
  }

  const newPdfBytes = await pdfDoc.save();
  return new Blob([newPdfBytes], { type: "application/pdf" });
}

function openPdfAndPrint(pdfBlob) {
  const pdfUrl = URL.createObjectURL(pdfBlob);
    chrome.runtime.sendMessage({
      action: "printPdf",
      pdfDataUrl: pdfUrl,
    });

}


const enthnicityCoordinates = {
  "aleut_or_eskimo": { x: 30, y: 316 },
  "american_indian": { x: 30, y: 316 + (1 * 13) },
  "asian": { x: 30, y: 316 + (2 * 13) },
  "black_african_american": { x: 30, y: 316 + (3 * 13) },

  "hispanic_latino": { x: 223, y: 316 },
  "middle_eastern_north_african": { x: 223, y: 316 + (1 * 13) },
  "pacific_islander": { x: 223, y: 316 + (2 * 13) },
  "white": { x: 223, y: 316 + (3 * 13) },

  "biracial_multi_racial": { x: 394, y: 316 },
  "other": { x: 394, y: 316 + (1 * 13) }
}
const languageCoordinates = {
  "English": { x: 30, y: 264 },
  "Spanish": { x: 222, y: 264 },
}

/**
 * Generate TEFAP PDF blob with current form data
 * Returns a Blob containing the formatted PDF
 * Can be used for printing (via openPdfAndPrint) or sending to external services
 */
async function generateTEFAPPdf() {
  var barCode = null;

  try {
    const urlClientIdStartSpot = document.location.href.indexOf('/intake/') + '/intake/'.length
    const urlClientIdEndSpot = document.location.href.indexOf('/page/personal');
    const urlClientId = document.location.href.substring(urlClientIdStartSpot, urlClientIdEndSpot);
    if (urlClientId) {
      const formClientId = document.getElementById('intake_personal_type-identity-documents-container').querySelector('input[value="' + urlClientId + '"]').getAttribute('id').split('_').pop();
      if (formClientId) {
        barCode = document.getElementById('client_identity_document_identifier_' + formClientId).value;
      }
    }
  } catch (err) {
    console.warn("Could not read client ID from URL/form:", err);
  }
  
  var firstName = document.querySelector('input[name="intake_personal_type[firstName]"]').value;
  var lastName = document.querySelector('input[name="intake_personal_type[lastName]"]').value;
  var gender = document.querySelector('select[name="intake_personal_type[genderType]"]').querySelector("option[selected]").innerText;
  var address1 = document.querySelector('input[name="intake_personal_type[household][address][addressLine1]"]').value;
  var address2 = document.querySelector('input[name="intake_personal_type[household][address][addressLine2]"]').value;
  var city = document.querySelector('input[name="intake_personal_type[household][address][city]"]').value;
  var zip = document.querySelector('input[name="intake_personal_type[household][address][postcode]"]').value;
  var dob = document.querySelector('input[name="intake_personal_type[dateOfBirth]-placeholder-date"]').value;
  var phone = document.getElementById('client-contact-item-phone-container').querySelector('input[type="text"]').value;

  var languageElements = document.getElementById('s2id_intake_personal_type_languages').getElementsByClassName('select2-search-choice');
  const languages = [];
  for (var i = 0; i < languageElements.length; i++) {
    languages.push(languageElements[i].innerText.trim())
  }
  const pdfLanguage = languages.includes('Spanish') ? 'Spanish' : 'English';

  const family = [];
  const familyTableRows = document.getElementById('household_members_table').getElementsByTagName('tr');
  for (var i = 1; i < familyTableRows.length; i++) {
    const cells = familyTableRows[i].getElementsByTagName('td');
    family.push({
      name: cells[1].innerText.trim(),
      gender: cells[3].innerText.trim(),
      age: cells[4].innerText.trim(),
      dob: cells[5].innerText.trim()
    });
  }

  const ethnicityElements = document.querySelectorAll("input[name='intake_personal_type[ethnicities][]']");
  const ethnicities = [];
  for (var i = 0; i < ethnicityElements.length; i++) {
    if (ethnicityElements[i].checked) {
      ethnicities.push(ethnicityElements[i].getAttribute('data-type-name'));
    }
  }

  const pdfPageOneInserts = [
    { x: 30, y: 100, text: firstName },
    { x: 179, y: 100, text: lastName },
    { x: 323, y: 100, text: dob.split('-').join("   ") },
    { x: 110, y: address2 ? 155 : 162, text: address1 },
    { x: 110, y: 167, text: address2 },
    { x: 265, y: 162, text: city },
    { x: 474, y: 162, text: zip },
    { x: pdfLanguage == "Spanish" ? 73 : 55, y: 195, text: phone.replaceAll(/[\(\)]/g, '-').split('-').join("        ") },
    { x: 285, y: 676, text: barCode },
    { x: pdfLanguage == "Spanish" ? 178 : 148, y: 676, text: "X" }
  ];
  
  if (gender === "Female") {
    pdfPageOneInserts.push({ x: 440, y: 83, text: "X" });
  } else if (gender === "Male") {
    pdfPageOneInserts.push({ x: 440, y: 97, text: "X" });
  } else if (gender === "Non-binary") {
    pdfPageOneInserts.push({ x: 440, y: 111, text: "X" });
  }

  for (var i = 0; i < languages.length; i++) {
    const language = languages[i];
    if (languageCoordinates[language]) {
      const coords = languageCoordinates[language];
      pdfPageOneInserts.push({ x: coords.x, y: coords.y, text: "X" });
    }
  }

  for (var i = 0; i < ethnicities.length; i++) {
    const ethnicity = ethnicities[i];
    if (enthnicityCoordinates[ethnicity]) {
      const coords = enthnicityCoordinates[ethnicity];
      pdfPageOneInserts.push({ x: coords.x, y: coords.y, text: "X" });
    }
  }

  const familyOffsetY = 441;
  for (var i = 0; i < family.length; i++) {
    const member = family[i];
    var offset = familyOffsetY;
    if (i > 4) {
      offset += (6 * 45) + ((i - 5) * 13) - 10;
    } else {
      offset += i * 45;
    }
    pdfPageOneInserts.push({ x: 10, y: offset, text: member.name });
    pdfPageOneInserts.push({ x: 410, y: offset, text: member.age });
    pdfPageOneInserts.push({ x: 270, y: offset, text: member.dob.split(' ').join("    ") });

    if (member.gender === "Female") {
      pdfPageOneInserts.push({ x: 474, y: offset - 7, text: "X" });
    } else if (member.gender === "Male") {
      pdfPageOneInserts.push({ x: 474, y: offset + 8, text: "X" });
    } else if (member.gender === "Non-binary") {
      pdfPageOneInserts.push({ x: 474, y: offset + 23, text: "X" });
    }
  }

  const pdfPageTwoInserts = [
    { x: 130, y: 80, text: `${firstName} ${lastName}` },
    { x: 130, y: 100, text: zip },
    { x: 440, y: 100, text: family.length + 1 + "" }
  ];

  var pdfFile = "english.pdf";
  if (pdfLanguage === 'Spanish') {
    pdfFile = "spanish.pdf";
    for (var i = 0; i < pdfPageOneInserts.length; i++) {
      pdfPageOneInserts[i].y -= 3;
    }
    for (var i = 0; i < pdfPageTwoInserts.length; i++) {
      pdfPageTwoInserts[i].y -= 17;
    }
  }

  const arrayBuffer = await loadExtensionPdf(pdfFile);
  const pdfBlob = await addTextToPdf(arrayBuffer, [pdfPageOneInserts, pdfPageTwoInserts]);
  
  return pdfBlob;
}

/**
 * Main flow: read text, load original PDF, add text, and print.
 */
async function runAddAndPrint() {
  console.log("Running PDF add-and-print...");
  try {
    const pdfBlob = await generateTEFAPPdf();
    console.log("PDF generated, opening print dialog...");
    await openPdfAndPrint(pdfBlob);

  } catch (err) {
    console.error("PDF edit/print failed:", err);
    alert("Failed to add text to PDF: " + (err && err.message));
  }
}

/**
 * Optionally expose a keyboard shortcut, or react to messages
 * For example, run when user clicks the extension action: receive message from background.
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "ADD_AND_PRINT") {
    runAddAndPrint();
    sendResponse({ ok: true });
    return true;
  }
});

// For quick testing via console
window.__pdfAddPrint = runAddAndPrint;

// Listen for the "run the function" event, from page world
document.addEventListener("EXT_PDF_ADD_PRINT", () => {
  // Call your content-script function
  runAddAndPrint();
});
document.addEventListener("EXT_PDF_EXPRESS_PRINT", () => {
  // Call your content-script function
  handleExpressPrintClick();
});


/////////////////////////////

/**
 * Pi Print Handler
 * 
 * Manages communication with the Raspberry Pi print server.
 * Handles:
 * - Health check polling
 * - PDF transmission to printer
 * - Status updates with UI feedback
 * 
 * Note: This script depends on generateTEFAPPdf being available from print_pdf.js
 */

// Configuration - adjust if your Pi is at a different address/port
const PI_SERVER_URL = localStorage.getItem('PI_SERVER_URL') || 'https://ccfp-print:5000';
const HEALTH_CHECK_INTERVAL = 5000; // Check every 5 seconds
const PRINT_TIMEOUT = 60000; // 60 second timeout for print operation
const STATUS_MESSAGE_DURATION = 5000; // Show status for 5 seconds

let piOnline = false;
let healthCheckTimer = null;

/**
 * Check if the Pi server is online
 */
async function checkPiHealth() {
  try {
    const response = await fetch(`${PI_SERVER_URL}/health`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store'
    });
    
    const wasOnline = piOnline;
    piOnline = true;
    
    if (!wasOnline) {
      console.log('[Pi Print] Pi came online');
      updateExpressPrintButton(true);
    }
    
    return true;
  } catch (error) {
    const wasOnline = piOnline;
    piOnline = false;
    
    if (wasOnline) {
      console.log('[Pi Print] Pi went offline: ' + error.message);
      updateExpressPrintButton(false);
    }
    
    return false;
  }
}

/**
 * Start periodic health checks
 */
function startHealthCheckPolling() {
  if (healthCheckTimer) {
    clearInterval(healthCheckTimer);
  }
  
  // Check immediately
  checkPiHealth();
  
  // Then check periodically
  healthCheckTimer = setInterval(checkPiHealth, HEALTH_CHECK_INTERVAL);
}

/**
 * Stop health check polling
 */
function stopHealthCheckPolling() {
  if (healthCheckTimer) {
    clearInterval(healthCheckTimer);
    healthCheckTimer = null;
  }
}

/**
 * Update the ExpressPrint button based on Pi availability
 */
function updateExpressPrintButton(isOnline) {
  const button = document.getElementById('expressPrintTEFAP');
  if (!button) return;
  
  if (isOnline) {
    button.style.display = 'inline-block';
  } else {
    button.style.display = 'none';
  }
}

/**
 * Send PDF to Pi for printing
 * @param {Blob} pdfBlob - The PDF file as a Blob
 * @param {HTMLElement} button - The button element to update with status
 */
async function sendPdfToPi(pdfBlob, button) {
  try {
    button.disabled = true;
    button.innerText = 'Printing…';
    
    const formData = new FormData();
    formData.append('pdf', pdfBlob, 'form.pdf');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PRINT_TIMEOUT);
    
    const response = await fetch(`${PI_SERVER_URL}/print`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      // Success
      button.innerText = 'Success!';
      button.style.background = '#4caf50'; // Green
      
      setTimeout(() => {
        button.innerText = 'ExpressPrint TEFAP';
        button.style.background = ''; // Reset to default
        button.disabled = false;
      }, STATUS_MESSAGE_DURATION);
      
      return true;
    } else {
      // Error from server
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Server error: ${response.status}`);
    }
  } catch (error) {
    console.error('[Pi Print] Error sending PDF:', error);
    
    button.innerText = 'Error!';
    button.style.background = '#f44336'; // Red
    
    setTimeout(() => {
      button.innerText = 'ExpressPrint TEFAP';
      button.style.background = ''; // Reset to default
      button.disabled = false;
    }, STATUS_MESSAGE_DURATION);
    
    return false;
  }
}

/**
 * Handle ExpressPrint button click
 * Generates PDF and sends to Pi
 */
async function handleExpressPrintClick() {
  if (!piOnline) {
    alert('Pi printer is not available. Please try again later.');
    return;
  }
  
  try {
    const button = document.getElementById('expressPrintTEFAP');
    
    // Generate the PDF using the function from print_pdf.js
    if (typeof generateTEFAPPdf !== 'function') {
      throw new Error('PDF generation function not available');
    }
    
    const pdfBlob = await generateTEFAPPdf();
    
    // Send to Pi
    await sendPdfToPi(pdfBlob, button);
  } catch (error) {
    console.error('[Pi Print] Error in ExpressPrint:', error);
    alert('Failed to generate or send PDF: ' + error.message);
    
    // Reset button on error
    const button = document.getElementById('expressPrintTEFAP');
    if (button) {
      button.innerText = 'ExpressPrint TEFAP';
      button.style.background = '';
      button.disabled = false;
    }
  }
}

/**
 * Initialize Pi print handler
 */
function initializePiPrintHandler() {
  if (document.body.getAttribute('data-pi-print-initialized')) {
    return;
  }
  
  document.body.setAttribute('data-pi-print-initialized', 'true');
  console.log('[Pi Print] Initializing on page');
  
  // Add CSS styling for the ExpressPrint button
  const style = document.createElement('style');
  style.textContent = `
    #expressPrintTEFAP {
      background-color: #2196F3;
      color: white;
      border: none;
      padding: 6px 12px;
      font-size: 14px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    #expressPrintTEFAP:hover:not(:disabled) {
      background-color: #1976d2;
    }
    #expressPrintTEFAP:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);
  
  startHealthCheckPolling();
  
  // Listen for cleanup when page unloads
  window.addEventListener('beforeunload', stopHealthCheckPolling);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePiPrintHandler);
} else {
  initializePiPrintHandler();
}
