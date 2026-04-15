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
