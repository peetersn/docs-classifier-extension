# Google Docs Banner Hider

A Chrome extension that automatically hides Google Docs Data Classification banners and the Google Slides "Enhance this slide" AI nudge.

## Overview

This extension monitors Google Docs, Sheets, and Presentations for Data Classification banners with the ID `docs-feature-level-banner` and automatically hides them after 3 seconds, streamlining your workflow.

## Features

- Automatically detects Data Classification banners (ID: `docs-feature-level-banner`)
- Hides banners automatically after 3 seconds
- Smooth fade-out transition (0.5 seconds)
- Works across Google Docs, Sheets, and Presentations
- Minimal performance impact using efficient DOM observation
- Debug logging for troubleshooting
- Google Slides: hides the "Enhance this slide" AI nudge and clicks its native dismiss button

## Installation

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `/Users/xyz/tools/docs-classifier-extension` directory
5. The extension should appear in your extensions list

### Verify Installation

1. Check that "Google Docs Banner Hider" appears in your extensions
2. The extension icon should be visible (a simple placeholder icon)
3. Make sure the extension is **Enabled** (toggle should be blue/on)

## Testing

### Option A: Test with Real Classification Banner

If you have access to a Google Workspace account with Data Classification enabled:

1. Open a new Google Doc at [docs.google.com](https://docs.google.com)
2. Wait for the classification banner to appear
3. Open DevTools (F12 → Console tab)
4. Look for `[DocsClassifier]` log messages:
   ```
   [DocsClassifier] Google Docs Banner Hider initialized
   [DocsClassifier] Classification banner detected, will hide in 3 seconds...
   [DocsClassifier] Banner hidden successfully
   ```
5. Verify that the banner disappears after 3 seconds

### Option B: Manual Console Testing

If you don't have access to classification banners:

1. Open any Google Doc
2. Open DevTools (F12 → Console tab)
3. Test that the extension loaded:
   ```javascript
   // Check if extension is loaded
   console.log(window.DocsClassifierUtils);
   // Should show object with helper functions

   // Check selectors
   console.log(window.SELECTORS);
   // Should show selector strategies
   ```

## How It Works

### Architecture

The extension consists of three main components:

1. **utils.js**: Helper functions for logging and delays
2. **observer.js**: One shared MutationObserver per page. Feature modules register a check with `DocsClassifierObserver.register(name, fn)`; all checks run together, at most once every 250ms, and only when elements were added
3. **content.js**: Main logic that handles banner detection and hiding
4. **slides-nudge.js / slides-nudge.css**: Google Slides "Enhance this slide" nudge (see below)

### Detection Strategy

- Registers a check with the shared observer, which runs when new elements are added to the page
- Looks up the element with the ID `docs-feature-level-banner` (`getElementById`, very cheap)
- Handles both existing banners on page load and dynamically added banners; each banner element is only handled once

### Google Slides "Enhance this slide" Nudge

On `docs.google.com/presentation/*` only:

1. `slides-nudge.css` is injected at `document_start` and sets `display: none` on the nudge containers, so it never flashes on screen.
2. `slides-nudge.js` registers a check with the shared observer and clicks the nudge's own dismiss button so Slides runs its native dismiss logic. A button is only clicked if it sits inside a nudge container, so unrelated "Close" buttons are never touched.
3. If the nudge is present but no dismiss button matches, a `[DocsClassifier]` warning is logged (at most every 30s): Google probably changed the markup. Update the selectors in **both** `slides-nudge.css` and `slides-nudge.js`.

### Hiding Process

1. Detect classification banner appearing (ID: `docs-feature-level-banner`)
2. Wait 3 seconds
3. Fade out smoothly over 0.5 seconds (opacity transition)
4. Remove from layout by setting `display: none`

## Troubleshooting

### Extension Not Loading

**Issue**: Extension doesn't appear in `chrome://extensions/`

**Solutions**:
- Check that you selected the correct directory (`tools/docs-classifier-extension/`)
- Look for error messages in the Extensions page
- Verify `manifest.json` has valid JSON syntax
- Make sure all files are present in the directory

### Banner Not Detected

**Issue**: Classification banner appears but isn't hidden

**Solutions**:
1. **Check Console Logs**:
   - Open DevTools (F12 → Console)
   - Look for `[DocsClassifier]` messages
   - Check if the banner is being detected

2. **Inspect Banner DOM**:
   - Right-click on the classification banner → Inspect
   - Verify it has the ID `docs-feature-level-banner`
   - If the ID is different, update the ID in `content.js`

### Google Docs URL Not Matched

**Issue**: Extension doesn't activate on Google Docs

**Solutions**:
- Verify you're on a matching URL pattern:
  - `https://docs.google.com/document/*`
  - `https://docs.google.com/spreadsheets/*`
  - `https://docs.google.com/presentation/*`
- Check the manifest `matches` array if using a different Google Workspace domain

### Banner Reappears

**Issue**: Banner reappears after being hidden

**Solutions**:
- The banner might be dynamically re-injected by Google Docs
- Check console logs to see if the extension is detecting and re-hiding it
- The extension should automatically hide it again after 3 seconds each time it appears

## Development

### Debug Mode

Debug logging is enabled by default. To disable:

1. Open `utils.js`
2. Change `const DEBUG = true;` to `const DEBUG = false;`
3. Reload the extension in `chrome://extensions/`

### Modifying Behavior

Key files to modify:

- **content.js**: Change the delay time (currently 3 seconds) or the target class name
- **observer.js**: Shared observer; change `THROTTLE_MS` to tune how often checks run
- **utils.js**: Adjust timing delays
- **manifest.json**: Change matched URLs or add permissions

### Reloading Changes

After making changes:

1. Go to `chrome://extensions/`
2. Find "Google Docs Banner Hider"
3. Click the refresh icon (⟳)
4. Reload any open Google Docs tabs

## File Structure

```
tools/docs-classifier-extension/
├── manifest.json          # Manifest V3 configuration
├── content.js             # Main logic for hiding banners
├── observer.js            # Shared, throttled MutationObserver
├── utils.js               # Helper utilities
├── slides-nudge.css       # Hides the Slides "Enhance this slide" nudge
├── slides-nudge.js        # Clicks the nudge's native dismiss button
├── icons/
│   ├── icon16.png        # 16x16 extension icon (placeholder)
│   ├── icon48.png        # 48x48 extension icon (placeholder)
│   └── icon128.png       # 128x128 extension icon (placeholder)
└── README.md             # This file
```

## Security & Privacy

- **No external requests**: All logic runs locally in your browser
- **No data collection**: No telemetry, analytics, or tracking
- **Minimal permissions**: Only accesses Google Docs URLs you visit
- **No data storage**: Extension doesn't store any information
- **Open source**: All code is available for review

## Future Enhancements

Potential improvements for future versions:

- Configuration UI to adjust delay time before hiding
- Support for hiding other types of banners
- Keyboard shortcut for manual triggering
- Option to completely remove the banner from DOM instead of just hiding
- Statistics on banners hidden

## Support

If the extension isn't working:

1. Check the console for `[DocsClassifier]` logs
2. Inspect the actual DOM structure of the classification banner
3. Verify the banner has the class `docs-feature-level-banner`
4. Test with different Google Docs to verify behavior

## License

Created for internal use. Modify as needed.

## Version

Current version: **2.3.0** - Single shared, throttled MutationObserver for all features

- 2.2.0 - Hide the Google Slides "Enhance this slide" AI nudge
