let API_ENDPOINT = "http://localhost:8080/monitor";
fetch("http://localhost:8080/monitor", { method: "OPTIONS" })
  .catch(() => {
    API_ENDPOINT = "http://localhost:8081/monitor";
  });
const MAX_RETRIES = 3;
const THROTTLE_DELAY = 2000;

let queue = [];
let isProcessing = false;
let stats = {
  lastUrl: '',
  loginForms: 0,
  policyLinks: 0,
  isActive: true
};

// Process queue with retry logic
async function processQueue() {
  if (!stats.isActive || isProcessing || queue.length === 0) return;
  
  isProcessing = true;
  const item = queue.shift();
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      console.log('Data sent successfully:', item.data.url);
      break;
    } catch (error) {
      console.error(`Attempt ${attempt} failed for ${item.data.url}:`, error);
      if (attempt === MAX_RETRIES) {
        console.error('Max retries reached, giving up on:', item.data.url);
      }
    }
  }
  
  isProcessing = false;
  setTimeout(processQueue, THROTTLE_DELAY);
}

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "pageData":
      if (!stats.isActive) return;
      
      // Update stats
      stats = {
        ...stats,
        lastUrl: message.data.url,
        loginForms: message.data.loginForms,
        policyLinks: message.data.policyLinks.length
      };
      
      // Save to storage and notify popup
      chrome.storage.local.set({ stats });
      chrome.runtime.sendMessage({
        type: "statsUpdate",
        data: stats
      });
      
      // Add to queue for backend
      queue.push(message);
      processQueue();
      break;
      
    case "setActive":
      stats.isActive = message.active;
      chrome.storage.local.set({ stats });
      break;
      
    case "getStats":
      sendResponse(stats);
      break;
  }
  
  return true; // Keep message channel open for sendResponse
});

// Initialize
chrome.storage.local.get(['stats'], (result) => {
  if (result.stats) stats = { ...stats, ...result.stats };
});