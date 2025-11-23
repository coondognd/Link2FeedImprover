chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "printPdf") {
    
    const url = msg.pdfDataUrl + "#print";
    chrome.tabs.create({ url });
    
     //openPdfAndPrint(msg.pdfDataUrl);
  }
});



    
async function openPdfAndPrint(pdfBlob) {
  const objectUrl = pdfBlob;
    chrome.tabs.create({
        url: chrome.runtime.getURL("print.html?file=" + encodeURIComponent(objectUrl))
    });

}