/**
 * Update the current tab tracking and reset state if tab changed
 * @param {Object} state - State object with currentTabId
 * @param {Function} onTabChange - Callback when tab changes (receives new tabId)
 */
export function updateCurrentTab(state, onTabChange) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id !== state.currentTabId) {
            state.currentTabId = tabs[0].id;
            if (onTabChange) {
                onTabChange(tabs[0].id);
            }
        }
    });
}
