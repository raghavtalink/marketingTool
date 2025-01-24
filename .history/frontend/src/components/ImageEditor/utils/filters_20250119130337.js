import Konva from 'konva';

export const applyFilters = (type, filters) => {
    const filtersList = [];

    // Brightness
    if (filters.brightness !== 1) {
        filtersList.push(Konva.Filters.Brighten);
    }

    // Contrast
    if (filters.contrast !== 1) {
        filtersList.push(Konva.Filters.Contrast);
    }

    // Blur
    if (filters.blur > 0) {
        filtersList.push(Konva.Filters.Blur);
    }

    // Saturation
    if (filters.saturation !== 1) {
        filtersList.push(Konva.Filters.HSL);
    }

    return {
        filters: filtersList,
        brightness: filters.brightness - 1,
        contrast: filters.contrast,
        blurRadius: filters.blur,
        saturation: filters.saturation,
    };
};