// Enable side panel globally
chrome.sidePanel.setOptions({
    path: "sidepanel.html",
    enabled: true,
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
    await chrome.sidePanel.open({ tabId: tab.id });
});

// Handle messages from sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "CHECK_GOOGLE_FONTS") {
        checkGoogleFonts(message.fonts)
            .then((result) => {
                sendResponse({ success: true, data: result });
            })
            .catch((error) => {
                console.error("Error checking Google Fonts:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Indicates we will send a response asynchronously
    }
});

async function checkGoogleFonts(fonts) {
    const uniqueFontFamilies = [...new Set(fonts.map((font) => font.family))];

    try {
        const response = await fetch("https://font-system-detector-36829541347.asia-southeast3.run.app/fonts/check", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fonts: uniqueFontFamilies }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();
        const fontMap = new Map();

        results.forEach((result) => {
            fontMap.set(result.font, {
                found: result.status === "found",
                link: result.link || null,
            });
        });

        return Object.fromEntries(fontMap);
    } catch (error) {
        console.error("Error checking Google Fonts:", error);
        return {};
    }
}
