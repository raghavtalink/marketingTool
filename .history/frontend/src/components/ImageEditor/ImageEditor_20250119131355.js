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
                            {background && (
                                <KonvaImage
                                    image={background}
                                    width={canvas.width}
                                    height={canvas.height}
                                    id="background"
                                    {...applyFilters('background', activeFilters.background)}
                                    onClick={() => setSelectedId('background')}
                                    onTransformEnd={(e) => {
                                        const node = e.target;
                                        setBackground({
                                            ...background,
                                            scaleX: node.scaleX(),
                                            scaleY: node.scaleY(),
                                            rotation: node.rotation(),
                                        });
                                    }}
                                />
                            )}
                            {productImage && (
                                <KonvaImage
                                    {...productImage}
                                    id="product"
                                    draggable={tool === 'move' && !layers.find(l => l.id === 'product')?.locked}
                                    visible={layers.find(l => l.id === 'product')?.visible}
                                    onClick={() => setSelectedId('product')}
                                    onTransformEnd={handleProductTransform}
                                    ref={productRef}
                                />
                            )}
                            {textElements.map((text, i) => {
                                const isVisible = layers.find(l => l.id === text.id)?.visible;
                                const isLocked = layers.find(l => l.id === text.id)?.locked;
                                
                                if (!isVisible) return null;
                                
                                return (
                                    <Text
                                        key={text.id}
                                        {...text}
                                        draggable={tool === 'move' && !isLocked}
                                        onClick={() => setSelectedId(text.id)}
                                        onDblClick={handleTextDblClick}
                                        onDragStart={() => setTextDragging(true)}
                                        onDragEnd={(e) => {
                                            setTextDragging(false);
                                            const pos = e.target.position();
                                            setTextElements(prev => prev.map(t => 
                                                t.id === text.id ? { ...t, x: pos.x, y: pos.y } : t
                                            ));
                                        }}
                                    />
                                );
                            })}
                            {selectedId && !textDragging && !textEditing && (
                                <Transformer
                                    ref={transformerRef}
                                    boundBoxFunc={(oldBox, newBox) => {
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