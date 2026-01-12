import { scanAllFonts } from "./api.js";
import { displayFonts, showError } from "./display.js";
import { checkScriptingAPI } from "./utils.js";
import { validateScriptingAPI, handleScanError } from "./errors.js";
import { injectHoverDetection } from "./hover.js";

/**
 * Execute font scanning on the current active tab
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.loadingEl - Loading indicator element
 * @param {HTMLElement} options.errorEl - Error display element
 * @param {HTMLElement} options.resultsEl - Results container element
 * @param {HTMLElement} options.scanButton - Scan button element
 * @param {HTMLElement} options.hoverToggleButton - Hover toggle button element
 * @param {Function} options.onSuccess - Callback when scan succeeds (tabId, fonts)
 */
export function scanFonts({ loadingEl, errorEl, resultsEl, scanButton, hoverToggleButton, onSuccess }) {
    loadingEl.style.display = "block";
    scanButton.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            showError("No active tab found", loadingEl, errorEl);
            scanButton.disabled = false;
            return;
        }

        if (!validateScriptingAPI(loadingEl, errorEl)) {
            scanButton.disabled = false;
            return;
        }

        const tab = tabs[0];
        chrome.tabs.get(tab.id, () => {
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    func: scanAllFonts,
                },
                (results) => {
                    scanButton.disabled = false;

                    if (chrome.runtime.lastError) {
                        handleScanError(chrome.runtime.lastError.message, loadingEl, errorEl);
                        return;
                    }

                    if (results?.[0]?.result) {
                        if (onSuccess) {
                            onSuccess(tab.id, results[0].result);
                        }
                    } else {
                        showError("Failed to scan fonts", loadingEl, errorEl);
                    }
                }
            );
        });
    });
}
