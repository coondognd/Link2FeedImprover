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
const PI_SERVER_URL = localStorage.getItem('PI_SERVER_URL') || 'http://192.168.1.100:5000';
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
