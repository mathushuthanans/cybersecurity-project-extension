document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle');
  const statusBadge = document.getElementById('statusBadge');
  const urlDisplay = document.getElementById('urlDisplay');
  const urlToggle = document.getElementById('urlToggle');
  const loginCount = document.getElementById('loginCount');
  const policyCount = document.getElementById('policyCount');
  
  let isUrlExpanded = false;
  let currentUrl = '';
  
  // Load initial state
  chrome.runtime.sendMessage({ type: "getStats" }, (stats) => {
    updateUI(stats || {});
  });
  
  // Toggle monitoring
  toggleBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: "getStats" }, (stats) => {
      const newState = !stats.isActive;
      chrome.runtime.sendMessage({
        type: "setActive",
        active: newState
      });
      
      // Add pulse animation
      toggleBtn.classList.add('pulse');
      setTimeout(() => toggleBtn.classList.remove('pulse'), 600);
      
      updateUI({ ...stats, isActive: newState });
    });
  });
  
  // URL expand/collapse
  urlToggle.addEventListener('click', () => {
    isUrlExpanded = !isUrlExpanded;
    toggleUrlDisplay();
  });
  
  // Live updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "statsUpdate") {
      updateUI(message.data);
    }
  });
  
  function updateUI(data) {
    // Update status badge
    statusBadge.textContent = data.isActive ? 'Active' : 'Paused';
    statusBadge.className = `status-badge ${data.isActive ? 'active' : 'paused'} fade-in`;
    
    // Update button
    toggleBtn.textContent = data.isActive ? 'Pause Monitoring' : 'Resume Monitoring';
    toggleBtn.className = `toggle-button ${data.isActive ? '' : 'paused'}`;
    
    // Update URL
    currentUrl = data.lastUrl || 'None yet';
    urlDisplay.textContent = currentUrl;
    
    // Show/hide URL toggle for long URLs
    if (currentUrl.length > 40 && currentUrl !== 'None yet') {
      urlToggle.style.display = 'block';
      if (!isUrlExpanded) {
        urlDisplay.classList.add('collapsed');
      }
    } else {
      urlToggle.style.display = 'none';
      urlDisplay.classList.remove('collapsed');
    }
    
    // Update stats directly without animation
    loginCount.textContent = data.loginForms || 0;
    policyCount.textContent = data.policyLinks || 0;
  }
  
  function toggleUrlDisplay() {
    if (isUrlExpanded) {
      urlDisplay.classList.add('collapsed');
      urlToggle.textContent = 'Show More';
    } else {
      urlDisplay.classList.remove('collapsed');
      urlToggle.textContent = 'Show Less';
    }
  }
});