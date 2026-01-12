// Content script to detect font properties on hover
(function () {
    let hoverListener = null;
    let mouseOutListener = null;
    let documentMouseLeaveListener = null;
    let debounceTimer = null;
    let currentlyHighlightedElement = null;
    const DEBOUNCE_DELAY = 100; // ms

    // Helper function to check if extension context is still valid
    function isExtensionContextValid() {
        try {
            // Try to access chrome.runtime.id - if context is invalid, this will throw
            return chrome.runtime && chrome.runtime.id !== undefined;
        } catch (e) {
            return false;
        }
    }

    // Helper function to safely send messages
    function safeSendMessage(message, callback) {
        if (!isExtensionContextValid()) {
            // Context invalidated - stop all listeners
            stopHoverDetection();
            return;
        }

        try {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    // Check if error is due to invalid context
                    if (chrome.runtime.lastError.message.includes("Extension context invalidated")) {
                        stopHoverDetection();
                        return;
                    }
                }
                if (callback) {
                    callback(response);
                }
            });
        } catch (e) {
            // Context was invalidated during the call
            if (e.message && e.message.includes("Extension context invalidated")) {
                stopHoverDetection();
            }
        }
    }

    function getFontProperties(element) {
        const computedStyle = window.getComputedStyle(element);
        const fontFamily = computedStyle.fontFamily;
        const fontWeight = computedStyle.fontWeight;
        const fontSize = computedStyle.fontSize;
        const lineHeight = computedStyle.lineHeight;

        // Extract just the first font family (remove fallbacks)
        const primaryFamily = fontFamily.split(",")[0].replace(/['"]/g, "").trim();

        return {
            family: primaryFamily,
            weight: fontWeight,
            fontSize: fontSize,
            lineHeight: lineHeight,
        };
    }

    function highlightElement(element) {
        // Remove highlight from previous element
        if (currentlyHighlightedElement && currentlyHighlightedElement !== element) {
            removeHighlight(currentlyHighlightedElement);
        }

        // Add highlight to current element
        if (element && element !== currentlyHighlightedElement) {
            element.style.outline = "2px solid #4285f4";
            element.style.outlineOffset = "2px";
            element.style.boxShadow = "0 0 0 2px rgba(66, 133, 244, 0.3)";
            currentlyHighlightedElement = element;
        }
    }

    function removeHighlight(element) {
        if (element) {
            element.style.outline = "";
            element.style.outlineOffset = "";
            element.style.boxShadow = "";
        }
        if (element === currentlyHighlightedElement) {
            currentlyHighlightedElement = null;
        }
    }

    function clearAllHighlights() {
        if (currentlyHighlightedElement) {
            removeHighlight(currentlyHighlightedElement);
        }
    }

    function startHoverDetection() {
        if (hoverListener) {
            return; // Already started
        }

        mouseOutListener = (e) => {
            // Remove highlight when mouse leaves the element
            if (e.target === currentlyHighlightedElement) {
                removeHighlight(e.target);
            }

            // Check if mouse left the document (no relatedTarget means it left the window)
            if (!e.relatedTarget || (e.relatedTarget === document.body && e.target === document.documentElement)) {
                // Mouse left the page
                clearAllHighlights();
                safeSendMessage({
                    type: "MOUSE_LEFT_PAGE",
                });
            }
        };

        // Also listen for mouseleave on document
        documentMouseLeaveListener = () => {
            clearAllHighlights();
            safeSendMessage({
                type: "MOUSE_LEFT_PAGE",
            });
        };

        hoverListener = (e) => {
            // Debounce to avoid too many messages
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(() => {
                const fontProps = getFontProperties(e.target);
                // Highlight the element on the page
                highlightElement(e.target);
                // Send message to sidepanel
                safeSendMessage({
                    type: "FONT_HOVER",
                    font: fontProps,
                });
            }, DEBOUNCE_DELAY);
        };

        document.addEventListener("mouseover", hoverListener, true);
        document.addEventListener("mouseout", mouseOutListener, true);
        document.addEventListener("mouseleave", documentMouseLeaveListener, true);
    }

    function stopHoverDetection() {
        if (hoverListener) {
            document.removeEventListener("mouseover", hoverListener, true);
            hoverListener = null;
        }
        if (mouseOutListener) {
            document.removeEventListener("mouseout", mouseOutListener, true);
            mouseOutListener = null;
        }
        if (documentMouseLeaveListener) {
            document.removeEventListener("mouseleave", documentMouseLeaveListener, true);
            documentMouseLeaveListener = null;
        }
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        // Clear any remaining highlights
        clearAllHighlights();
    }

    // Listen for messages from sidepanel
    try {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            // Check if context is still valid before processing
            if (!isExtensionContextValid()) {
                stopHoverDetection();
                return false;
            }

            try {
                if (message.type === "START_HOVER_DETECTION") {
                    startHoverDetection();
                    sendResponse({ success: true });
                } else if (message.type === "STOP_HOVER_DETECTION") {
                    stopHoverDetection();
                    sendResponse({ success: true });
                }
                return true; // Keep channel open for async response
            } catch (e) {
                // Context invalidated during processing
                if (e.message && e.message.includes("Extension context invalidated")) {
                    stopHoverDetection();
                }
                return false;
            }
        });
    } catch (e) {
        // Context already invalidated when trying to add listener
        // This is fine - the content script will just not receive messages
    }
})();
