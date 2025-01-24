import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { 
    FiBold, FiItalic, FiUnderline, 
    FiAlignLeft, FiAlignCenter, FiAlignRight,
    FiType
} from 'react-icons/fi';
import './TextControls.css';

const TextControls = ({ selectedText, onUpdate }) => {
    if (!selectedText) return null;

    const handleFontSizeChange = (newSize) => {
        const scale = newSize / selectedText.fontSize;
        onUpdate({
            fontSize: newSize,
            width: selectedText.width * scale,
            height: selectedText.height * scale
        });
    };

    return (
        <div className="text-controls">
            <div className="control-group">
                <label>Font Family</label>
                <select 
                    value={selectedText.fontFamily}
                    onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Impact">Impact</option>
                </select>
            </div>

            <div className="control-group">
                <label>Font Size</label>
                <div className="font-size-control">
                    <input 
                        type="number"
                        value={selectedText.fontSize}
                        onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                        min="8"
                        max="200"
                    />
                    <div className="font-size-presets">
                        {[12, 16, 24, 32, 48, 64].map(size => (
                            <button 
                                key={size}
                                onClick={() => handleFontSizeChange(size)}
                                className={selectedText.fontSize === size ? 'active' : ''}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="control-group">
                <label>Style</label>
                <div className="style-buttons">
                    <button 
                        className={selectedText.fontStyle === 'bold' ? 'active' : ''}
                        onClick={() => onUpdate({ 
                            fontStyle: selectedText.fontStyle === 'bold' ? 'normal' : 'bold' 
                        })}
                    >
                        <FiBold />
                    </button>
                    <button 
                        className={selectedText.fontStyle === 'italic' ? 'active' : ''}
                        onClick={() => onUpdate({ 
                            fontStyle: selectedText.fontStyle === 'italic' ? 'normal' : 'italic' 
                        })}
                    >
                        <FiItalic />
                    </button>
                    <button 
                        className={selectedText.textDecoration === 'underline' ? 'active' : ''}
                        onClick={() => onUpdate({ 
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
                <label>Color</label>
                <div className="color-control">
                    <div className="color-preview" style={{ backgroundColor: selectedText.fill }} />
                    <HexColorPicker 
                        color={selectedText.fill}
                        onChange={(color) => onUpdate({ fill: color })}
                    />
                </div>
            </div>

            <div className="control-group">
                <label>Effects</label>
                <div className="effects-controls">
                    <div className="effect-control">
                        <label>Shadow</label>
                        <input 
                            type="checkbox"
                            checked={!!selectedText.shadowEnabled}
                            onChange={(e) => onUpdate({
                                shadowEnabled: e.target.checked,
                                shadowColor: e.target.checked ? 'black' : undefined,
                                shadowBlur: e.target.checked ? 5 : undefined,
                                shadowOffset: e.target.checked ? { x: 5, y: 5 } : undefined
                            })}
                        />
                    </div>
                    <div className="effect-control">
                        <label>Stroke</label>
                        <input 
                            type="checkbox"
                            checked={!!selectedText.strokeWidth}
                            onChange={(e) => onUpdate({
                                strokeWidth: e.target.checked ? 1 : 0,
                                stroke: e.target.checked ? '#000000' : undefined
                            })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextControls;