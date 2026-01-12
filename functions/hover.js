import { isContextInvalidated } from "./utils.js";
import { MESSAGE_TYPES, sendMessageToTab } from "./messaging.js";
import { handleRuntimeError } from "./errors.js";
import { clearHighlights } from "./ui.js";

/**
 * Inject the hover detection content script into a tab
 * @param {number} tabId - The tab ID to inject into
 * @param {HTMLElement} loadingEl - Loading element for error display
 * @param {HTMLElement} errorEl - Error element for error display
 */
export function injectHoverDetection(tabId, loadingEl, errorEl) {
    chrome.scripting.executeScript(
        {
            target: { tabId: tabId },
            files: ["content-script.js"],
        },
        () => {
            if (handleRuntimeError(chrome.runtime.lastError, null, loadingEl, errorEl)) {
                return;
            }
            sendMessageToTab(tabId, { type: MESSAGE_TYPES.START_HOVER_DETECTION });
        }
    );
}

/**
 * Start hover detection for the current tab
 * @param {number} currentTabIdForHover - Current tab ID for hover detection
 * @param {HTMLElement} loadingEl - Loading element for error display
 * @param {HTMLElement} errorEl - Error element for error display
 */
export function startHoverDetection(currentTabIdForHover, loadingEl, errorEl) {
    if (!currentTabIdForHover) {
        return;
    }

    sendMessageToTab(currentTabIdForHover, { type: MESSAGE_TYPES.START_HOVER_DETECTION }, (error) => {
        if (error && !isContextInvalidated(error)) {
            // Content script might not be injected, try to inject it
            injectHoverDetection(currentTabIdForHover, loadingEl, errorEl);
        }
    });
}

/**
 * Stop hover detection for the current tab
 * @param {number} currentTabIdForHover - Current tab ID for hover detection
 */
export function stopHoverDetection(currentTabIdForHover) {
    if (!currentTabIdForHover) {
        return;
    }

    sendMessageToTab(currentTabIdForHover, {
        type: MESSAGE_TYPES.STOP_HOVER_DETECTION,
    });
    clearHighlights();
}
