const displayTextElement = document.getElementById("displayText");
let clearTimeoutId = null;

function setDisplayMessage(message) {
  if (!message) {
    clearDisplay();
    return;
  }

  displayTextElement.textContent = message;
  flashScreen();
  resetClearTimer();
}

function clearDisplay() {
  displayTextElement.textContent = "";
  document.body.classList.remove("flash");

  if (clearTimeoutId) {
    clearTimeout(clearTimeoutId);
    clearTimeoutId = null;
  }

  chrome.storage.local.remove(["clientDisplayMessage", "clientDisplayUpdatedAt"]);
}

function flashScreen() {
  document.body.classList.remove("flash");
  void document.body.offsetWidth;
  document.body.classList.add("flash");
}

function resetClearTimer() {
  if (clearTimeoutId) {
    clearTimeout(clearTimeoutId);
  }
  clearTimeoutId = window.setTimeout(() => {
    clearDisplay();
  }, 30000);
}

function handleStorageChange(changes, areaName) {
  if (areaName !== "local" || !changes.clientDisplayMessage) {
    return;
  }
  setDisplayMessage(changes.clientDisplayMessage.newValue || "");
}

chrome.storage.local.get(["clientDisplayMessage"], (result) => {
  if (result && result.clientDisplayMessage) {
    setDisplayMessage(result.clientDisplayMessage);
  }
});

chrome.storage.onChanged.addListener(handleStorageChange);
