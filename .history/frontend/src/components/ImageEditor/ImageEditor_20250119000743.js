import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Rect } from 'react-konva';
import { 
    FiUpload, FiTrash2, FiMaximize2, FiMinimize2, FiRotateCw, 
    FiZoomIn, FiZoomOut, FiMove, FiCrop, FiSliders, FiSun
} from 'react-icons/fi';
import { generateBackground, removeBackground } from '../../services/imageEditor';
import Konva from 'konva';
import './ImageEditor.css';

const ImageEditor = () => {
    const [canvas, setCanvas] = useState({ width: 800, height: 600 });
    const [background, setBackground] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [prompt, setPrompt] = useState('');
    const [tool, setTool] = useState('move');
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

    const handleWheel = (e) => {
        e.evt.preventDefault();
        
        if (e.evt.ctrlKey) {
            const scaleBy = 1.1;
            const stage = stageRef.current;
            const oldScale = stage.scaleX();

            const mousePointTo = {
                x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
                y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
            };

            const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
            setZoom(newScale);

            stage.scale({ x: newScale, y: newScale });
            
            const newPos = {
                x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
                y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
            };
            stage.position(newPos);
            stage.batchDraw();
        }
    };

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
                setLayers(prev => [...prev, {
                    id: 'background',
                    name: 'Background',
                    visible: true,
                    type: 'background'
                }]);
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

    // Handle product image upload
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
                const aspectRatio = img.width / img.height;
                const maxWidth = canvas.width * 0.8;
                const maxHeight = canvas.height * 0.8;
                let newWidth = img.width;
                let newHeight = img.height;

                if (img.width > maxWidth) {
                    newWidth = maxWidth;
                    newHeight = maxWidth / aspectRatio;
                }
                if (newHeight > maxHeight) {
                    newHeight = maxHeight;
                    newWidth = maxHeight * aspectRatio;
                }

                setProductImage({
                    image: img,
                    x: (canvas.width - newWidth) / 2,
                    y: (canvas.height - newHeight) / 2,
                    width: newWidth,
                    height: newHeight,
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1,
                });

                setLayers(prev => [...prev, {
                    id: 'product',
                    name: 'Product',
                    visible: true,
                    type: 'product'
                }]);
                
                setIsLoading(false);
            };
            img.src = response.image;
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to process product image');
            setIsLoading(false);
        }
    };

    // Handle transform end
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
        }
    };

    // Toggle layer visibility
    const toggleLayerVisibility = (layerId) => {
        setLayers(prev => prev.map(layer => 
            layer.id === layerId 
                ? { ...layer, visible: !layer.visible }
                : layer
        ));
    };

    // Filter handlers
    const handleFilterChange = (filter, value) => {
        setFilters(prev => ({
            ...prev,
            [filter]: parseFloat(value)
        }));
    };

    // Canvas size adjustment
    const handleCanvasResize = (size) => {
        setCanvas(prev => ({
            width: size === 'maximize' ? window.innerWidth - 600 : 800,
            height: size === 'maximize' ? window.innerHeight - 200 : 600
        }));
    };

    // Rotate product image
    const handleRotate = () => {
        if (productImage) {
            setProductImage(prev => ({
                ...prev,
                rotation: (prev.rotation || 0) + 90
            }));
        }
    };

    // Delete selected product
    const handleDelete = () => {
        if (selectedId === 'product') {
            setProductImage(null);
            setSelectedId(null);
            setLayers(prev => prev.filter(layer => layer.id !== 'product'));
        }
    };

    // Crop functionality
    const handleCropStart = () => {
        if (tool === 'crop') {
            setCropBox({
                x: canvas.width / 4,
                y: canvas.height / 4,
                width: canvas.width / 2,
                height: canvas.height / 2,
                draggable: true
            });
        }
    };

    const handleCropEnd = () => {
        if (cropBox && background) {
            // Create a temporary canvas to perform the crop
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            // Set the canvas size to the crop box size
            tempCanvas.width = cropBox.width;
            tempCanvas.height = cropBox.height;
            
            // Draw the cropped portion
            tempCtx.drawImage(
                background,
                cropBox.x, cropBox.y, cropBox.width, cropBox.height,
                0, 0, cropBox.width, cropBox.height
            );
            
            // Create new image from the cropped canvas
            const newImage = new Image();
            newImage.onload = () => {
                setBackground(newImage);
                setCropBox(null);
                setTool('move');
            };
            newImage.src = tempCanvas.toDataURL();
        }
    };

    useEffect(() => {
        if (selectedId === 'product' && productRef.current && transformerRef.current) {
            transformerRef.current.nodes([productRef.current]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [selectedId]);

    // Add keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete' && selectedId) {
                handleDelete();
            } else if (e.key === 'r' || e.key === 'R') {
                handleRotate();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId]);

    return (
        <div className="photoshop-editor">
            <div className="toolbar-container">
                <div className="tools-panel">
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
                </div>

                <div className="main-toolbar">
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
                        className="action-button generate-button"
                    >
                        Generate Background
                    </button>
                    <label className="action-button upload-button">
                        <FiUpload />
                        Upload Product
                        <input
                            type="file"
                            onChange={handleProductUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </label>
                    <div className="zoom-control">
                        <span>{Math.round(zoom * 100)}%</span>
                    </div>
                </div>
            </div>

            <div className="editor-content">
                <div className="layers-panel">
                    <h3>Layers</h3>
                    <div className="layers-list">
                        {layers.map(layer => (
                            <div 
                                key={layer.id}
                                className={`layer ${selectedLayer === layer.id ? 'selected' : ''}`}
                                onClick={() => setSelectedLayer(layer.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={layer.visible}
                                    onChange={() => toggleLayerVisibility(layer.id)}
                                />
                                <span>{layer.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="canvas-area">
                    <Stage
                        width={canvas.width}
                        height={canvas.height}
                        ref={stageRef}
                        scaleX={zoom}
                        scaleY={zoom}
                        onWheel={handleWheel}
                    >
                        <Layer>
                            {background && layers.find(l => l.id === 'background')?.visible && (
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
                            {productImage && layers.find(l => l.id === 'product')?.visible && (
                                <KonvaImage
                                    ref={productRef}
                                    image={productImage.image}
                                    x={productImage.x}
                                    y={productImage.y}
                                    width={productImage.width}
                                    height={productImage.height}
                                    rotation={productImage.rotation}
                                    scaleX={productImage.scaleX}
                                    scaleY={productImage.scaleY}
                                    draggable={tool === 'move'}
                                    onClick={() => tool === 'move' && setSelectedId('product')}
                                    onTap={() => tool === 'move' && setSelectedId('product')}
                                    onDragEnd={handleTransformEnd}
                                    onTransformEnd={handleTransformEnd}
                                />
                            )}
                            {selectedId === 'product' && tool === 'move' && (
                                <Transformer
                                    ref={transformerRef}
                                    boundBoxFunc={(oldBox, newBox) => {
                                        const minWidth = 5;
                                        const minHeight = 5;
                                        if (newBox.width < minWidth || newBox.height < minHeight) {
                                            return oldBox;
                                        }
                                        return newBox;
                                    }}
                                />
                            )}
                            {cropBox && tool === 'crop' && (
                                <Rect
                                    {...cropBox}
                                    stroke="#fff"
                                    strokeWidth={1}
                                    dash={[5, 5]}
                                    draggable
                                    onDragEnd={() => {
                                        const node = stageRef.current;
                                        setCropBox(prev => ({
                                            ...prev,
                                            x: node.x(),
                                            y: node.y()
                                        }));
                                    }}
                                />
                            )}
                        </Layer>
                    </Stage>
                </div>

                <div className="adjustments-panel">
                    <h3>Adjustments</h3>
                    <div className="adjustment-control">
                        <label>Brightness</label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={filters.brightness}
                            onChange={(e) => handleFilterChange('brightness', parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="adjustment-control">
                        <label>Contrast</label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={filters.contrast}
                            onChange={(e) => handleFilterChange('contrast', parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="adjustment-control">
                        <label>Blur</label>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={filters.blur}
                            onChange={(e) => handleFilterChange('blur', parseFloat(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Processing...</p>
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ImageEditor;