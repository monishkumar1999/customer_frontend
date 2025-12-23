/**
 * Generates a procedural normal map for a fabric weave pattern.
 * Vertical and horizontal lines simulating threads.
 * 
 * @param {number} width - Texture width (e.g., 512)
 * @param {number} height - Texture height (e.g., 512)
 * @param {number} scale - Scale of the weave (smaller = tighter weave)
 * @returns {string} - Data URL of the generated normal map
 */
export const generateFabricNormalMap = (width = 512, height = 512, scale = 4, type = 'plain') => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // fill neutral normal color (128, 128, 255) -> (0.5, 0.5, 1.0)
    ctx.fillStyle = "rgb(128, 128, 255)";
    ctx.fillRect(0, 0, width, height);

    // Function to draw bumps
    // We want to simulate threads which are rounded.
    // A bump in Height Map = Slope in Normal Map.
    // For simplicity, we'll draw grayscale height map details first then convert?
    // Or just draw directly to normal map by simulating the slope colors?

    // Easier approach: Draw a height map (black/white) then convert to normal map.

    const heightCanvas = document.createElement('canvas');
    heightCanvas.width = width;
    heightCanvas.height = height;
    const hCtx = heightCanvas.getContext('2d');

    // Fill background mid-grey
    hCtx.fillStyle = "#808080";
    hCtx.fillRect(0, 0, width, height);
    hCtx.lineWidth = scale / 2;
    hCtx.strokeStyle = "#C0C0C0"; // High point of thread

    if (type === 'plain') {
        const spacing = scale;
        // Vertical threads
        for (let x = 0; x <= width; x += spacing) {
            hCtx.beginPath(); hCtx.moveTo(x, 0); hCtx.lineTo(x, height); hCtx.stroke();
        }
        // Horizontal threads
        for (let y = 0; y <= height; y += spacing) {
            hCtx.beginPath(); hCtx.moveTo(0, y); hCtx.lineTo(width, y); hCtx.stroke();
        }
    } else if (type === 'twill') {
        // Diagonal lines (Denim)
        const spacing = scale;
        for (let offset = -height; offset < width; offset += spacing) {
            hCtx.beginPath();
            hCtx.moveTo(offset, 0);
            hCtx.lineTo(offset + height, height); // 45 degree diagonal
            hCtx.stroke();
        }
        // Add fainter varying weave
        hCtx.strokeStyle = "#A0A0A0";
        hCtx.lineWidth = scale / 4;
        for (let x = 0; x <= width; x += spacing * 2) {
            hCtx.beginPath(); hCtx.moveTo(x, 0); hCtx.lineTo(x, height); hCtx.stroke();
        }
    } else if (type === 'knit') {
        // V-loops for Knit
        const loopW = scale * 2;
        const loopH = scale * 1.5;
        hCtx.lineWidth = scale / 3;

        for (let y = 0; y < height; y += loopH) {
            for (let x = 0; x < width; x += loopW) {
                // Shift every other row
                const xOffset = (Math.floor(y / loopH) % 2) * (loopW / 2);
                const cx = x + xOffset;

                hCtx.beginPath();
                // approximate a "V" or loop
                hCtx.moveTo(cx, y);
                hCtx.quadraticCurveTo(cx + loopW / 2, y + loopH, cx + loopW, y); // Down curve
                hCtx.stroke();
            }
        }
    }

    // Now convert height map to normal map logic (simplified pixel processing)
    const imgData = hCtx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const normalImgData = ctx.createImageData(width, height);
    const nData = normalImgData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;

            // Get neighbors for slope
            const left = data[idx - 4] || data[idx];
            const right = data[idx + 4] || data[idx];
            const up = data[((y - 1) * width + x) * 4] || data[idx];
            const down = data[((y + 1) * width + x) * 4] || data[idx];

            // Calculate slope
            const dx = (right - left) / 255;
            const dy = (down - up) / 255;

            // Normalize
            let nz = 1.0;
            const len = Math.sqrt(dx * dx + dy * dy + nz * nz);

            const nx = dx / len;
            const ny = dy / len;
            // const normalizedZ = nz / len; // effectively ~1 for shallow bumps

            // Map -1..1 to 0..255
            nData[idx] = (nx + 1) * 127.5;     // R
            nData[idx + 1] = (ny + 1) * 127.5; // G
            nData[idx + 2] = 255;              // B (Simplified, usually calc'd)
            nData[idx + 3] = 255;              // Alpha
        }
    }

    ctx.putImageData(normalImgData, 0, 0);
    return canvas.toDataURL();
};
