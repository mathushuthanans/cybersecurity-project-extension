document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle');
  const lastUrlEl = document.getElementById('lastUrl');
  const loginCountEl = document.getElementById('loginCount');
  const policyCountEl = document.getElementById('policyCount');
  const statusEl = document.getElementById('status');
  
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
      updateUI({ ...stats, isActive: newState });
    });
  });
  
  // Live updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "statsUpdate") {
      updateUI(message.data);
    }
  });
  
  function updateUI(data) {
    toggleBtn.textContent = data.isActive ? 'Pause Monitoring' : 'Resume Monitoring';
    statusEl.textContent = data.isActive ? 'Active and monitoring' : 'Paused';
    statusEl.style.color = data.isActive ? '#27ae60' : '#e74c3c';
    lastUrlEl.textContent = data.lastUrl || 'None yet';
    loginCountEl.textContent = data.loginForms || 0;
    policyCountEl.textContent = data.policyLinks || 0;
  }
});