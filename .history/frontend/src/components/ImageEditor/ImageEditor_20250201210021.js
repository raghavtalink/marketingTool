import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer, Rect } from 'react-konva';
import { 
    FiMove, FiType, FiImage, FiSave, FiTrash2, 
    FiZoomIn, FiZoomOut, FiDroplet, FiLayers
} from 'react-icons/fi';
import Toolbar from './components/Toolbar';
import AdjustmentsPanel from './components/AdjustmentsPanel';
import LayersPanel from './components/LayersPanel';
import TextControls from './components/TextControls';
import ColorPicker from './components/ColorPicker';
import { applyFilters } from './utils/filters';
import { matchColors } from './utils/colorMatching';
import { handleTextManipulation } from './utils/textManipulation';
import { generateBackground, removeBackground, removeProductBackground } from '../../services/imageEditor';
import './ImageEditor.css';
import { v4 as uuidv4 } from 'uuid';
import { throttle, debounce } from 'lodash';

const MemoizedText = React.memo(({ text }) => (
  <Text {...text} />
), (prev, next) => {
  return JSON.stringify(prev.text) === JSON.stringify(next.text);
});

const ImageEditor = () => {
    // Essential states
    const [tool, setTool] = useState('move');
    const [zoom, setZoom] = useState(1);
    const [selectedId, setSelectedId] = useState(null);
    
    // Image states
    const [background, setBackground] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [textElements, setTextElements] = useState([]);
    
    // Refs
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    
    // Canvas dimensions
    const [canvasSize] = useState({ width: 800, height: 600 });
    
    // Layers state
    const [layers, setLayers] = useState([
        { id: 'background', name: 'Background', type: 'background', visible: true, locked: false },
        { id: 'product', name: 'Product', type: 'product', visible: true, locked: false }
    ]);
    
    // Filters state
    const [activeFilters, setActiveFilters] = useState({
        background: { brightness: 1, contrast: 1, saturation: 1, blur: 0 },
        product: { brightness: 1, contrast: 1, saturation: 1, blur: 0 }
    });

    // Add loading state
    const [isLoading, setIsLoading] = useState(false);

    // Add error state and notification
    const [error, setError] = useState(null);

    // Transformer configuration
    const transformerProps = {
        boundBoxFunc: (oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            newBox.height = Math.max(30, newBox.height);
            return newBox;
        },
        borderStroke: "#3b82f6",
        borderStrokeWidth: 1.5,
        anchorStroke: "#3b82f6",
        anchorFill: "#ffffff",
        anchorStrokeWidth: 1.5,
        anchorSize: 12,
        rotateAnchorOffset: 30,
        rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
        enabledAnchors: [
            'top-left', 'top-right',
            'bottom-left', 'bottom-right',
            'middle-left', 'middle-right',
            'top-center', 'bottom-center'
        ],
        keepRatio: false,
        padding: 5
    };

    // Move MemoizedTransformer inside the component
    const MemoizedTransformer = useMemo(() => () => (
        selectedId ? <Transformer ref={transformerRef} {...transformerProps} /> : null
    ), [selectedId]);

    // Handle image uploads
    const handleBackgroundUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    setBackground(img);
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProductImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const img = new Image();
            img.onload = () => {
                // Scale image to fit canvas
                const scale = Math.min(
                    canvasSize.width / img.width,
                    canvasSize.height / img.height
                );
                
                setProductImage({
                    src: img,
                    width: img.width * scale,
                    height: img.height * scale,
                    x: (canvasSize.width - img.width * scale)/2,
                    y: (canvasSize.height - img.height * scale)/2
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image file (JPEG or PNG)');
            return;
        }

        // Validate file size (e.g., max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            setError('Image file is too large. Please upload an image smaller than 5MB');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Process the image
            const processedImageData = await removeProductBackground(file);
            
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    const maxWidth = canvasSize.width * 0.8;
                    const maxHeight = canvasSize.height * 0.8;
                    
                    let newWidth = img.width;
                    let newHeight = img.height;
                    
                    if (newWidth > maxWidth) {
                        newWidth = maxWidth;
                        newHeight = newWidth / aspectRatio;
                    }
                    
                    if (newHeight > maxHeight) {
                        newHeight = maxHeight;
                        newWidth = newHeight * aspectRatio;
                    }

                    setProductImage({
                        image: img,
                        x: (canvasSize.width - newWidth) / 2,
                        y: (canvasSize.height - newHeight) / 2,
                        width: newWidth,
                        height: newHeight,
                        draggable: true,
                        id: 'product'
                    });

                    // Add product layer if it doesn't exist
                    setLayers(prev => {
                        if (!prev.find(l => l.id === 'product')) {
                            return [...prev, {
                                id: 'product',
                                name: 'Product',
                                type: 'product',
                                visible: true,
                                locked: false
                            }];
                        }
                        return prev;
                    });

                    setIsLoading(false);
                    resolve();
                };

                img.onerror = () => {
                    setIsLoading(false);
                    const errorMsg = 'Failed to load product image';
                    setError(errorMsg);
                    reject(new Error(errorMsg));
                };

                img.src = processedImageData;
            });
        } catch (error) {
            setIsLoading(false);
            setError(error.message || 'Failed to process product image');
            console.error('Product upload error:', error);
        }
    };

    // Handle text addition
    const handleAddText = () => {
        const textId = `text-${uuidv4()}`;
        const newText = {
            id: textId,
            text: 'New Text',
            x: canvasSize.width/2,
            y: canvasSize.height/2,
            fontSize: 24,
            fontFamily: 'Arial',
            fill: '#ffffff',
            draggable: true,
            width: 200,
            isEditing: false
        };
        
        setTextElements(prev => [...prev, newText]);
        setLayers(prev => [...prev, {
            id: textId,
            name: `Text Layer ${prev.length + 1}`,
            type: 'text',
            visible: true,
            locked: false
        }]);
    };

    // Handle text editing
    const handleTextClick = useCallback((textId) => {
        // Add debounce to prevent double clicks
        const debouncedClick = debounce(() => {
            const textNode = stageRef.current.findOne(`#${textId}`);
            if (!textNode) return;
            
            // Create and position textarea
            const textarea = document.createElement('textarea');
            textarea.value = textNode.text();
            textarea.style.position = 'absolute';
            textarea.style.top = `${textNode.y()}px`;
            textarea.style.left = `${textNode.x()}px`;
            textarea.style.width = `${textNode.width() * textNode.scaleX()}px`;
            textarea.style.height = `${textNode.height() * textNode.scaleY()}px`;
            textarea.style.fontSize = `${textNode.fontSize()}px`;
            textarea.style.fontFamily = textNode.fontFamily();
            textarea.style.color = textNode.fill();
            textarea.style.background = 'transparent';
            textarea.style.border = 'none';
            textarea.style.outline = 'none';
            textarea.style.resize = 'none';
            textarea.style.zIndex = '1000';
            textarea.style.whiteSpace = 'pre-wrap';
            stageRef.current.container().appendChild(textarea);
            textarea.focus();

            // Add resize handler
            const handleResize = () => {
                requestAnimationFrame(() => {
                    textNode.width(textarea.scrollWidth);
                    textNode.height(textarea.scrollHeight);
                    textarea.style.width = `${textarea.scrollWidth}px`;
                    textarea.style.height = `${textarea.scrollHeight}px`;
                });
            };
            
            textarea.addEventListener('input', handleResize);
            return () => textarea.removeEventListener('input', handleResize);
        }, 300);
        
        debouncedClick();
    }, []);

    // Update transformer on selection change
    useEffect(() => {
        if (transformerRef.current && selectedId) {
            const node = stageRef.current.findOne(`#${selectedId}`);
            if (node) {
                transformerRef.current.nodes([node]);
                node.moveToTop();
                transformerRef.current.getLayer().batchDraw();
            }
        }
    }, [selectedId]);

    const handleGenerateBackground = async (prompt) => {
        if (!prompt || prompt.length > 2048) {
            setError('Prompt must be between 1-2048 characters');
            return;
        }
        
        try {
            setIsLoading(true);
            const imageData = await generateBackground(prompt);
            const img = new Image();
            img.src = imageData;
            img.onload = () => setBackground(img);
        } catch (err) {
            setError(err.message || 'Background generation failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLayerReorder = (newLayers) => {
        // Update the canvas order based on layer order
        const stage = stageRef.current;
        if (!stage) return;

        const layer = stage.findOne('Layer');
        newLayers.forEach((layerData) => {
            const node = layer.findOne(`#${layerData.id}`);
            if (node) {
                node.moveToTop();
            }
        });
    };

    const handleDeleteLayer = (layerId) => {
        if (layerId === 'background') {
            setBackground(null);
        } else if (layerId === 'product') {
            setProductImage(null);
        } else if (layerId.startsWith('text-')) {
            setTextElements(prev => prev.filter(text => text.id !== layerId));
        }
        
        setLayers(prev => prev.filter(layer => layer.id !== layerId));
        setSelectedId(null);
    };

    const handleTextUpdate = (updates) => {
        if (!selectedId) return;
        
        setTextElements(prev => prev.map(text => 
            text.id === selectedId 
                ? { ...text, ...updates }
                : text
        ));
    };

    // Update the selection handling
    const handleSelect = (e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedId(null);
            return;
        }

        const id = e.target.id();
        if (id) {
            setSelectedId(id);
            if (transformerRef.current) {
                const node = e.target;
                if (node.getType() === 'Text' || id === 'product') {
                    transformerRef.current.nodes([node]);
                } else {
                    transformerRef.current.nodes([]);
                }
            }
        }
    };

    // Add click handler for stage
    const handleStageClick = (e) => {
        if (tool === 'text') {
            const stage = e.target.getStage();
            const pointerPosition = stage.getPointerPosition();
            
            const textId = `text-${Date.now()}`;
            const newText = {
                id: textId,
                text: 'Double click to edit',
                x: pointerPosition.x,
                y: pointerPosition.y,
                fontSize: 24,
                fontFamily: 'Arial',
                fill: '#ffffff',
                align: 'center',
                draggable: true,
                width: 200,
                shadowColor: 'black',
                shadowBlur: 0,
                shadowOffset: { x: 2, y: 2 },
                shadowOpacity: 0.5,
                strokeWidth: 0,
                stroke: '#000000'
            };

            setTextElements(prev => [...prev, newText]);
            setLayers(prev => [...prev, {
                id: textId,
                name: 'Text Layer',
                type: 'text',
                visible: true,
                locked: false
            }]);
            setSelectedId(textId);
            setTool('move'); // Switch back to move tool after adding text
        } else {
            handleSelect(e);
        }
    };

    const optimizedTextElements = useMemo(() => 
        textElements.map(text => ({
            ...text,
            listening: !text.isEditing && !layers.find(l => l.id === text.id)?.locked
        })), 
        [textElements, layers]
    );

    const handleStageDragEnd = (e) => {
        // Implement the logic for handling stage drag end
    };

    const handleZoom = (e) => {
        // Implement the logic for handling zoom
    };

    return (
        <div className="photoshop-editor">
            <Toolbar 
                tool={tool}
                setTool={setTool}
                zoom={zoom}
                setZoom={setZoom}
                onUploadBackground={handleBackgroundUpload}
                onUploadProduct={handleProductUpload}
                onGenerateBackground={handleGenerateBackground}
                onAddText={handleAddText}
            />
            
            <div className="editor-main">
                <LayersPanel 
                    layers={layers}
                    setLayers={setLayers}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                    onDeleteLayer={handleDeleteLayer}
                    onVisibilityToggle={(id) => {
                        setLayers(prev => prev.map(layer => 
                            layer.id === id ? { ...layer, visible: !layer.visible } : layer
                        ));
                    }}
                    onLockToggle={(id) => {
                        setLayers(prev => prev.map(layer => 
                            layer.id === id ? { ...layer, locked: !layer.locked } : layer
                        ));
                    }}
                    onReorder={handleLayerReorder}
                />
                
                <div className="canvas-container">
                    {isLoading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner"></div>
                            <span>Generating background...</span>
                        </div>
                    )}
                    <Stage
                        ref={stageRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        draggable={false}
                        onWheel={handleZoom}
                        className="konva-stage"
                        style={{
                            willChange: 'transform',
                            touchAction: 'none'
                        }}
                    >
                        {/* Background Layer */}
                        <Layer>
                            <Rect
                                width={canvasSize.width}
                                height={canvasSize.height}
                                fill="#f0f0f0"
                                listening={false}
                            />
                            {background && (
                                <KonvaImage
                                    image={background}
                                    width={canvasSize.width}
                                    height={canvasSize.height}
                                    listening={false}
                                />
                            )}
                        </Layer>

                        {/* Product Image Layer */}
                        <Layer>
                            {productImage && (
                                <KonvaImage
                                    image={productImage}
                                    width={productImage.width}
                                    height={productImage.height}
                                    x={(canvasSize.width - productImage.width)/2}  // Center horizontally
                                    y={(canvasSize.height - productImage.height)/2} // Center vertically
                                    draggable
                                />
                            )}
                        </Layer>

                        {/* Text Layer */}
                        <Layer>
                            {optimizedTextElements.map((text) => (
                                <MemoizedText key={text.id} text={text} />
                            ))}
                        </Layer>

                        <Layer>
                            <MemoizedTransformer />
                        </Layer>
                    </Stage>
                </div>
                
                <AdjustmentsPanel 
                    selectedId={selectedId}
                    activeFilters={activeFilters}
                    setActiveFilters={setActiveFilters}
                    textElements={textElements}
                    setTextElements={setTextElements}
                />

                {selectedId?.startsWith('text-') && (
                    <TextControls
                        selectedText={textElements.find(t => t.id === selectedId)}
                        onUpdate={handleTextUpdate}
                    />
                )}
            </div>

            {error && (
                <div className="error-notification">
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>Dismiss</button>
                </div>
            )}
        </div>
    );
};

export default ImageEditor;