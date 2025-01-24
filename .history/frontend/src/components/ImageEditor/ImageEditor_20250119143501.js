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

    const handleProductUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    setProductImage({
                        image: img,
                        x: canvasSize.width / 4,
                        y: canvasSize.height / 4,
                        width: img.width,
                        height: img.height,
                        draggable: true
                    });
                };
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle text addition
    const handleAddText = () => {
        if (tool !== 'text') return;
        
        const newText = {
            id: `text-${Date.now()}`,
            text: 'Double click to edit',
            x: canvasSize.width / 2,
            y: canvasSize.height / 2,
            fontSize: 20,
            fontFamily: 'Arial',
            fill: '#ffffff',
            draggable: true,
            width: 200
        };

        setTextElements(prev => [...prev, newText]);
        setLayers(prev => [...prev, {
            id: newText.id,
            name: `Text ${prev.length + 1}`,
            type: 'text',
            visible: true,
            locked: false
        }]);
    };

    // Handle text editing
    const handleTextDblClick = (e) => {
        const textNode = e.target;
        const textPosition = textNode.getAbsolutePosition();
        const stageBox = stageRef.current.container().getBoundingClientRect();

        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        textarea.value = textNode.text();
        textarea.style.position = 'absolute';
        textarea.style.top = `${stageBox.top + textPosition.y}px`;
        textarea.style.left = `${stageBox.left + textPosition.x}px`;
        textarea.style.width = `${textNode.width()}px`;
        textarea.style.height = 'auto';
        textarea.style.fontSize = `${textNode.fontSize()}px`;
        textarea.style.border = '1px solid #0078d4';
        textarea.style.padding = '5px';
        textarea.style.background = '#1e1e1e';
        textarea.style.color = '#fff';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.zIndex = '1000';

        textarea.focus();

        textarea.addEventListener('blur', () => {
            const newText = textarea.value;
            setTextElements(prev => prev.map(text => 
                text.id === textNode.id() ? { ...text, text: newText } : text
            ));
            document.body.removeChild(textarea);
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
        try {
            const response = await generateBackground(prompt);
            const imageUrl = response.imageUrl || response;

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

                img.onerror = () => {
                    setIsLoading(false);
                    reject(new Error('Failed to load generated image'));
                };

                img.src = imageUrl;
            });
        } catch (error) {
            setIsLoading(false);
            console.error('Failed to generate background:', error);
            throw error;
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
            />
            
            <div className="editor-main">
                <LayersPanel 
                    layers={layers}
                    setLayers={setLayers}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
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
                        onClick={tool === 'text' ? handleAddText : undefined}
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
                            
                            {textElements.map((text) => (
                                <Text
                                    key={text.id}
                                    id={text.id}
                                    {...text}
                                    draggable={tool === 'move'}
                                    onClick={() => setSelectedId(text.id)}
                                    onDblClick={handleTextDblClick}
                                />
                            ))}
                            
                            {selectedId && (
                                <Transformer
                                    ref={transformerRef}
                                    boundBoxFunc={(oldBox, newBox) => {
                                        return newBox;
                                    }}
                                    rotateEnabled={true}
                                    enabledAnchors={[
                                        'top-left', 'top-center', 'top-right',
                                        'middle-right', 'middle-left',
                                        'bottom-left', 'bottom-center', 'bottom-right'
                                    ]}
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
        </div>
    );
};

export default ImageEditor;