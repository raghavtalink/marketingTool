import React from 'react';
import { 
    FiMove, FiType, FiImage, FiSave, FiTrash2, 
    FiZoomIn, FiZoomOut, FiCrop, FiRotateCw,
    FiMaximize, FiMinimize
} from 'react-icons/fi';
import './Toolbar.css';

const Toolbar = ({ 
    tool, 
    setTool, 
    zoom,
    setZoom,
    onSave,
    onUploadBackground,
    onUploadProduct,
    isFullscreen,
    toggleFullscreen
}) => {
    const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
    
    const handleKeyPress = (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '=':
                case '+':
                    e.preventDefault();
                    handleZoomIn();
                    break;
                case '-':
                    e.preventDefault();
                    handleZoomOut();
                    break;
                case 's':
                    e.preventDefault();
                    onSave();
                    break;
                default:
                    break;
            }
        }
    };

    React.useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

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

            <div className="tools-group">
                <label className="tool-button upload-button" title="Upload Background">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onUploadBackground}
                        style={{ display: 'none' }}
                    />
                    <FiImage />
                </label>
                <label className="tool-button upload-button" title="Upload Product">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onUploadProduct}
                        style={{ display: 'none' }}
                    />
                    <FiImage />
                </label>
            </div>

            <div className="tools-group">
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
            </div>

            <div className="tools-group">
                <button 
                    className="tool-button"
                    onClick={onSave}
                    title="Save (Ctrl+S)"
                >
                    <FiSave />
                </button>
                <button 
                    className="tool-button"
                    onClick={toggleFullscreen}
                    title="Toggle Fullscreen (F)"
                >
                    {isFullscreen ? <FiMinimize /> : <FiMaximize />}
                </button>
            </div>
        </div>
    );
};

export default Toolbar;