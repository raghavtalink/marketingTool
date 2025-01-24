import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Rect } from 'react-konva';
import { 
    FiUpload, FiTrash2, FiMaximize2, FiMinimize2, FiRotateCw, 
    FiZoomIn, FiZoomOut, FiMove, FiCrop, FiSliders, FiSun
} from 'react-icons/fi';
import { generateBackground, removeBackground } from '../../services/imageEditor';
import './ImageEditor.css';

const ImageEditor = () => {
    const [canvas, setCanvas] = useState({ width: 800, height: 600 });
    const [background, setBackground] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [prompt, setPrompt] = useState('');
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(0);
    const [tool, setTool] = useState('move'); // move, crop, zoom
    const [zoom, setZoom] = useState(1);
    const [filters, setFilters] = useState({
        brightness: 1,
        contrast: 1,
        saturation: 1,
        blur: 0,
    });
    const [cropBox, setCropBox] = useState(null);
    const [layers, setLayers] = useState([]);
    const [selectedLayer, setSelectedLayer] = useState(null);

    const stageRef = useRef(null);
    const productRef = useRef(null);
    const transformerRef = useRef(null);

    // Handle background generation
    const handleGenerateBackground = async () => {
        if (!prompt) return;
        try {
            setIsLoading(true);
            setError('');
            const response = await generateBackground(prompt + " empty studio background without any products");
            
            const img = new Image();
            img.onload = () => {
                setBackground(img);
                addToHistory();
                setIsLoading(false);
            };
            img.onerror = (e) => {
                console.error('Image load error:', e);
                setError('Failed to load background');
                setIsLoading(false);
            };
            img.src = response.image;
        } catch (err) {
            setError(err.message || 'Failed to generate background');
            setIsLoading(false);
        }
    };

    // Handle product image upload and background removal
    const handleProductUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('file', file);
            const response = await removeBackground(formData);

            const img = new Image();
            img.onload = () => {
                setProductImage({
                    image: img,
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    width: img.width,
                    height: img.height,
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1,
                });
                addToHistory();
                setIsLoading(false);
            };
            img.src = response.image;
        } catch (err) {
            setError(err.message || 'Failed to process product image');
            setIsLoading(false);
        }
    };

    // History management
    const addToHistory = () => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({
            background,
            productImage: { ...productImage },
        });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const undo = () => {
        if (historyStep > 0) {
            setHistoryStep(historyStep - 1);
            const previousState = history[historyStep - 1];
            setBackground(previousState.background);
            setProductImage(previousState.productImage);
        }
    };

    const redo = () => {
        if (historyStep < history.length - 1) {
            setHistoryStep(historyStep + 1);
            const nextState = history[historyStep + 1];
            setBackground(nextState.background);
            setProductImage(nextState.productImage);
        }
    };

    // Handle product image transformations
    useEffect(() => {
        if (selectedId === 'product' && productRef.current && transformerRef.current) {
            transformerRef.current.nodes([productRef.current]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [selectedId]);

    const handleTransformEnd = () => {
        if (productRef.current) {
            const node = productRef.current;
            setProductImage({
                ...productImage,
                x: node.x(),
                y: node.y(),
                width: node.width() * node.scaleX(),
                height: node.height() * node.scaleY(),
                rotation: node.rotation(),
                scaleX: 1,
                scaleY: 1,
            });
            addToHistory();
        }
    };

    // Tool handlers
    const handleToolChange = (newTool) => {
        setTool(newTool);
        setSelectedId(null);
    };

    // Zoom handlers
    const handleZoomIn = () => {
        setZoom(Math.min(zoom * 1.2, 3));
    };

    const handleZoomOut = () => {
        setZoom(Math.max(zoom / 1.2, 0.3));
    };

    // Filter handlers
    const handleFilterChange = (filter, value) => {
        setFilters(prev => ({
            ...prev,
            [filter]: value
        }));
    };

    return (
        <div className="photoshop-editor">
            <div className="toolbar-container">
                <div className="tools">
                    <button 
                        className={`tool-button ${tool === 'move' ? 'active' : ''}`}
                        onClick={() => handleToolChange('move')}
                        title="Move Tool (V)"
                    >
                        <FiMove />
                    </button>
                    <button 
                        className={`tool-button ${tool === 'crop' ? 'active' : ''}`}
                        onClick={() => handleToolChange('crop')}
                        title="Crop Tool (C)"
                    >
                        <FiCrop />
                    </button>
                    <button 
                        className={`tool-button ${tool === 'zoom' ? 'active' : ''}`}
                        onClick={() => handleToolChange('zoom')}
                        title="Zoom Tool (Z)"
                    >
                        <FiZoomIn />
                    </button>
                </div>

                <div className="main-toolbar">
                    <div className="tool-group">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the background..."
                            className="prompt-input"
                        />
                        <button 
                            onClick={handleGenerateBackground}
                            disabled={isLoading || !prompt}
                            className="action-button"
                        >
                            Generate Background
                        </button>
                    </div>

                    <div className="tool-group">
                        <label className="action-button upload-button">
                            <FiUpload />
                            <span>Upload Product</span>
                            <input
                                type="file"
                                onChange={handleProductUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    <div className="tool-group">
                        <button onClick={handleZoomIn} className="tool-button">
                            <FiZoomIn />
                        </button>
                        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                        <button onClick={handleZoomOut} className="tool-button">
                            <FiZoomOut />
                        </button>
                    </div>
                </div>
            </div>

            <div className="editor-main">
                <div className="layers-panel">
                    <h3>Layers</h3>
                    <div className="layers-list">
                        {layers.map((layer, index) => (
                            <div 
                                key={layer.id}
                                className={`layer ${selectedLayer === layer.id ? 'selected' : ''}`}
                                onClick={() => setSelectedLayer(layer.id)}
                            >
                                <span className="layer-visibility">
                                    <input 
                                        type="checkbox"
                                        checked={layer.visible}
                                        onChange={() => toggleLayerVisibility(layer.id)}
                                    />
                                </span>
                                <span className="layer-name">{layer.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="canvas-container">
                    <Stage
                        width={canvas.width}
                        height={canvas.height}
                        ref={stageRef}
                        scaleX={zoom}
                        scaleY={zoom}
                        onWheel={handleWheel}
                    >
                        <Layer>
                            {background && (
                                <KonvaImage
                                    image={background}
                                    width={canvas.width}
                                    height={canvas.height}
                                    filters={[
                                        Konva.Filters.Brightness,
                                        Konva.Filters.Contrast,
                                        Konva.Filters.Blur,
                                    ]}
                                    brightness={filters.brightness}
                                    contrast={filters.contrast}
                                    blurRadius={filters.blur}
                                />
                            )}
                            {productImage && (
                                <KonvaImage
                                    {...productImage}
                                    draggable={tool === 'move'}
                                    onClick={() => tool === 'move' && setSelectedId('product')}
                                    onTransformEnd={handleTransformEnd}
                                    ref={productRef}
                                />
                            )}
                            {selectedId === 'product' && tool === 'move' && (
                                <Transformer
                                    ref={transformerRef}
                                    rotateEnabled={true}
                                    keepRatio={true}
                                />
                            )}
                            {tool === 'crop' && cropBox && (
                                <Rect
                                    {...cropBox}
                                    stroke="#fff"
                                    strokeWidth={1}
                                    dash={[5, 5]}
                                    draggable
                                    onDragEnd={handleCropBoxDragEnd}
                                />
                            )}
                        </Layer>
                    </Stage>
                </div>

                <div className="properties-panel">
                    <h3>Adjustments</h3>
                    <div className="filter-controls">
                        <div className="filter-control">
                            <label>Brightness</label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={filters.brightness}
                                onChange={(e) => handleFilterChange('brightness', e.target.value)}
                            />
                        </div>
                        <div className="filter-control">
                            <label>Contrast</label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={filters.contrast}
                                onChange={(e) => handleFilterChange('contrast', e.target.value)}
                            />
                        </div>
                        <div className="filter-control">
                            <label>Blur</label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={filters.blur}
                                onChange={(e) => handleFilterChange('blur', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Processing...</p>
                </div>
            )}
        </div>
    );
};

export default ImageEditor;