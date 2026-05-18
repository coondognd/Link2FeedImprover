const CLIENT_DISPLAY_URL = chrome.runtime.getURL("display.html");
let clientDisplayWindowId = null;
let clientDisplayTabId = null;

// Callbacks waiting for the window to finish being created (prevents duplicate opens
// when ensureClientDisplayWindow is called again before the first window is ready).
let pendingCallbacks = null;

function clearClientDisplayWindow(windowId) {
  if (clientDisplayWindowId === windowId) {
    clientDisplayWindowId = null;
    clientDisplayTabId = null;
  }
}

chrome.windows.onRemoved.addListener(clearClientDisplayWindow);
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === clientDisplayTabId) {
    clientDisplayWindowId = null;
    clientDisplayTabId = null;
  }
});

function createClientDisplayWindow(callback) {
  // Queue this callback if a create is already in flight.
  if (pendingCallbacks !== null) {
    pendingCallbacks.push(callback);
    return;
  }
  pendingCallbacks = [callback];

  chrome.windows.create({ url: CLIENT_DISPLAY_URL, width: 500, height: 500 }, (newWindow) => {
    const queued = pendingCallbacks;
    pendingCallbacks = null;

    if (chrome.runtime.lastError || !newWindow || !newWindow.tabs || newWindow.tabs.length === 0) {
      console.warn("Unable to open client display window", chrome.runtime.lastError);
      queued.forEach(cb => cb(null));
      return;
    }

    clientDisplayWindowId = newWindow.id;
    clientDisplayTabId = newWindow.tabs[0].id;
    queued.forEach(cb => cb(clientDisplayTabId));
  });
}

function ensureClientDisplayWindow(callback) {
  // If we have an in-memory window ID, verify the window is still open.
  if (clientDisplayWindowId) {
    chrome.windows.get(clientDisplayWindowId, { populate: true }, (windowInfo) => {
      if (!chrome.runtime.lastError && windowInfo && windowInfo.tabs && windowInfo.tabs.length > 0) {
        clientDisplayTabId = windowInfo.tabs[0].id;
        callback(clientDisplayTabId);
        return;
      }
      clientDisplayWindowId = null;
      clientDisplayTabId = null;
      ensureClientDisplayWindow(callback);
    });
    return;
  }

  // No in-memory ID (e.g. after a service-worker restart). Search existing tabs
  // for the display page before opening a new window.
  chrome.tabs.query({ url: CLIENT_DISPLAY_URL }, (tabs) => {
    if (tabs && tabs.length > 0) {
      clientDisplayTabId = tabs[0].id;
      clientDisplayWindowId = tabs[0].windowId;
      callback(clientDisplayTabId);
      return;
    }
    createClientDisplayWindow(callback);
  });
}

function updateClientDisplay(message) {
  if (chrome.storage && chrome.storage.local && typeof chrome.storage.local.set === 'function') {
    chrome.storage.local.set({ clientDisplayMessage: message || "", clientDisplayUpdatedAt: Date.now() });
  } else {
    console.warn("chrome.storage.local unavailable in background; client display update skipped.");
  }

  ensureClientDisplayWindow(() => {
    // Display window is opened or already open; storage update will update the page.
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Background received message ", msg);
  if (msg.action === "printPdf") {
    const url = msg.pdfDataUrl + "#print";
    chrome.tabs.create({ url });
  }

  if (msg.action === "openClientDisplay") {
    ensureClientDisplayWindow(() => sendResponse({ ok: true }));
    return true;
  }

  if (msg.action === "updateClientDisplay") {
    updateClientDisplay(msg.message);
    sendResponse({ ok: true });
    return true;
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
    
