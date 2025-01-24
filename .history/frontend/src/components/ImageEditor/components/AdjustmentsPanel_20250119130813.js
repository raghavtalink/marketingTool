import React from 'react';
import './AdjustmentsPanel.css';

const AdjustmentsPanel = ({ 
    selectedId, 
    activeFilters, 
    setActiveFilters,
    textElements,
    setTextElements 
}) => {
    const handleFilterChange = (type, filter, value) => {
        setActiveFilters(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [filter]: parseFloat(value)
            }
        }));
    };

    const getSelectedType = () => {
        if (!selectedId) return null;
        if (selectedId === 'background') return 'background';
        if (selectedId === 'product') return 'product';
        if (selectedId.startsWith('text-')) return 'text';
        return null;
    };

    const selectedType = getSelectedType();

    if (!selectedType) {
        return (
            <div className="adjustments-panel">
                <h3>Adjustments</h3>
                <p className="no-selection">Select an element to adjust</p>
            </div>
        );
    }

    return (
        <div className="adjustments-panel">
            <h3>Adjustments</h3>
            
            {(selectedType === 'background' || selectedType === 'product') && (
                <div className="adjustments-group">
                    <div className="adjustment-control">
                        <label>Brightness</label>
                        <div className="slider-container">
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={activeFilters[selectedType].brightness}
                                onChange={(e) => handleFilterChange(selectedType, 'brightness', e.target.value)}
                            />
                            <input
                                type="number"
                                value={activeFilters[selectedType].brightness}
                                step="0.1"
                                onChange={(e) => handleFilterChange(selectedType, 'brightness', e.target.value)}
                                className="number-input"
                            />
                        </div>
                    </div>

                    <div className="adjustment-control">
                        <label>Contrast</label>
                        <div className="slider-container">
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={activeFilters[selectedType].contrast}
                                onChange={(e) => handleFilterChange(selectedType, 'contrast', e.target.value)}
                            />
                            <input
                                type="number"
                                value={activeFilters[selectedType].contrast}
                                step="0.1"
                                onChange={(e) => handleFilterChange(selectedType, 'contrast', e.target.value)}
                                className="number-input"
                            />
                        </div>
                    </div>

                    <div className="adjustment-control">
                        <label>Saturation</label>
                        <div className="slider-container">
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={activeFilters[selectedType].saturation}
                                onChange={(e) => handleFilterChange(selectedType, 'saturation', e.target.value)}
                            />
                            <input
                                type="number"
                                value={activeFilters[selectedType].saturation}
                                step="0.1"
                                onChange={(e) => handleFilterChange(selectedType, 'saturation', e.target.value)}
                                className="number-input"
                            />
                        </div>
                    </div>

                    <div className="adjustment-control">
                        <label>Blur</label>
                        <div className="slider-container">
                            <input
                                type="range"
                                min="0"
                                max="20"
                                step="0.5"
                                value={activeFilters[selectedType].blur}
                                onChange={(e) => handleFilterChange(selectedType, 'blur', e.target.value)}
                            />
                            <input
                                type="number"
                                value={activeFilters[selectedType].blur}
                                step="0.5"
                                onChange={(e) => handleFilterChange(selectedType, 'blur', e.target.value)}
                                className="number-input"
                            />
                        </div>
                    </div>
                </div>
            )}

            {selectedType === 'text' && (
                <div className="text-controls">
                    {/* Text controls will be added in the next part */}
                </div>
            )}
        </div>
    );
};

export default AdjustmentsPanel;