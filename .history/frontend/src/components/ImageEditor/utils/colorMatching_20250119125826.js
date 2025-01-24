export const matchColors = (background, product, setActiveFilters) => {
    if (!background || !product) return;

    // Create canvas elements for color analysis
    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d');
    const prodCanvas = document.createElement('canvas');
    const prodCtx = prodCanvas.getContext('2d');

    // Set canvas sizes
    bgCanvas.width = background.width;
    bgCanvas.height = background.height;
    prodCanvas.width = product.width;
    prodCanvas.height = product.height;

    // Draw images
    bgCtx.drawImage(background, 0, 0);
    prodCtx.drawImage(product, 0, 0);

    // Get image data
    const bgData = bgCtx.getImageData(0, 0, bgCanvas.width, bgCanvas.height).data;
    const prodData = prodCtx.getImageData(0, 0, prodCanvas.width, prodCanvas.height).data;

    // Calculate average colors
    let bgR = 0, bgG = 0, bgB = 0;
    let prodR = 0, prodG = 0, prodB = 0;
    let bgPixels = 0, prodPixels = 0;

    // Background analysis
    for (let i = 0; i < bgData.length; i += 4) {
        if (bgData[i + 3] > 0) { // Check alpha channel
            bgR += bgData[i];
            bgG += bgData[i + 1];
            bgB += bgData[i + 2];
            bgPixels++;
        }
    }

    // Product analysis
    for (let i = 0; i < prodData.length; i += 4) {
        if (prodData[i + 3] > 0) { // Check alpha channel
            prodR += prodData[i];
            prodG += prodData[i + 1];
            prodB += prodData[i + 2];
            prodPixels++;
        }
    }

    // Calculate averages
    bgR /= bgPixels;
    bgG /= bgPixels;
    bgB /= bgPixels;
    prodR /= prodPixels;
    prodG /= prodPixels;
    prodB /= prodPixels;

    // Calculate adjustments
    const brightnessAdjust = ((bgR + bgG + bgB) / 3) / ((prodR + prodG + prodB) / 3);
    const saturationAdjust = Math.sqrt(
        (Math.pow(bgR - bgG, 2) + Math.pow(bgG - bgB, 2) + Math.pow(bgB - bgR, 2)) /
        (Math.pow(prodR - prodG, 2) + Math.pow(prodG - prodB, 2) + Math.pow(prodB - prodR, 2))
    );

    // Update filters
    setActiveFilters(prev => ({
        ...prev,
        product: {
            ...prev.product,
            brightness: brightnessAdjust,
            saturation: saturationAdjust,
            temperature: (bgR - bgB) / 255,
            tint: (bgG - bgB) / 255,
        }
    }));
};