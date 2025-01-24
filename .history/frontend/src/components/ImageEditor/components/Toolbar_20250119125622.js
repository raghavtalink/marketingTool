import React from 'react';
import { 
    FiMove, FiType, FiImage, FiSave, FiTrash2, 
    FiZoomIn, FiZoomOut, FiCrop, FiRotateCw 
} from 'react-icons/fi';
import './Toolbar.css';

const Toolbar = ({ 
    tool, 
    setTool, 
    onSave, 
    onUpload, 
    prompt, 
    setPrompt, 
    onGenerate, 
    zoom, 
    setZoom 
}) => {
    const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));

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
                    className={`tool-button ${tool === 'crop' ? 'active' : ''}`}
                    onClick={() => setTool('crop')}
                    title="Crop Tool (C)"
                >
                    <FiCrop />
                </button>
                <button 
                    className={`tool-button ${tool === 'text' ? 'active' : ''}`}
                    onClick={() => setTool('text')}
                    title="Text Tool (T)"
                >
                    <FiType />
                </button>
                <button 
                    className="tool-button"
                    onClick={() => setTool('rotate')}
                    title="Rotate Tool (R)"
                >
                    <FiRotateCw />
                </button>
            </div>

            <div className="prompt-group">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the background..."
                    className="prompt-input"
                />
                <button 
                    className="action-button generate-button"
                    onClick={onGenerate}
                    disabled={!prompt}
                >
                    Generate Background
                </button>
            </div>

            <div className="actions-group">
                <label className="tool-button upload-button">
                    <FiImage />
                    <input
                        type="file"
                        onChange={onUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                </label>
                <button 
                    className="tool-button"
                    onClick={handleZoomIn}
                    title="Zoom In (+)"
                >
                    <FiZoomIn />
                </button>
                <button 
                    className="tool-button"
                    onClick={handleZoomOut}
                    title="Zoom Out (-)"
                >
                    <FiZoomOut />
                </button>
                <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                <button 
                    className="tool-button"
                    onClick={onSave}
                    title="Save Image (Ctrl+S)"
                >
                    <FiSave />
                </button>
            </div>
        </div>
    );
};

export default Toolbar;