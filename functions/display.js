export function displayFonts(fonts, loadingEl, resultsEl, googleFontsMap = null) {
    loadingEl.style.display = "none";

    if (fonts.length === 0) {
        resultsEl.innerHTML = '<p class="no-results">No fonts found</p>';
        return;
    }

    // Group fonts by family, then by size
    const fontsByFamily = new Map();
    fonts.forEach((font) => {
        if (!fontsByFamily.has(font.family)) {
            fontsByFamily.set(font.family, new Map());
        }
        const familyMap = fontsByFamily.get(font.family);

        // Parse font size to numeric value for sorting
        const fontSizeNum = parseFloat(font.fontSize);
        if (!familyMap.has(font.fontSize)) {
            familyMap.set(font.fontSize, new Map());
        }
        const sizeMap = familyMap.get(font.fontSize);

        // Store by weight, keeping line height info
        const weightKey = font.weight;
        if (!sizeMap.has(weightKey)) {
            sizeMap.set(weightKey, []);
        }
        sizeMap.get(weightKey).push(font.lineHeight);
    });

    // Sort families alphabetically
    const sortedFamilies = Array.from(fontsByFamily.keys()).sort((a, b) => a.localeCompare(b));

    let html = "";
    html += `<div class="result-ttl"><h2 class="size-h3 weight-semibold">Results</h2></div>`;
    html += `<div class="result-subttl"><h3 class="size-body">${fonts.length} fonts found</h3></div>`;
    html += `<div class="font-list">`;
    sortedFamilies.forEach((family) => {
        const familyMap = fontsByFamily.get(family);
        const googleFontInfo = googleFontsMap?.get(family);
        const isGoogleFont = googleFontInfo?.found || false;
        const googleFontLink = googleFontInfo?.link || null;

        html += `<div class="font-group">`;
        html += `<div class="font-family-header">`;
        html += `<div class="font-family-name"><span class="font-family-name-text">[${family}]</span>`;
        html += `<div class="font-family-header-right">`;
        if (isGoogleFont && googleFontLink) {
            html += `<a href="${googleFontLink}" target="_blank" rel="noopener noreferrer" class="google-font-badge" title="View on Google Fonts">&nbsp;</a>`;
        }
        html += `</div>`;
        html += `</div>`;
        html += `</div>`;
        html += `<div class="font-sizes">`;

        // Sort sizes numerically
        const sortedSizes = Array.from(familyMap.keys()).sort((a, b) => {
            return parseFloat(a) - parseFloat(b);
        });

        sortedSizes.forEach((fontSize) => {
            const sizeMap = familyMap.get(fontSize);
            html += `<div class="font-size-group" data-font-family="${family}" data-font-size="${fontSize}">`;
            html += `<div class="font-size-header-wrapper">`;
            html += `<span class="font-size-header">${fontSize}</span>`;
            html += `<span class="line-height-display" style="display: none"></span>`;
            html += `</div>`;
            html += `<div class="font-weights">`;

            // Sort weights numerically
            const sortedWeights = Array.from(sizeMap.keys()).sort((a, b) => {
                const aNum = typeof a === "string" && a !== "normal" ? parseFloat(a) : 0;
                const bNum = typeof b === "string" && b !== "normal" ? parseFloat(b) : 0;
                return aNum - bNum;
            });

            sortedWeights.forEach((weight) => {
                const lineHeights = sizeMap.get(weight);
                // Create data attributes for each weight with all possible line heights
                const lineHeightsStr = lineHeights.join(",");
                const fontKey = `${family}|${weight}|${fontSize}|${lineHeights[0]}`;
                html += `<span class="font-weight-badge" data-font-key="${fontKey}" data-font-family="${family}" data-font-weight="${weight}" data-font-size="${fontSize}" data-line-heights="${lineHeightsStr}">${weight}</span>`;
            });

            html += `</div>`;
            html += `</div>`;
        });

        html += `</div>`;
        html += `</div>`;
    });
    html += "</div>";

    resultsEl.innerHTML = html;
}

export function showError(message, loadingEl, errorEl) {
    loadingEl.style.display = "none";
    errorEl.textContent = message;
    errorEl.style.display = "block";
}
