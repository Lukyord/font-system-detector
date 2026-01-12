/**
 * Utility functions for extension context and error handling
 */

/**
 * Check if an error indicates the extension context has been invalidated
 * @param {Error|Object} error - The error object to check
 * @returns {boolean} True if context is invalidated
 */
export function isContextInvalidated(error) {
    return error && error.message && error.message.includes("Extension context invalidated");
}

/**
 * Check if the Chrome scripting API is available
 * @returns {boolean} True if scripting API is available
 */
export function checkScriptingAPI() {
    const scripting = chrome.scripting;
    return scripting && typeof scripting.executeScript === "function";
}
