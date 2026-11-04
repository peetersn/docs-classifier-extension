// slides-nudge.js
// Dismisses the Google Slides "Enhance this slide" AI nudge.
//
// slides-nudge.css already hides the nudge visually. This script additionally
// clicks the nudge's own dismiss button so Slides runs its native dismiss
// logic (and stops re-showing it for the current slide).

(function() {
  if (!location.pathname.startsWith('/presentation/')) {
    return;
  }

  const { log, warn } = window.DocsClassifierUtils;

  // Keep in sync with slides-nudge.css
  const NUDGE_SELECTOR = [
    '#canvas-nudge-surface-soy-container',
    '[id^="canvas-nudge-surface"]',
    '[class*="CanvasNudgeSurface"]',
    '[class*="appsElementsGenerativeAiNudge"]',
    '[aria-label="Enhance this slide"]'
  ].join(', ');

  // Dismiss button candidates. Every match is also verified to sit inside a
  // nudge container before clicking, so unrelated "Close" buttons
  // (e.g. "Close side sheet") are never touched.
  const CLOSE_SELECTOR = [
    'button[class*="NudgeDismissButton"]',
    '[class*="appsElementsGenerativeAiNudge"] [aria-label^="Close"]',
    '[id^="canvas-nudge-surface"] [aria-label^="Close"]'
  ].join(', ');

  const COOLDOWN_MS = 2000;      // Don't re-click the same button within this window
  const WARN_INTERVAL_MS = 30000;

  const lastClicked = new WeakMap();
  let lastWarn = 0;

  // Run by the shared observer whenever elements are added
  function dismissNudges() {
    const now = Date.now();
    const buttons = Array.from(document.querySelectorAll(CLOSE_SELECTOR))
      .filter(btn => btn.closest(NUDGE_SELECTOR));

    for (const btn of buttons) {
      if (now - (lastClicked.get(btn) || 0) > COOLDOWN_MS) {
        lastClicked.set(btn, now);
        btn.click();
        log('Dismissed Slides "Enhance this slide" nudge');
      }
    }

    // Tripwire: nudge present but no dismiss button found means the markup
    // probably changed. The CSS still hides it; warn so selectors get updated.
    if (!buttons.length && now - lastWarn > WARN_INTERVAL_MS &&
        document.querySelector(NUDGE_SELECTOR)) {
      lastWarn = now;
      warn('Slides nudge present but no dismiss button matched - selectors may need updating');
    }
  }

  window.DocsClassifierObserver.register('slides-nudge', dismissNudges);
})();
