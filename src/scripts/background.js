chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Background received message ", msg);
  if (msg.action === "printPdf") {
    
    const url = msg.pdfDataUrl + "#print";
    chrome.tabs.create({ url });
    
  }
  return true;
});


chrome.userScripts.register([{
  id: 'test',
  world: 'MAIN',
  matches: ['*://portal.link2feed.com/*'],
  js: [{code: 'window.setTimeout(() => {const tmp = l2f.performQuickClick; const newQc=function(clientId, name) { document.body.setAttribute("data-client-id", clientId); tmp(clientId, name) }; l2f.redefinePerformQuickClick(newQc);}, 5000);'}],
}]);


//and runtime.onUserScriptConnect.
chrome.userScripts.configureWorld({
  messaging: true
});
/*
chrome.runtime.onUserScriptMessage.addListener((msg, sender, sendResponse) => {
  console.log("Background received userScript ", msg);
  if (msg.type === "CHECKIN") {
    chrome.runtime.sendMessage(msg);
    console.log("Background received userScript CHECKIN for client ID: " + msg.clientId);
  }
  return true;
});
chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  console.log("Background received external ", msg);
  if (msg.type === "CHECKIN") {
    chrome.runtime.sendMessage(msg);
    console.log("Background received external CHECKIN for client ID: " + msg.clientId);
  }
  return true;
});
*/
    
