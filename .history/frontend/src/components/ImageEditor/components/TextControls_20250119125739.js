import React from 'react';
import { HexColorPicker } from 'react-colorful';
import './TextControls.css';

const TextControls = ({ selectedText, onUpdate }) => {
    if (!selectedText) return null;

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
                </select>
            </div>

            <div className="control-group">
                <label>Font Size</label>
                <input 
                    type="number"
                    value={selectedText.fontSize}
                    onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                    min="8"
                    max="200"
                />
            </div>

            <div className="control-group">
                <label>Color</label>
                <HexColorPicker 
                    color={selectedText.fill}
                    onChange={(color) => onUpdate({ fill: color })}
                />
            </div>

            <div className="control-group">
                <label>Text Align</label>
                <div className="button-group">
                    <button 
                        className={selectedText.align === 'left' ? 'active' : ''}
                        onClick={() => onUpdate({ align: 'left' })}
                    >
                        Left
                    </button>
                    <button 
                        className={selectedText.align === 'center' ? 'active' : ''}
                        onClick={() => onUpdate({ align: 'center' })}
                    >
                        Center
                    </button>
                    <button 
                        className={selectedText.align === 'right' ? 'active' : ''}
                        onClick={() => onUpdate({ align: 'right' })}
                    >
                        Right
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TextControls;