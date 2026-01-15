# Font Detector

A Chrome browser extension that detects and displays all font combinations found on web pages. The extension provides both scanning and interactive hover modes to help developers and designers identify fonts used on any webpage.

## Features

-   **Font Scanning**: Automatically scans the current webpage and identifies all unique font combinations (family, size, weight, and line-height)
-   **Organized Display**: Fonts are grouped by family, then sorted by size and weight for easy browsing
-   **Hover Mode**: Interactive mode that highlights elements and displays their font properties when you hover over them
-   **Side Panel Interface**: Clean, accessible interface that opens in Chrome's side panel
-   **Real-time Highlighting**: Visual feedback with blue outlines when hovering over elements in hover mode

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Select the `font-system` directory
6. The extension icon should appear in your Chrome toolbar

## Usage

### Scanning Fonts

1. Navigate to any webpage you want to analyze
2. Click the extension icon in the toolbar to open the side panel
3. Click the "Scan Fonts" button
4. Wait for the scan to complete (usually takes a few seconds)
5. Browse the results organized by font family, size, and weight

### Hover Mode

1. After scanning, click "Enable Hover Mode"
2. Move your mouse over elements on the webpage
3. Elements will be highlighted with a blue outline
4. The corresponding font combination in the side panel will be highlighted
5. Click "Disable Hover Mode" to turn off the feature

## How It Works

## Permissions

The extension requires the following permissions:

-   `activeTab`: To access and scan the current tab
-   `scripting`: To inject content scripts for font scanning and hover detection
-   `sidePanel`: To display the extension interface

## Browser Compatibility

-   Chrome 114+ (for Side Panel API support)
-   Other Chromium-based browsers (Edge, Brave, etc.) with Side Panel support
