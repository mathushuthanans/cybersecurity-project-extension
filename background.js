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
  isActive: true,
  processedPolicy: null
};

async function processQueue() {
  if (!stats.isActive || isProcessing || queue.length === 0) return;
  
  isProcessing = true;
  const item = queue.shift();
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: item.data.url,
          loginDetected: item.data.loginForms > 0,
          policyLinks: item.data.policyLinks
        })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.textPolicy) {
        stats.processedPolicy = {
          url: item.data.url,
          summary: result.textPolicy,
          timestamp: new Date().toISOString()
        };
        chrome.storage.local.set({ processedPolicy: stats.processedPolicy });
      }
      
      console.log('Data processed successfully:', item.data.url);
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "pageData":
      if (!stats.isActive) return;
      
      stats = {
        ...stats,
        lastUrl: message.data.url,
        loginForms: message.data.loginForms,
        policyLinks: message.data.policyLinks.length
      };
      
      chrome.storage.local.set({ stats });
      chrome.runtime.sendMessage({
        type: "statsUpdate",
        data: stats
      });
      
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

    case "getProcessedPolicy":
      sendResponse(stats.processedPolicy);
      break;
  }

  return true;
});

chrome.storage.local.get(['stats', 'processedPolicy'], (result) => {
  if (result.stats) stats = { ...stats, ...result.stats };
  if (result.processedPolicy) stats.processedPolicy = result.processedPolicy;
});

chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup/popup.html"),
    type: "popup",
    width: 360,
    height: 500,
    top: 100,
    left: 100,
    focused: true
  });
});