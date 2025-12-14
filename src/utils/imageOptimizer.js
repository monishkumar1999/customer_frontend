
/**
 * Optimizes an image file (JPEG, PNG, SVG, etc.) by resizing it and compressing it.
 * 
 * @param {File} file - The input image file.
 * @param {number} maxWidth - Maximum width (or height) of the output image. Default 1024.
 * @param {number} quality - JPEG/WebP quality (0 to 1). Default 0.8.
 * @returns {Promise<Blob>} - Resolves with the optimized image Blob.
 */
export const optimizeImage = (file, maxWidth = 1024, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.src = url;
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            URL.revokeObjectURL(url); // Clean up original

            // Calculate new dimensions
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            // If it's already small enough, maybe just return original? 
            // But user wants to reduce file size (MB), so re-compression is good even if dimensions are same.
            // But usually resizing is key.

            if (width > maxWidth || height > maxWidth) {
                const ratio = Math.min(maxWidth / width, maxWidth / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // Draw image
            ctx.drawImage(img, 0, 0, width, height);

            // Export. 
            // If original was PNG (transparency), we should likely keep PNG or WebP. 
            // If SVG (UV map), typically it has transparency for the shape. 
            // JPEG doesn't support transparency.
            // WebP supports transparency and good compression.

            // Let's try to determine type.
            const outputType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
            // Note: 'image/png' quality param is not supported in all browsers, 
            // but we can resize which reduces size significantly.
            // For UV masks, usually we want PNG to keep clear edges if possible, but small size.

            if (outputType === 'image/jpeg') {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', quality);
            } else {
                // For PNG, toDataURL/toBlob doesn't always support quality.
                // But resizing from 4000px to 1024px will do the job of "7MB -> 100KB".
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png');
            }
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };
    });
};
