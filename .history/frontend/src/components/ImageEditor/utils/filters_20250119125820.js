import Konva from 'konva';

export const applyFilters = (type, filters) => {
    const filtersList = [];
    const filterConfig = {};

    if (filters.brightness !== 1) {
        filtersList.push(Konva.Filters.Brightness);
        filterConfig.brightness = filters.brightness - 1;
    }

    if (filters.contrast !== 1) {
        filtersList.push(Konva.Filters.Contrast);
        filterConfig.contrast = filters.contrast;
    }

    if (filters.blur !== 0) {
        filtersList.push(Konva.Filters.Blur);
        filterConfig.blurRadius = filters.blur;
    }

    if (filters.saturation !== 1) {
        filtersList.push(Konva.Filters.HSL);
        filterConfig.saturation = filters.saturation;
    }

    if (filters.hue !== 0) {
        if (!filtersList.includes(Konva.Filters.HSL)) {
            filtersList.push(Konva.Filters.HSL);
        }
        filterConfig.hue = filters.hue;
    }

    return {
        filters: filtersList,
        ...filterConfig
    };
};