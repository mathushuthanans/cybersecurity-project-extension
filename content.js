const observer = new MutationObserver(() => scanPage());

function scanPage() {
  // Detect login forms
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  const loginForms = Array.from(document.forms).filter(form => 
    form.querySelector('input[type="password"]')
  );
  
  // Detect privacy-related links
  const allLinks = Array.from(document.querySelectorAll('a[href]'));
  const policyLinks = allLinks.filter(link => {
    const href = link.href.toLowerCase();
    const text = link.textContent.toLowerCase();
    return /privacy|policy|terms|conditions|gdpr|ccpa|legal/i.test(href) || 
           /privacy|policy|terms|conditions|gdpr|ccpa|legal/i.test(text);
  }).map(link => link.href);

  // Prepare data
  const pageData = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    loginForms: loginForms.length,
    policyLinks: [...new Set(policyLinks)],
    pageTitle: document.title
  };

  // Send to background
  chrome.runtime.sendMessage({
    type: "pageData",
    data: pageData
  });
}

// Start observing
observer.observe(document, {
  childList: true,
  subtree: true,
  attributes: true
});

// Initial scan
scanPage();