# OpenGrok Modern Boost - Chrome Extension

This Chrome extension modernizes OpenGrok's interface with improved styling and GitHub integration.

## Installation

### Developer Mode Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select this directory (`opengrok-arc-boost`)
5. The extension will be installed and active

### Files Structure

```
opengrok-arc-boost/
├── manifest.json        # Extension configuration
├── content.js           # Main content script (GitHub integration)
├── opengrok-themes.js   # Native theme system for syntax highlighting
├── styles.css           # Modern UI styles
├── popup.html           # Extension popup
├── icons/               # Extension icons
│   └── icon.svg
└── generate-icons.html  # Icon generator (optional)
```

## Features

- **Modern Design**: Clean, professional interface
- **GitHub Integration**: Floating button to open files in GitHub
- **Enhanced Syntax Highlighting**: Native theme system with 12+ color schemes
- **Keyboard Shortcuts**:
  - Press `G` to open current file in GitHub
  - Press `T` to open theme selector for syntax highlighting
- **Line Preservation**: Maintains line numbers when switching to GitHub
- **Theme Customization**: Choose from 13+ built-in themes or add custom CSS

## Usage

1. Navigate to any OpenGrok instance
2. The extension automatically applies styling
3. Click the floating "GitHub" button or press `G` to open in GitHub
4. Use the extension popup to see available features

## Custom Repository Mapping

To customize GitHub repository mappings, edit `content.js` and uncomment/modify:

```javascript
window.OPEN_GITHUB_MAP = {
  "project-name": "https://github.com/owner/repo",
};
```

## Notes

- The extension activates on pages matching `/xref/*`, `/search*`, and `/source/*` patterns
- GitHub repository detection is automatic but can be overridden
- Settings are cached in localStorage for 24 hours

## Icons

To generate proper PNG icons:

1. Open `generate-icons.html` in a browser
2. Right-click each canvas and save as PNG with the specified filename
3. Move the PNG files to the `icons/` directory
4. Update `manifest.json` to reference the PNG files instead of SVG

## Original Arc Boost

This extension is based on the Arc Browser boost for OpenGrok. The original boost features have been adapted for Chrome extension architecture.
