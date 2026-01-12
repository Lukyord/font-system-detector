import { isContextInvalidated } from "./utils.js";

/**
 * Message types used for communication between content script and sidepanel
 */
export const MESSAGE_TYPES = {
    START_HOVER_DETECTION: "START_HOVER_DETECTION",
    STOP_HOVER_DETECTION: "STOP_HOVER_DETECTION",
    FONT_HOVER: "FONT_HOVER",
    MOUSE_LEFT_PAGE: "MOUSE_LEFT_PAGE",
};

/**
 * Safely send a message to a content script in a tab
 * @param {number} tabId - The ID of the tab to send the message to
 * @param {Object} message - The message object to send
 * @param {Function} callback - Optional callback(error, response)
 */
export function sendMessageToTab(tabId, message, callback) {
    try {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                if (isContextInvalidated(chrome.runtime.lastError)) {
                    console.warn("Extension context invalidated");
                }
                if (callback) callback(chrome.runtime.lastError);
                return;
            }
            if (callback) callback(null, response);
        });
    } catch (e) {
        if (isContextInvalidated(e)) {
            console.warn("Extension context invalidated");
        }
        if (callback) callback(e);
    }
}
