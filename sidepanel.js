import { isContextInvalidated } from "./functions/utils.js";
import { MESSAGE_TYPES } from "./functions/messaging.js";
import { resetUI, updateHoverButtonUI, clearHighlights, highlightFontCombination } from "./functions/ui.js";
import { injectHoverDetection, startHoverDetection, stopHoverDetection } from "./functions/hover.js";
import { scanFonts as executeScanFonts } from "./functions/scanning.js";
import { updateCurrentTab } from "./functions/tabs.js";
import { displayFonts } from "./functions/display.js";
import { checkGoogleFonts } from "./functions/api.js";

// DOM element references
const scanButton = document.getElementById("scanButton");
const singleHoverButton = document.getElementById("singleHoverButton");
const groupHoverButton = document.getElementById("groupHoverButton");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const resultsEl = document.getElementById("results");

// ==========================================================
// STATE MANAGEMENT
// ==========================================================
const state = {
    hoverModeEnabled: false,
    hoverMode: null, // "single" or "group"
    currentTabIdForHover: null,
    currentTabId: null,
};

// ==========================================================
// HELPER FUNCTIONS
// ==========================================================

function resetHoverMode() {
    state.hoverModeEnabled = false;
    state.hoverMode = null;
    state.currentTabIdForHover = null;
    resetUI(errorEl, resultsEl, scanButton, singleHoverButton, groupHoverButton);
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

async function onScanSuccess(tabId, fonts) {
    const googleFontsMap = await checkGoogleFonts(fonts);
    displayFonts(fonts, loadingEl, resultsEl, googleFontsMap);
    setupAccordion();
    injectHoverDetection(tabId, loadingEl, errorEl);
    state.currentTabIdForHover = tabId;
    singleHoverButton.disabled = false;
    groupHoverButton.disabled = false;
}

// ==========================================================
// MAIN FUNCTIONS
// ==========================================================
function scanFonts() {
    resetUI(errorEl, resultsEl, scanButton, singleHoverButton, groupHoverButton);
    executeScanFonts({
        loadingEl,
        errorEl,
        resultsEl,
        scanButton,
        hoverToggleButton: singleHoverButton,
        onSuccess: onScanSuccess,
    });
}

function toggleSingleHoverMode() {
    if (state.hoverModeEnabled && state.hoverMode === "single") {
        state.hoverModeEnabled = false;
        state.hoverMode = null;
        stopHoverDetection(state.currentTabIdForHover);
        updateHoverButtonUI(singleHoverButton, false);
        updateHoverButtonUI(groupHoverButton, false);
    } else {
        if (state.hoverModeEnabled) {
            stopHoverDetection(state.currentTabIdForHover);
        }
        state.hoverModeEnabled = true;
        state.hoverMode = "single";
        startHoverDetection(state.currentTabIdForHover, loadingEl, errorEl, "single");
        updateHoverButtonUI(singleHoverButton, true);
        updateHoverButtonUI(groupHoverButton, false);
    }
}

function toggleGroupHoverMode() {
    if (state.hoverModeEnabled && state.hoverMode === "group") {
        state.hoverModeEnabled = false;
        state.hoverMode = null;
        stopHoverDetection(state.currentTabIdForHover);
        updateHoverButtonUI(singleHoverButton, false);
        updateHoverButtonUI(groupHoverButton, false);
    } else {
        if (state.hoverModeEnabled) {
            stopHoverDetection(state.currentTabIdForHover);
        }
        state.hoverModeEnabled = true;
        state.hoverMode = "group";
        startHoverDetection(state.currentTabIdForHover, loadingEl, errorEl, "group");
        updateHoverButtonUI(singleHoverButton, false);
        updateHoverButtonUI(groupHoverButton, true);
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
    singleHoverButton.addEventListener("click", toggleSingleHoverMode);
    groupHoverButton.addEventListener("click", toggleGroupHoverMode);

    chrome.tabs.onActivated.addListener(() => {
        updateCurrentTab(state, () => {
            if (state.hoverModeEnabled) {
                resetHoverMode();
            }
        });
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (changeInfo.status === "complete" && tabId === state.currentTabId) {
            resetUI(errorEl, resultsEl, scanButton, singleHoverButton, groupHoverButton);
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
