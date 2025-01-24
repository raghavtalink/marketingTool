import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter, FiAlignRight } from 'react-icons/fi';
import './AdjustmentsPanel.css';

const AdjustmentsPanel = ({ 
    selectedId, 
    activeFilters, 
    setActiveFilters,
    textElements,
    setTextElements
}) => {
    const getSelectedType = () => {
        if (!selectedId) return null;
        if (selectedId === 'background') return 'background';
        if (selectedId === 'product') return 'product';
        if (selectedId.startsWith('text-')) return 'text';
        return null;
    };

    const selectedType = getSelectedType();
    const selectedText = selectedType === 'text' 
        ? textElements.find(t => t.id === selectedId)
        : null;

    const handleFilterChange = (type, filter, value) => {
        setActiveFilters(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [filter]: parseFloat(value)
            }
        }));
    };

    const handleTextUpdate = (changes) => {
        if (!selectedText) return;
        setTextElements(prev => prev.map(text => 
            text.id === selectedId ? { ...text, ...changes } : text
        ));
    };

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
            
            {/* Image Adjustments */}
            {(selectedType === 'background' || selectedType === 'product') && (
                <div className="adjustments-group">
                    <div className="adjustment-control">
                        <label>Brightness</label>
                        <div className="slider-container">
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.05"
                                value={activeFilters[selectedType].brightness}
                                onChange={(e) => handleFilterChange(selectedType, 'brightness', e.target.value)}
                            />
                            <input
                                type="number"
                                value={activeFilters[selectedType].brightness}
                                step="0.05"
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
                                step="0.05"
                                value={activeFilters[selectedType].contrast}
                                onChange={(e) => handleFilterChange(selectedType, 'contrast', e.target.value)}
                            />
                            <input
                                type="number"
                                value={activeFilters[selectedType].contrast}
                                step="0.05"
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
                                step="0.05"
                                value={activeFilters[selectedType].saturation}
                                onChange={(e) => handleFilterChange(selectedType, 'saturation', e.target.value)}
                            />
                            <input
                                type="number"
                                value={activeFilters[selectedType].saturation}
                                step="0.05"
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
                                max="10"
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

            {/* Text Controls */}
            {selectedType === 'text' && selectedText && (
                <div className="text-controls">
                    <div className="control-group">
                        <label>Font Size</label>
                        <input
                            type="number"
                            value={selectedText.fontSize}
                            onChange={(e) => handleTextUpdate({ fontSize: parseInt(e.target.value) })}
                            min="8"
                            max="200"
                            className="number-input"
                        />
                    </div>

                    <div className="control-group">
                        <label>Font Family</label>
                        <select 
                            value={selectedText.fontFamily}
                            onChange={(e) => handleTextUpdate({ fontFamily: e.target.value })}
                            className="select-input"
                        >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Text Style</label>
                        <div className="style-buttons">
                            <button
                                className={selectedText.fontStyle === 'bold' ? 'active' : ''}
                                onClick={() => handleTextUpdate({
                                    fontStyle: selectedText.fontStyle === 'bold' ? 'normal' : 'bold'
                                })}
                            >
                                <FiBold />
                            </button>
                            <button
                                className={selectedText.fontStyle === 'italic' ? 'active' : ''}
                                onClick={() => handleTextUpdate({
                                    fontStyle: selectedText.fontStyle === 'italic' ? 'normal' : 'italic'
                                })}
                            >
                                <FiItalic />
                            </button>
                            <button
                                className={selectedText.textDecoration === 'underline' ? 'active' : ''}
                                onClick={() => handleTextUpdate({
                                    textDecoration: selectedText.textDecoration === 'underline' ? '' : 'underline'
                                })}
                            >
                                <FiUnderline />
                            </button>
                        </div>
                    </div>

                    <div className="control-group">
                        <label>Alignment</label>
                        <div className="alignment-buttons">
                            <button
                                className={selectedText.align === 'left' ? 'active' : ''}
                                onClick={() => handleTextUpdate({ align: 'left' })}
                            >
                                <FiAlignLeft />
                            </button>
                            <button
                                className={selectedText.align === 'center' ? 'active' : ''}
                                onClick={() => handleTextUpdate({ align: 'center' })}
                            >
                                <FiAlignCenter />
                            </button>
                            <button
                                className={selectedText.align === 'right' ? 'active' : ''}
                                onClick={() => handleTextUpdate({ align: 'right' })}
                            >
                                <FiAlignRight />
                            </button>
                        </div>
                    </div>

                    <div className="control-group">
                        <label>Color</label>
                        <div className="color-control">
                            <div 
                                className="color-preview"
                                style={{ backgroundColor: selectedText.fill }}
                            />
                            <HexColorPicker
                                color={selectedText.fill}
                                onChange={(color) => handleTextUpdate({ fill: color })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdjustmentsPanel;