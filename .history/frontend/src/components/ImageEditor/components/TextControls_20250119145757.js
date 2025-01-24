import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { 
    FiBold, FiItalic, FiUnderline, 
    FiAlignLeft, FiAlignCenter, FiAlignRight,
    FiType, FiDroplet, FiBox
} from 'react-icons/fi';
import './TextControls.css';

const TextControls = ({ selectedText, onUpdate }) => {
    const [showFillPicker, setShowFillPicker] = useState(false);
    const [showStrokePicker, setShowStrokePicker] = useState(false);

    if (!selectedText) return null;

    const handleFontFamilyChange = (e) => {
        onUpdate({ fontFamily: e.target.value });
    };

    const handleFontSizeChange = (e) => {
        onUpdate({ fontSize: parseInt(e.target.value) });
    };

    const handleStyleToggle = (style) => {
        switch (style) {
            case 'bold':
                onUpdate({ fontStyle: selectedText.fontStyle === 'bold' ? 'normal' : 'bold' });
                break;
            case 'italic':
                onUpdate({ fontStyle: selectedText.fontStyle === 'italic' ? 'normal' : 'italic' });
                break;
            case 'underline':
                onUpdate({ textDecoration: selectedText.textDecoration === 'underline' ? '' : 'underline' });
                break;
            default:
                break;
        }
    };

    const handleEffectChange = (effect, value) => {
        const updates = {};
        
        switch (effect) {
            case 'shadowBlur':
                updates.shadowBlur = value;
                updates.shadowEnabled = value > 0;
                updates.shadowColor = selectedText.shadowColor || '#000000';
                updates.shadowOffset = selectedText.shadowOffset || { x: 2, y: 2 };
                updates.shadowOpacity = selectedText.shadowOpacity || 0.5;
                break;
                
            case 'strokeWidth':
                updates.strokeWidth = value;
                updates.stroke = selectedText.stroke || '#000000';
                break;
                
            case 'fill':
                updates.fill = value;
                break;
                
            case 'stroke':
                updates.stroke = value;
                break;
                
            default:
                updates[effect] = value;
        }
        
        onUpdate(updates);
    };

    return (
        <div className="text-controls">
            <div className="control-group">
                <label>Font</label>
                <select 
                    value={selectedText.fontFamily} 
                    onChange={handleFontFamilyChange}
                >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                </select>
            </div>

            <div className="control-group">
                <label>Size</label>
                <input
                    type="number"
                    value={selectedText.fontSize}
                    onChange={handleFontSizeChange}
                    min="8"
                    max="200"
                />
            </div>

            <div className="control-group">
                <label>Style</label>
                <div className="button-group">
                    <button
                        className={selectedText.fontStyle === 'bold' ? 'active' : ''}
                        onClick={() => handleStyleToggle('bold')}
                    >
                        <FiBold />
                    </button>
                    <button
                        className={selectedText.fontStyle === 'italic' ? 'active' : ''}
                        onClick={() => handleStyleToggle('italic')}
                    >
                        <FiItalic />
                    </button>
                    <button
                        className={selectedText.textDecoration === 'underline' ? 'active' : ''}
                        onClick={() => handleStyleToggle('underline')}
                    >
                        <FiUnderline />
                    </button>
                </div>
            </div>

            <div className="control-group">
                <label>Alignment</label>
                <div className="button-group">
                    <button
                        className={selectedText.align === 'left' ? 'active' : ''}
                        onClick={() => onUpdate({ align: 'left' })}
                    >
                        <FiAlignLeft />
                    </button>
                    <button
                        className={selectedText.align === 'center' ? 'active' : ''}
                        onClick={() => onUpdate({ align: 'center' })}
                    >
                        <FiAlignCenter />
                    </button>
                    <button
                        className={selectedText.align === 'right' ? 'active' : ''}
                        onClick={() => onUpdate({ align: 'right' })}
                    >
                        <FiAlignRight />
                    </button>
                </div>
            </div>

            <div className="control-group">
                <label>Colors</label>
                <div className="color-controls">
                    <div className="color-picker-container">
                        <label>Fill Color</label>
                        <div 
                            className="color-preview"
                            style={{ backgroundColor: selectedText.fill }}
                            onClick={() => setShowFillPicker(!showFillPicker)}
                        />
                        {showFillPicker && (
                            <div className="color-picker-popover">
                                <div 
                                    className="color-picker-cover" 
                                    onClick={() => setShowFillPicker(false)}
                                />
                                <HexColorPicker
                                    color={selectedText.fill}
                                    onChange={(color) => handleEffectChange('fill', color)}
                                />
                            </div>
                        )}
                    </div>

                    {selectedText.strokeWidth > 0 && (
                        <div className="color-picker-container">
                            <label>Stroke Color</label>
                            <div 
                                className="color-preview"
                                style={{ backgroundColor: selectedText.stroke }}
                                onClick={() => setShowStrokePicker(!showStrokePicker)}
                            />
                            {showStrokePicker && (
                                <div className="color-picker-popover">
                                    <div 
                                        className="color-picker-cover" 
                                        onClick={() => setShowStrokePicker(false)}
                                    />
                                    <HexColorPicker
                                        color={selectedText.stroke}
                                        onChange={(color) => handleEffectChange('stroke', color)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="control-group">
                <label>Effects</label>
                <div className="effects-controls">
                    <div className="effect-item">
                        <label><FiDroplet /> Shadow</label>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            value={selectedText.shadowBlur || 0}
                            onChange={(e) => handleEffectChange('shadowBlur', parseInt(e.target.value))}
                        />
                        <span className="effect-value">{selectedText.shadowBlur || 0}</span>
                    </div>
                    <div className="effect-item">
                        <label><FiBox /> Stroke</label>
                        <input
                            type="range"
                            min="0"
                            max="5"
                            value={selectedText.strokeWidth || 0}
                            onChange={(e) => handleEffectChange('strokeWidth', parseInt(e.target.value))}
                        />
                        <span className="effect-value">{selectedText.strokeWidth || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextControls;