import React, { useState, useRef, useEffect } from 'react';
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
import { generateBackground, removeBackground } from '../../services/imageEditor';
import './ImageEditor.css';

const ImageEditor = () => {
    // State management
    const [canvas, setCanvas] = useState({ width: 800, height: 600 });
    const [background, setBackground] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [prompt, setPrompt] = useState('');
    const [zoom, setZoom] = useState(1);
    const [tool, setTool] = useState('move');
    const [layers, setLayers] = useState([]);
    const [textElements, setTextElements] = useState([]);
    const [activeFilters, setActiveFilters] = useState({
        background: {
            brightness: 1,
            contrast: 1,
            saturation: 1,
            blur: 0,
            hue: 0,
            exposure: 0
        },
        product: {
            brightness: 1,
            contrast: 1,
            saturation: 1,
            blur: 0,
            hue: 0,
            exposure: 0
        }
    });
    const [cropMode, setCropMode] = useState(false);
    const [textEditing, setTextEditing] = useState(null);
    const [textDragging, setTextDragging] = useState(false);

    // Refs
    const stageRef = useRef(null);
    const productRef = useRef(null);
    const transformerRef = useRef(null);
    const selectedNodeRef = useRef(null);

    // Add this useEffect after your other state declarations
    useEffect(() => {
        if (productRef.current) {
            productRef.current.cache();
            productRef.current.getLayer().batchDraw();
        }
    }, [activeFilters.product]);

    useEffect(() => {
        const stage = stageRef.current;
        if (stage) {
            const backgroundNode = stage.findOne('#background');
            if (backgroundNode) {
                backgroundNode.cache();
                backgroundNode.getLayer().batchDraw();
            }
        }
    }, [activeFilters.background]);

    useEffect(() => {
        if (!selectedId || !transformerRef.current) return;

        const stage = stageRef.current;
        const node = stage.findOne('#' + selectedId);
        
        if (node) {
            selectedNodeRef.current = node;
            transformerRef.current.nodes([node]);
            transformerRef.current.getLayer().batchDraw();
        } else {
            transformerRef.current.nodes([]);
        }
    }, [selectedId]);

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

    // Handle product upload
    const handleProductUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsLoading(true);
            setError('');
            
            if (file.size > 10 * 1024 * 1024) {
                throw new Error('Image size should be less than 10MB');
            }

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
                matchColors(background, img, setActiveFilters);
            };

            img.onerror = (e) => {
                console.error('Error loading product image:', e);
                setError('Failed to load product image');
                setIsLoading(false);
            };

            img.src = response.image;

        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to process product image');
            setIsLoading(false);
        }
    };

    // Handle save
    const handleSave = () => {
        const stage = stageRef.current;
        const dataURL = stage.toDataURL();
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Add these handlers in ImageEditor component
    const handleStageClick = (e) => {
        if (tool === 'text' && e.target === e.target.getStage()) {
            const stage = e.target;
            const position = stage.getRelativePointerPosition();
            
            const newText = {
                id: `text-${Date.now()}`,
                text: 'Double click to edit',
                x: position.x,
                y: position.y,
                fontSize: 24,
                fontFamily: 'Arial',
                fill: '#ffffff',
                align: 'left',
                draggable: true,
                width: 200,
                padding: 5
            };

            setTextElements(prev => [...prev, newText]);
            setLayers(prev => [...prev, {
                id: newText.id,
                name: `Text ${prev.length + 1}`,
                type: 'text',
                visible: true,
                locked: false
            }]);
            setSelectedId(newText.id);
        }
    };

    const handleTextDblClick = (e) => {
        if (!e.target.text) return;
        const textNode = e.target;
        setTextEditing(textNode);
        
        // Create textarea over the text
        const textPosition = textNode.absolutePosition();
        const stageBox = stageRef.current.container().getBoundingClientRect();
        
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        
        textarea.value = textNode.text();
        textarea.style.position = 'absolute';
        textarea.style.top = `${stageBox.top + textPosition.y}px`;
        textarea.style.left = `${stageBox.left + textPosition.x}px`;
        textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`;
        textarea.style.height = `${textNode.height() - textNode.padding() * 2}px`;
        textarea.style.fontSize = `${textNode.fontSize()}px`;
        textarea.style.border = '1px solid #0078d4';
        textarea.style.padding = '5px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = '#1e1e1e';
        textarea.style.color = textNode.fill();
        textarea.style.resize = 'none';
        textarea.style.lineHeight = '1';
        textarea.style.fontFamily = textNode.fontFamily();
        textarea.style.transformOrigin = 'left top';
        textarea.style.zIndex = '1000';
        
        textarea.focus();
        
        textarea.addEventListener('blur', () => {
            const newText = textarea.value;
            setTextElements(prev => prev.map(text => 
                text.id === textNode.id() ? { ...text, text: newText } : text
            ));
            document.body.removeChild(textarea);
            setTextEditing(null);
        });
    };

    const handleProductTransform = (e) => {
        const node = e.target;
        if (tool === 'crop' && selectedId === 'product') {
            // Handle cropping
            const imageObj = node.image();
            const scale = {
                x: node.width() / imageObj.width,
                y: node.height() / imageObj.height
            };
            
            setProductImage(prev => ({
                ...prev,
                width: node.width() * node.scaleX(),
                height: node.height() * node.scaleY(),
                scaleX: 1,
                scaleY: 1,
                x: node.x(),
                y: node.y(),
            }));
        } else {
            // Handle regular transform
            setProductImage(prev => ({
                ...prev,
                x: node.x(),
                y: node.y(),
                scaleX: node.scaleX(),
                scaleY: node.scaleY(),
                rotation: node.rotation(),
            }));
        }
    };

    const handleDeleteLayer = (layerId) => {
        if (layerId === 'background' || layerId === 'product') {
            return; // Don't allow deleting these layers
        }
        
        setLayers(prev => prev.filter(layer => layer.id !== layerId));
        if (layerId.startsWith('text-')) {
            setTextElements(prev => prev.filter(text => text.id !== layerId));
        }
        if (selectedId === layerId) {
            setSelectedId(null);
        }
    };

    const handleTransformEnd = (e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale and adjust width/height instead
        node.scaleX(1);
        node.scaleY(1);

        if (node.id().startsWith('text-')) {
            setTextElements(prev => prev.map(text => 
                text.id === node.id() ? {
                    ...text,
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(10, node.width() * scaleX),
                    height: Math.max(10, node.height() * scaleY),
                    rotation: node.rotation()
                } : text
            ));
        } else if (node.id() === 'product') {
            setProductImage(prev => ({
                ...prev,
                x: node.x(),
                y: node.y(),
                width: Math.max(10, node.width() * scaleX),
                height: Math.max(10, node.height() * scaleY),
                rotation: node.rotation()
            }));
        }
    };

    return (
        <div className="photoshop-editor">
            <Toolbar 
                tool={tool}
                setTool={setTool}
                onSave={handleSave}
                onUpload={handleProductUpload}
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={handleGenerateBackground}
                zoom={zoom}
                setZoom={setZoom}
            />

            <div className="editor-content">
                <LayersPanel 
                    layers={layers}
                    setLayers={setLayers}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                    onDeleteLayer={handleDeleteLayer}
                />

                <div className="canvas-area">
                    <Stage
                        width={canvas.width}
                        height={canvas.height}
                        ref={stageRef}
                        scaleX={zoom}
                        scaleY={zoom}
                        onClick={handleStageClick}
                    >
                        <Layer>
                            {layers.map(layer => {
                                if (!layer.visible) return null;

                                switch (layer.type) {
                                    case 'background':
                                        return background && (
                                            <KonvaImage
                                                key={layer.id}
                                                id="background"
                                                image={background}
                                                width={canvas.width}
                                                height={canvas.height}
                                                {...applyFilters('background', activeFilters.background)}
                                                onClick={() => setSelectedId('background')}
                                            />
                                        );
                                    
                                    case 'product':
                                        return productImage && (
                                            <KonvaImage
                                                key={layer.id}
                                                id="product"
                                                {...productImage}
                                                {...applyFilters('product', activeFilters.product)}
                                                draggable={tool === 'move' && !layer.locked}
                                                onClick={() => setSelectedId('product')}
                                                onTransformEnd={handleTransformEnd}
                                            />
                                        );
                                    
                                    case 'text':
                                        const textElement = textElements.find(t => t.id === layer.id);
                                        return textElement && (
                                            <Text
                                                key={layer.id}
                                                id={layer.id}
                                                {...textElement}
                                                draggable={tool === 'move' && !layer.locked}
                                                onClick={() => setSelectedId(layer.id)}
                                                onDblClick={handleTextDblClick}
                                                onTransformEnd={handleTransformEnd}
                                            />
                                        );
                                    
                                    default:
                                        return null;
                                }
                            })}

                            {selectedId && !textEditing && (
                                <Transformer
                                    ref={transformerRef}
                                    boundBoxFunc={(oldBox, newBox) => {
                                        const minWidth = 10;
                                        const minHeight = 10;
                                        if (newBox.width < minWidth || newBox.height < minHeight) {
                                            return oldBox;
                                        }
                                        return newBox;
                                    }}
                                    rotateEnabled={true}
                                    enabledAnchors={[
                                        'top-left', 'top-center', 'top-right',
                                        'middle-right', 'middle-left',
                                        'bottom-left', 'bottom-center', 'bottom-right'
                                    ]}
                                    anchorSize={8}
                                    anchorCornerRadius={2}
                                    padding={5}
                                    borderStroke="#0078d4"
                                    borderStrokeWidth={1}
                                    anchorStroke="#0078d4"
                                    anchorFill="#fff"
                                    keepRatio={false}
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