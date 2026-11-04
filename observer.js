// observer.js
// Shared MutationObserver. Feature modules register a check function; all
// checks run together, throttled, whenever elements are added to the page.
// One observer per page instead of one per feature.

(function() {
  const { log, error } = window.DocsClassifierUtils;

  const THROTTLE_MS = 250; // Coalesce mutation bursts into one pass

  const checks = [];
  let observer = null;
  let scanScheduled = false;

  function runCheck({ name, check }) {
    try {
      check();
    } catch (e) {
      error(`Check "${name}" failed:`, e);
    }
  }

  function runChecks() {
    scanScheduled = false;
    checks.forEach(runCheck);
  }

  // Callback when mutations are detected
  function onMutation(mutations) {
    if (scanScheduled) {
      return;
    }

    // Docs mutates the DOM constantly while editing; only scan when
    // elements were actually added.
    const addedElement = mutations.some(m =>
      Array.prototype.some.call(m.addedNodes, n => n.nodeType === Node.ELEMENT_NODE));
    if (!addedElement) {
      return;
    }

    scanScheduled = true;
    setTimeout(runChecks, THROTTLE_MS);
  }

  // Register a check. Safe to call before or after start().
  function register(name, check) {
    const entry = { name, check };
    checks.push(entry);
    log(`Registered check: ${name}`);
    if (observer) {
      runCheck(entry);
    }
  }

  // Start observing
  function startObserver() {
    if (observer) {
      log('Observer already running');
      return;
    }

    log('Starting MutationObserver...');

    observer = new MutationObserver(onMutation);

    // Observe entire document body for added elements
    observer.observe(document.body, {
      childList: true,      // Watch for added/removed children
      subtree: true,        // Watch entire tree
      attributes: false,    // Don't watch attribute changes (performance)
      characterData: false  // Don't watch text changes (performance)
    });

    log('MutationObserver started');

    // Catch anything already on the page
    runChecks();
  }

  // Stop observing (for cleanup)
  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
      log('MutationObserver stopped');
    }
  }

  // Export
  window.DocsClassifierObserver = {
    register,
    start: startObserver,
    stop: stopObserver
  };
})();
