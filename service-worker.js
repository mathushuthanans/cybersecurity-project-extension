// Add this to your stats object
let stats = {
  lastUrl: '',
  lastProcessedUrl: '',  // Track the last URL we actually processed
  loginForms: 0,
  policyLinks: 0,
  isActive: true
};

// Add content hash tracking
let contentHashes = new Map();

// Helper function to create a simple content hash
function createContentHash(data) {
  // Simple hash - for production use a proper hash function
  return JSON.stringify({
    loginForms: data.loginForms,
    policyLinks: data.policyLinks.sort()
  });
}

// Modified processQueue function
async function processQueue() {
  if (!stats.isActive || isProcessing || queue.length === 0) return;
  
  isProcessing = true;
  const item = queue.shift();
  
  // Check if we've already processed this URL with the same content
  const currentHash = createContentHash(item.data);
  const lastHash = contentHashes.get(item.data.url);
  
  if (item.data.url === stats.lastProcessedUrl && lastHash === currentHash) {
    console.log('Skipping duplicate processing for:', item.data.url);
    isProcessing = false;
    setTimeout(processQueue, THROTTLE_DELAY);
    return;
  }
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      console.log('Data sent successfully:', item.data.url);
      stats.lastProcessedUrl = item.data.url;
      contentHashes.set(item.data.url, currentHash);
      chrome.storage.local.set({ stats });
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