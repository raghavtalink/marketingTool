import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChromePicker } from 'react-color';
import ReactDOM from 'react-dom';
import { 
    FiBold, FiItalic, FiUnderline, 
    FiAlignLeft, FiAlignCenter, FiAlignRight,
    FiType, FiDroplet, FiBox
} from 'react-icons/fi';
import './TextControls.css';


// Comprehensive font list
const FONTS = [
    // Sans Serif Fonts
    { name: 'Arial', category: 'sans-serif' },
    { name: 'Helvetica', category: 'sans-serif' },
    { name: 'Roboto', category: 'sans-serif' },
    { name: 'Open Sans', category: 'sans-serif' },
    { name: 'Lato', category: 'sans-serif' },
    { name: 'Montserrat', category: 'sans-serif' },
    { name: 'Poppins', category: 'sans-serif' },
    { name: 'Source Sans Pro', category: 'sans-serif' },
    { name: 'Ubuntu', category: 'sans-serif' },
    { name: 'Nunito', category: 'sans-serif' },
    
    // Serif Fonts
    { name: 'Times New Roman', category: 'serif' },
    { name: 'Georgia', category: 'serif' },
    { name: 'Playfair Display', category: 'serif' },
    { name: 'Merriweather', category: 'serif' },
    { name: 'Lora', category: 'serif' },
    { name: 'PT Serif', category: 'serif' },
    
    // Display Fonts
    { name: 'Pacifico', category: 'display' },
    { name: 'Dancing Script', category: 'display' },
    { name: 'Lobster', category: 'display' },
    { name: 'Great Vibes', category: 'display' },
    { name: 'Satisfy', category: 'display' },
    
    // Monospace Fonts
    { name: 'Courier New', category: 'monospace' },
    { name: 'Roboto Mono', category: 'monospace' },
    { name: 'Source Code Pro', category: 'monospace' },
    { name: 'Fira Code', category: 'monospace' },
    
    // Additional Modern Fonts
    { name: 'Raleway', category: 'sans-serif' },
    { name: 'Quicksand', category: 'sans-serif' },
    { name: 'Josefin Sans', category: 'sans-serif' },
    { name: 'Comfortaa', category: 'display' },
    { name: 'Righteous', category: 'display' }
];

// Debounce function for performance
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  };
  

  const TextControls = ({ selectedText, onUpdate }) => {
    const [showFillPicker, setShowFillPicker] = useState(false);
    const [showStrokePicker, setShowStrokePicker] = useState(false);
    const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
    const fillPreviewRef = useRef(null);
    const strokePreviewRef = useRef(null);
  
    // Load Google Fonts
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Roboto&family=Open+Sans&family=Lato&family=Montserrat&family=Poppins&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
      }, []);
    

    // Close color pickers when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (fillPickerRef.current && !fillPickerRef.current.contains(event.target)) {
                setShowFillPicker(false);
            }
            if (strokePickerRef.current && !strokePickerRef.current.contains(event.target)) {
                setShowStrokePicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleColorChange = (type, color) => {
        onUpdate({ [type]: color.hex });
    };

    return (
        <div className="text-controls">
            <div className="control-group">
                <label>Font</label>
                <select 
                    value={selectedText.fontFamily}
                    onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                    style={{ fontFamily: selectedText.fontFamily }}
                >
                    {FONTS.map(font => (
                        <option 
                            key={font.name} 
                            value={font.name}
                            style={{ fontFamily: font.name }}
                        >
                            {font.name}
                        </option>
                    ))}
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
                    <div className="color-picker-container" ref={fillPickerRef}>
                        <label>Fill Color</label>
                        <div 
                            className="color-preview"
                            style={{ backgroundColor: selectedText.fill }}
                            onClick={() => setShowFillPicker(!showFillPicker)}
                        />
                        {showFillPicker && (
                            <div className="color-picker-popover">
                                <ChromePicker 
                                    color={selectedText.fill}
                                    onChange={(color) => handleColorChange('fill', color)}
                                    disableAlpha={false}
                                />
                            </div>
                        )}
                    </div>

                    <div className="color-picker-container" ref={strokePickerRef}>
                        <label>Stroke Color</label>
                        <div 
                            className="color-preview"
                            style={{ backgroundColor: selectedText.stroke || '#000000' }}
                            onClick={() => setShowStrokePicker(!showStrokePicker)}
                        />
                        {showStrokePicker && (
                            <div className="color-picker-popover">
                                <ChromePicker 
                                    color={selectedText.stroke || '#000000'}
                                    onChange={(color) => handleColorChange('stroke', color)}
                                    disableAlpha={false}
                                />
                            </div>
                        )}
                    </div>
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
                            onChange={(e) => onUpdate({
                                shadowBlur: parseInt(e.target.value),
                                shadowEnabled: parseInt(e.target.value) > 0,
                                shadowColor: selectedText.shadowColor || '#000000',
                                shadowOffset: selectedText.shadowOffset || { x: 2, y: 2 },
                                shadowOpacity: selectedText.shadowOpacity || 0.5
                            })}
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
                            onChange={(e) => onUpdate({
                                strokeWidth: parseInt(e.target.value),
                                stroke: selectedText.stroke || '#000000'
                            })}
                        />
                        <span className="effect-value">{selectedText.strokeWidth || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextControls;