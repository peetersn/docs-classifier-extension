// content.js
// Main logic for hiding the classification banner

(async function() {
  const { log, warn, error, delay } = window.DocsClassifierUtils;

  // Main handler for classification banner - simply hide it after 3 seconds
  async function handleClassificationBanner(banner) {
    log('Classification banner detected, will hide in 3 seconds...');

    try {
      // Wait 3 seconds before hiding
      await delay(3000);

      // Add smooth transition
      banner.style.transition = 'opacity 0.5s ease-out';
      banner.style.opacity = '0';

      log('Banner fading out...');

      // Wait for fade-out to complete, then remove from layout
      await delay(500); // Match the transition duration

      banner.style.display = 'none';
      log('Banner hidden successfully');

      return true;
    } catch (e) {
      error('Error hiding banner:', e);
      return false;
    }
  }

  // Banners already handled (hidden or being hidden). The inline
  // display:none stays on the element, so it never needs handling twice.
  const handledBanners = new WeakSet();

  // Run by the shared observer whenever elements are added
  function checkClassificationBanner() {
    const banner = document.getElementById('docs-feature-level-banner');
    if (banner && !handledBanners.has(banner)) {
      handledBanners.add(banner);
      handleClassificationBanner(banner);
    }
  }

  // Initialize
  function init() {
    log('Google Docs Banner Hider initialized');
    log('Version: 2.3.0');
    log('Watching for classification banners...');

    window.DocsClassifierObserver.register('classification-banner', checkClassificationBanner);

    // Start watching; also checks for a banner already on the page
    window.DocsClassifierObserver.start();

    log('Ready to hide classification banners');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
