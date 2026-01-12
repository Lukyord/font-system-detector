import { isContextInvalidated, checkScriptingAPI } from "./utils.js";
import { showError } from "./display.js";

/**
 * Handle runtime errors with proper context validation
 * @param {Error|Object} error - The error to handle
 * @param {string} defaultMessage - Default error message if error doesn't have one
 * @param {HTMLElement} loadingEl - Loading element to hide
 * @param {HTMLElement} errorEl - Error element to display message
 * @returns {boolean} True if error was handled
 */
export function handleRuntimeError(error, defaultMessage, loadingEl, errorEl) {
    if (isContextInvalidated(error)) {
        console.warn("Extension context invalidated");
        return true;
    }
    if (error) {
        showError(defaultMessage || error.message, loadingEl, errorEl);
        return true;
    }
    return false;
}

/**
 * Handle scan-specific errors with user-friendly messages
 * @param {string} errorMsg - The error message
 * @param {HTMLElement} loadingEl - Loading element to hide
 * @param {HTMLElement} errorEl - Error element to display message
 */
export function handleScanError(errorMsg, loadingEl, errorEl) {
    if (
        errorMsg.includes("Cannot access contents") ||
        errorMsg.includes("permission") ||
        errorMsg.includes("host") ||
        errorMsg.includes("Cannot access")
    ) {
        showError(
            "Cannot access this page. Please click the extension icon in the toolbar to grant permission for this tab.",
            loadingEl,
            errorEl
        );
    } else {
        showError("Error: " + errorMsg, loadingEl, errorEl);
    }
}

/**
 * Validate that the Chrome scripting API is available
 * @param {HTMLElement} loadingEl - Loading element to hide
 * @param {HTMLElement} errorEl - Error element to display message
 * @returns {boolean} True if API is available
 */
export function validateScriptingAPI(loadingEl, errorEl) {
    if (!checkScriptingAPI()) {
        showError(
            "Scripting API not available. Please: 1) Reload the extension in chrome://extensions/, 2) Make sure you're using Chrome 88+",
            loadingEl,
            errorEl
        );
        return false;
    }
    return true;
}
