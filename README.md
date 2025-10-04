# OpenGrok Modern Boost

## What This Boost Does

This Arc Browser Boost modernizes OpenGrok's interface and adds convenient GitHub integration.

## Features

### Visual Improvements

- **Clean, modern design** with better typography and spacing
- **High-contrast colors** for improved readability
- **Compact layout** that reduces wasted space
- **Consistent styling** across search results, code view, and directory listings
- **Subtle animations** and hover effects
- **Responsive design** that works on different screen sizes

### GitHub Integration

- **Floating GitHub button** in the bottom-right corner
- **Line number preservation** - if you're viewing line #20 in OpenGrok, it will open to line #20 on GitHub
- **Keyboard shortcut** - press `g` to quickly open the current file in GitHub
- **Automatic URL detection** - figures out the correct GitHub repository automatically
- **Commit SHA support** - when viewing specific file revisions, links to the exact commit
- **Smart detection** - works for both file views and directory listings

### Enhanced UX

- **Better code readability** with improved syntax highlighting
- **Compact search form** that uses space efficiently
- **Fixed overlapping elements** - no more buttons being covered by dropdowns

## How It Works

1. **On OpenGrok pages**, the boost automatically activates
2. **GitHub button appears** when viewing code files or directories

- **Line anchors preserved** - `#20` in OpenGrok becomes `#L20` on GitHub

2. **Click the floating button** to open the current file/directory in GitHub
3. **Press `g` key** for quick access (no modifier keys needed)
4. **For files with specific revisions**, links directly to that commit
5. **For directories**, links to the default branch (main/master)

## Keyboard Shortcuts

- `g` - Open current file/directory in GitHub

The boost makes OpenGrok feel like a modern code browsing tool while maintaining all its powerful search capabilities.
