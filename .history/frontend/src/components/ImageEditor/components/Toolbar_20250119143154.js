import React, { useState } from 'react';
import React from 'react';
import { 
    FiMove, FiType, FiImage, FiSave, 
    FiZoomIn, FiZoomOut, FiCrop 
} from 'react-icons/fi';
import './Toolbar.css';

const Toolbar = ({ tool, setTool, zoom, setZoom, onUploadBackground, onUploadProduct }) => {
    return (
        <div className="toolbar">
            <div className="tools-group">
                <button 
                    className={`tool-button ${tool === 'move' ? 'active' : ''}`}
                    onClick={() => setTool('move')}
                >
                    <FiMove />
                </button>
                <button 
                    className={`tool-button ${tool === 'text' ? 'active' : ''}`}
                    onClick={() => setTool('text')}
                >
                    <FiType />
                </button>
                <button 
                    className={`tool-button ${tool === 'crop' ? 'active' : ''}`}
                    onClick={() => setTool('crop')}
                >
                    <FiCrop />
                </button>
            </div>

            <div className="tools-group">
                <input
                    type="file"
                    id="background-upload"
                    accept="image/*"
                    onChange={onUploadBackground}
                    style={{ display: 'none' }}
                />
                <label htmlFor="background-upload" className="tool-button">
                    <FiImage /> Background
                </label>

                <input
                    type="file"
                    id="product-upload"
                    accept="image/*"
                    onChange={onUploadProduct}
                    style={{ display: 'none' }}
                />
                <label htmlFor="product-upload" className="tool-button">
                    <FiImage /> Product
                </label>
            </div>

            <div className="tools-group">
                <button 
                    className="tool-button"
                    onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}
                >
                    <FiZoomIn />
                </button>
                <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                <button 
                    className="tool-button"
                    onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))}
                >
                    <FiZoomOut />
                </button>
            </div>
        </div>
    );
};

export default Toolbar;