import { isContextInvalidated } from "./functions/utils.js";
import { MESSAGE_TYPES } from "./functions/messaging.js";
import { resetUI, updateHoverButtonUI, clearHighlights, highlightFontCombination } from "./functions/ui.js";
import { injectHoverDetection, startHoverDetection, stopHoverDetection } from "./functions/hover.js";
import { scanFonts as executeScanFonts } from "./functions/scanning.js";
import { updateCurrentTab } from "./functions/tabs.js";
import { displayFonts } from "./functions/display.js";

// DOM element references
const scanButton = document.getElementById("scanButton");
const hoverToggleButton = document.getElementById("hoverToggleButton");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const resultsEl = document.getElementById("results");

// ==========================================================
// STATE MANAGEMENT
// ==========================================================
const state = {
    hoverModeEnabled: false,
    currentTabIdForHover: null,
    currentTabId: null,
};

// ==========================================================
// HELPER FUNCTIONS
// ==========================================================

function resetHoverMode() {
    state.hoverModeEnabled = false;
    state.currentTabIdForHover = null;
    resetUI(errorEl, resultsEl, scanButton, hoverToggleButton);
    clearHighlights();
}

function setupAccordion() {
    const fontHeaders = resultsEl.querySelectorAll(".font-family-header");
    fontHeaders.forEach((header) => {
        header.addEventListener("click", () => {
            const fontGroup = header.closest(".font-group");
            fontGroup.classList.toggle("collapsed");
        });
    });
}

function onScanSuccess(tabId, fonts) {
    displayFonts(fonts, loadingEl, resultsEl);
    setupAccordion();
    injectHoverDetection(tabId, loadingEl, errorEl);
    state.currentTabIdForHover = tabId;
    hoverToggleButton.disabled = false;
}

// ==========================================================
// MAIN FUNCTIONS
// ==========================================================
function scanFonts() {
    resetUI(errorEl, resultsEl, scanButton, hoverToggleButton);
    executeScanFonts({
        loadingEl,
        errorEl,
        resultsEl,
        scanButton,
        hoverToggleButton,
        onSuccess: onScanSuccess,
    });
}

function toggleHoverMode() {
    state.hoverModeEnabled = !state.hoverModeEnabled;
    updateHoverButtonUI(hoverToggleButton, state.hoverModeEnabled);

    if (state.hoverModeEnabled) {
        startHoverDetection(state.currentTabIdForHover, loadingEl, errorEl);
    } else {
        stopHoverDetection(state.currentTabIdForHover);
    }
}

function handleMessage(message) {
    switch (message.type) {
        case MESSAGE_TYPES.FONT_HOVER:
            highlightFontCombination(message.font, state.hoverModeEnabled);
            break;
        case MESSAGE_TYPES.MOUSE_LEFT_PAGE:
            clearHighlights();
            break;
    }
}

function setupMessageListener() {
    try {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            try {
                handleMessage(message);
            } catch (e) {
                if (isContextInvalidated(e)) {
                    console.warn("Extension context invalidated");
                }
            }
        });
    } catch (e) {
        if (isContextInvalidated(e)) {
            console.warn("Extension context invalidated");
        }
    }
}

function setupEventListeners() {
    scanButton.addEventListener("click", scanFonts);
    hoverToggleButton.addEventListener("click", toggleHoverMode);

    chrome.tabs.onActivated.addListener(() => {
        updateCurrentTab(state, () => {
            if (state.hoverModeEnabled) {
                resetHoverMode();
            }
        });
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (changeInfo.status === "complete" && tabId === state.currentTabId) {
            resetUI(errorEl, resultsEl, scanButton, hoverToggleButton);
            if (state.hoverModeEnabled) {
                resetHoverMode();
            }
        }
    });
}

// ==========================================================
// INITIALIZATION
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    setupMessageListener();
    updateCurrentTab(state);
});
