document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle');
  const statusBadge = document.getElementById('statusBadge');
  const urlDisplay = document.getElementById('urlDisplay');
  const urlToggle = document.getElementById('urlToggle');
  const loginCount = document.getElementById('loginCount');
  const policyCount = document.getElementById('policyCount');
  const policySummary = document.getElementById('policySummary');
  const viewPolicyBtn = document.getElementById('viewPolicyBtn');
  
  let isUrlExpanded = false;
  let currentUrl = '';
  
  chrome.runtime.sendMessage({ type: "getStats" }, (stats) => {
    updateUI(stats || {});
  });
  
  toggleBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: "getStats" }, (stats) => {
      const newState = !stats.isActive;
      chrome.runtime.sendMessage({
        type: "setActive",
        active: newState
      });
      
      toggleBtn.classList.add('pulse');
      setTimeout(() => toggleBtn.classList.remove('pulse'), 600);
      updateUI({ ...stats, isActive: newState });
    });
  });
  
  urlToggle.addEventListener('click', () => {
    isUrlExpanded = !isUrlExpanded;
    toggleUrlDisplay();
  });
  
  viewPolicyBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: "getProcessedPolicy" }, (policy) => {
      if (policy) {
        policySummary.textContent = policy.summary;
        policySummary.style.display = 'block';
        viewPolicyBtn.style.display = 'none';
      }
    });
  });
  
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "statsUpdate") {
      updateUI(message.data);
    }
  });
  
  function updateUI(data) {
    statusBadge.textContent = data.isActive ? 'Active' : 'Paused';
    statusBadge.className = `status-badge ${data.isActive ? 'active' : 'paused'} fade-in`;
    
    toggleBtn.textContent = data.isActive ? 'Pause Monitoring' : 'Resume Monitoring';
    toggleBtn.className = `toggle-button ${data.isActive ? '' : 'paused'}`;
    
    currentUrl = data.lastUrl || 'None yet';
    urlDisplay.textContent = currentUrl;
    
    if (currentUrl.length > 40 && currentUrl !== 'None yet') {
      urlToggle.style.display = 'block';
      if (!isUrlExpanded) {
        urlDisplay.classList.add('collapsed');
      }
    } else {
      urlToggle.style.display = 'none';
      urlDisplay.classList.remove('collapsed');
    }
    
    loginCount.textContent = data.loginForms || 0;
    policyCount.textContent = data.policyLinks || 0;
    
    if (data.processedPolicy) {
      viewPolicyBtn.style.display = 'block';
      policySummary.style.display = 'none';
    } else {
      viewPolicyBtn.style.display = 'none';
      policySummary.style.display = 'none';
    }
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