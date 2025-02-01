import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from 'react-konva';
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

    const handleProductUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

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
            text: 'Click to edit',
            x: canvasSize.width / 2,
            y: canvasSize.height / 2,
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
            stroke: '#000000',
            isEditing: false  // Add editing state
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
    };

    // Handle text editing
    const handleTextDblClick = (e) => {
        const textNode = e.target;
        const stage = stageRef.current;
        const textPosition = stage.getPointerPosition();
        
        // Create unique ID for the textareas
        const textareaId = `textarea-${Date.now()}`;
        
        const textarea = document.createElement('textarea');
        textarea.id = textareaId;
        document.body.appendChild(textarea);

        textarea.value = textNode.text();
        textarea.style.position = 'fixed';
        textarea.style.top = `${textPosition.y}px`;
        textarea.style.left = `${textPosition.x}px`;
        textarea.style.width = `${Math.max(textNode.width() * zoom, 100)}px`;
        textarea.style.minHeight = '30px';
        textarea.style.fontSize = `${textNode.fontSize() * zoom}px`;
        textarea.style.fontFamily = textNode.fontFamily();
        textarea.style.textAlign = textNode.align();
        textarea.style.color = textNode.fill();
        textarea.style.background = 'rgba(30, 30, 30, 0.9)';
        textarea.style.padding = '8px';
        textarea.style.border = '2px solid #0078d4';
        textarea.style.borderRadius = '4px';
        textarea.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
        textarea.style.zIndex = '1000';
        textarea.style.resize = 'both';
        textarea.style.outline = 'none';
        textarea.style.overflow = 'hidden';

        textarea.focus();

        const removeTextarea = () => {
            const textareaElement = document.getElementById(textareaId);
            if (textareaElement && textareaElement.parentNode) {
                textNode.text(textareaElement.value);
                textareaElement.parentNode.removeChild(textareaElement);
            }
        };

        // Handle blur event
        textarea.addEventListener('blur', removeTextarea, { once: true });

        // Handle Enter key (without shift)
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                textarea.removeEventListener('blur', removeTextarea);
                removeTextarea();
            }
        });

        // Handle Escape key
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                textarea.removeEventListener('blur', removeTextarea);
                removeTextarea();
            }
        });
    };

    // Update transformer on selection change
    useEffect(() => {
        if (!selectedId || !transformerRef.current) return;

        const stage = stageRef.current;
        const node = stage.findOne('#' + selectedId);
        
        if (node) {
            transformerRef.current.nodes([node]);
        } else {
            transformerRef.current.nodes([]);
        }
    }, [selectedId]);

    const handleGenerateBackground = async (prompt) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const imageData = await generateBackground(prompt);
            
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                
                img.onload = () => {
                    setBackground(img);
                    setLayers(prev => {
                        const existingLayers = prev.filter(l => l.id !== 'background');
                        return [
                            {
                                id: 'background',
                                name: 'Generated Background',
                                type: 'background',
                                visible: true,
                                locked: false
                            },
                            ...existingLayers
                        ];
                    });
                    setIsLoading(false);
                    resolve();
                };

                img.onerror = (e) => {
                    console.error('Image load error:', e);
                    setIsLoading(false);
                    const errorMsg = 'Failed to load generated image';
                    setError(errorMsg);
                    reject(new Error(errorMsg));
                };

                if (!imageData) {
                    setIsLoading(false);
                    const errorMsg = 'No image data received from server';
                    setError(errorMsg);
                    reject(new Error(errorMsg));
                    return;
                }

                img.src = imageData;
            });
        } catch (error) {
            setIsLoading(false);
            const errorMsg = error.message || 'Failed to generate background';
            setError(errorMsg);
            throw error;
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
                        width={canvasSize.width}
                        height={canvasSize.height}
                        ref={stageRef}
                        scaleX={zoom}
                        scaleY={zoom}
                        onClick={handleStageClick}
                    >
                        <Layer>
                            {background && (
                                <KonvaImage
                                    id="background"
                                    image={background}
                                    width={canvasSize.width}
                                    height={canvasSize.height}
                                    {...applyFilters('background', activeFilters.background)}
                                    onClick={() => setSelectedId('background')}
                                />
                            )}
                            
                            {productImage && (
                                <KonvaImage
                                    id="product"
                                    {...productImage}
                                    {...applyFilters('product', activeFilters.product)}
                                    onClick={() => setSelectedId('product')}
                                    draggable={tool === 'move'}
                                />
                            )}
                            
                            {textElements.map((text) => {
                                const layer = layers.find(l => l.id === text.id);
                                if (!layer?.visible) return null;

                                return (
                                    <Text
                                        key={text.id}
                                        {...text}
                                        draggable={!layer?.locked}
                                        onClick={handleTextDblClick}
                                        onDragEnd={(e) => {
                                            handleTextUpdate({
                                                x: e.target.x(),
                                                y: e.target.y()
                                            });
                                        }}
                                        onTransformEnd={(e) => {
                                            const node = e.target;
                                            handleTextUpdate({
                                                x: node.x(),
                                                y: node.y(),
                                                width: node.width() * node.scaleX(),
                                                height: node.height() * node.scaleY(),
                                                rotation: node.rotation()
                                            });
                                        }}
                                    />
                                );
                            })}
                            
                            {selectedId && (
                                <Transformer
                                    ref={transformerRef}
                                    boundBoxFunc={(oldBox, newBox) => {
                                        // Limit resize
                                        const maxWidth = 800;
                                        const minWidth = 20;
                                        if (newBox.width < minWidth || newBox.width > maxWidth) {
                                            return oldBox;
                                        }
                                        return newBox;
                                    }}
                                />
                            )}
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