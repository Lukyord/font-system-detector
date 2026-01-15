// Font scanning function (will be executed in the page context)
// Must be defined inline here because chrome.scripting.executeScript requires
// serializable functions that can't reference external imports
export function scanAllFonts() {
    const fontMap = new Map();
    const allElements = document.querySelectorAll("*");

    allElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);

        const fontFamily = computedStyle.fontFamily;
        const fontWeight = computedStyle.fontWeight;
        const fontSize = computedStyle.fontSize;
        const lineHeight = computedStyle.lineHeight;

        // Create a unique key from the font properties
        const key = `${fontFamily}|${fontWeight}|${fontSize}|${lineHeight}`;

        // Only store if we haven't seen this combination before
        if (!fontMap.has(key)) {
            // Extract just the first font family (remove fallbacks)
            const primaryFamily = fontFamily.split(",")[0].replace(/['"]/g, "").trim();

            fontMap.set(key, {
                family: primaryFamily,
                weight: fontWeight,
                fontSize: fontSize,
                lineHeight: lineHeight,
            });
        }
    });

    // Convert Map to Array
    return Array.from(fontMap.values());
}

export function checkGoogleFonts(fonts) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                type: "CHECK_GOOGLE_FONTS",
                fonts: fonts,
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError);
                    resolve(new Map());
                    return;
                }

                if (response && response.success) {
                    const fontMap = new Map(Object.entries(response.data));
                    resolve(fontMap);
                } else {
                    console.error("Error checking Google Fonts:", response?.error);
                    resolve(new Map());
                }
            }
        );
    });
}
