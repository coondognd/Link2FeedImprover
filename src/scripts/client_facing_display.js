class ClientFacingDisplay {
  static showWelcomeMessage(fullName) {
    const firstName = ClientFacingDisplay.extractFirstName(fullName);
    const message = `✅ Welcome, ${firstName}`;
    chrome.runtime.sendMessage({ action: "updateClientDisplay", message }, () => {});
  }

  static showPhoneSearch(phoneNumber) {
    const message = phoneNumber ? `📞 Phone: ${phoneNumber}` : "";
    chrome.runtime.sendMessage({ action: "updateClientDisplay", message }, () => {});
  }

  static showMessage(message) {
    chrome.runtime.sendMessage({ action: "updateClientDisplay", message }, () => {});
  }

  static extractFirstName(fullName) {
    if (!fullName || typeof fullName !== "string") {
      return "Guest";
    }
    const normalized = fullName.trim().replace(/\s+/g, " ");
    const parts = normalized.split(" ");
    return parts[0] || normalized;
  }
}
