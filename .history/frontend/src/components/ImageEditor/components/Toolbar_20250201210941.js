import React, { useState } from 'react';
import { 
    FiMove, FiType, FiImage, FiSave, 
    FiZoomIn, FiZoomOut, FiCrop, FiLoader,
    FiUpload, FiScissors
} from 'react-icons/fi';
import './Toolbar.css';

const Toolbar = ({ 
    tool, 
    setTool, 
    zoom, 
    setZoom, 
    onUploadBackground, 
    onUploadProduct,
    onGenerateBackground,
    onRemoveBackground,
    productImage
}) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return;
        
        setIsGenerating(true);
        try {
            await onGenerateBackground(prompt);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="toolbar">
            <div className="tools-group">
                <button 
                    className={`tool-button ${tool === 'move' ? 'active' : ''}`}
                    onClick={() => setTool('move')}
                    title="Move Tool (V)"
                >
                    <FiMove />
                </button>
                <button 
                    className={`tool-button ${tool === 'text' ? 'active' : ''}`}
                    onClick={() => setTool('text')}
                    title="Text Tool (T)"
                >
                    <FiType />
                </button>
                <button 
                    className={`tool-button ${tool === 'crop' ? 'active' : ''}`}
                    onClick={() => setTool('crop')}
                    title="Crop Tool (C)"
                >
                    <FiCrop />
                </button>
            </div>

            <div className="prompt-group">
                <input
                    type="text"
                    className="prompt-input"
                    placeholder="Enter prompt to generate background..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleGenerate();
                    }}
                />
                <button 
                    className="action-button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                >
                    {isGenerating ? <FiLoader className="spin" /> : 'Generate'}
                </button>
            </div>

            <div className="tools-group">
                <div className="upload-dropdown">
                    <button className="tool-button">
                        <FiUpload />
                    </button>
                    <div className="upload-options">
                        <label className="upload-option">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onUploadBackground}
                                style={{ display: 'none' }}
                            />
                            <FiImage /> Upload Background
                        </label>
                        <label className="upload-option">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onUploadProduct}
                                style={{ display: 'none' }}
                            />
                            <FiImage /> Upload Product
                        </label>
                    </div>
                </div>
                <button 
                    className="tool-button"
                    onClick={onRemoveBackground}
                    title="Remove product background"
                    disabled={!productImage}
                >
                    <FiScissors />
                </button>
            </div>

            <div className="tools-group">
                <button 
                    className="tool-button"
                    onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}
                    title="Zoom In (+)"
                >
                    <FiZoomIn />
                </button>
                <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                <button 
                    className="tool-button"
                    onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))}
                    title="Zoom Out (-)"
                >
                    <FiZoomOut />
                </button>
            </div>
        </div>
    );
};

export default Toolbar;