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
  
    // Optimized font loading
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Roboto&family=Open+Sans&family=Lato&family=Montserrat&family=Poppins&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
      }, []);
    

    // Color picker positioning
    const calculatePosition = (ref) => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            return {
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY + rect.height + 10
            };
        }
        return { x: 0, y: 0 };
    };

    // Debounced updates
    const debouncedUpdate = useCallback(debounce(onUpdate, 100), [onUpdate]);

    const handleShadowChange = (value) => {
        debouncedUpdate({
            shadowBlur: value,
            shadowEnabled: value > 0,
            shadowColor: selectedText.shadowColor || '#000000',
            shadowOffset: selectedText.shadowOffset || { x: 2, y: 2 },
            shadowOpacity: selectedText.shadowOpacity || 0.5
        });
    };

    const handleStrokeChange = (value) => {
        debouncedUpdate({
            strokeWidth: value,
            stroke: selectedText.stroke || '#000000'
        });
    };

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
                            <span className="font-preview-text">{font.name}</span>
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
                    <div className="color-picker-container">
                        <label>Fill Color</label>
                        <div 
                            ref={fillPreviewRef}
                            className="color-preview"
                            style={{ backgroundColor: selectedText.fill }}
                            onClick={() => {
                                setShowFillPicker(!showFillPicker);
                                setPickerPosition(calculatePosition(fillPreviewRef));
                            }}
                        />
                    </div>

                    {showFillPicker && ReactDOM.createPortal(
                        <div
                            className="color-picker-popover"
                            style={{ top: pickerPosition.y, left: pickerPosition.x }}
                        >
                            <ChromePicker 
                                color={selectedText.fill}
                                onChange={(color) => handleColorChange('fill', color)}
                                disableAlpha={false}
                            />
                        </div>,
                        document.body
                    )}

                    <div className="color-picker-container">
                        <label>Stroke Color</label>
                        <div 
                            ref={strokePreviewRef}
                            className="color-preview"
                            style={{ backgroundColor: selectedText.stroke }}
                            onClick={() => {
                                setShowStrokePicker(!showStrokePicker);
                                setPickerPosition(calculatePosition(strokePreviewRef));
                            }}
                        />
                    </div>

                    {showStrokePicker && ReactDOM.createPortal(
                        <div
                            className="color-picker-popover"
                            style={{ top: pickerPosition.y, left: pickerPosition.x }}
                        >
                            <ChromePicker 
                                color={selectedText.stroke}
                                onChange={(color) => handleColorChange('stroke', color)}
                                disableAlpha={false}
                            />
                        </div>,
                        document.body
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
                            defaultValue={selectedText.shadowBlur || 0}
                            onChange={(e) => handleShadowChange(parseInt(e.target.value))}
                        />
                        <span className="effect-value">{selectedText.shadowBlur || 0}</span>
                    </div>
                    <div className="effect-item">
                        <label><FiBox /> Stroke</label>
                        <input
                            type="range"
                            min="0"
                            max="5"
                            defaultValue={selectedText.strokeWidth || 0}
                            onChange={(e) => handleStrokeChange(parseInt(e.target.value))}
                        />
                        <span className="effect-value">{selectedText.strokeWidth || 0}</span>
                    </div>
                </div>
            </div>

            <div className="control-group">
                <label>Preview</label>
                <div className="text-preview">
                    <span style={{
                        fontFamily: selectedText.fontFamily,
                        fontSize: selectedText.fontSize,
                        color: selectedText.fill,
                        textShadow: `${selectedText.shadowOffset?.x || 2}px ${selectedText.shadowOffset?.y || 2}px ${selectedText.shadowBlur || 0}px ${selectedText.shadowColor || '#000'}`
                    }}>
                        {selectedText.text}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default React.memo(TextControls);