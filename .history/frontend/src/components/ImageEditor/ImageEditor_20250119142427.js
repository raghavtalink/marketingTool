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
    // Core states
    const [canvas, setCanvas] = useState({ width: 800, height: 600 });
    const [zoom, setZoom] = useState(1);
    const [tool, setTool] = useState('move');
    const [selectedId, setSelectedId] = useState(null);
    
    // Refs
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    const productRef = useRef(null);
    
    // Image states
    const [background, setBackground] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [textElements, setTextElements] = useState([]);
    
    // Layer management
    const [layers, setLayers] = useState([
        { id: 'background', name: 'Background', type: 'background', visible: true, locked: false },
        { id: 'product', name: 'Product', type: 'product', visible: true, locked: false }
    ]);
    
    // Filter states
    const [activeFilters, setActiveFilters] = useState({
        background: { brightness: 1, contrast: 1, saturation: 1, blur: 0 },
        product: { brightness: 1, contrast: 1, saturation: 1, blur: 0 }
    });
    
    // Text editing state
    const [textEditing, setTextEditing] = useState(null);

    useEffect(() => {
        if (!selectedId || !transformerRef.current) return;
        
        const stage = stageRef.current;
        const node = stage.findOne('#' + selectedId);
        
        if (node) {
            transformerRef.current.nodes([node]);
            transformerRef.current.getLayer().batchDraw();
        } else {
            transformerRef.current.nodes([]);
        }
    }, [selectedId]);

    // Handle stage click
    const handleStageClick = (e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedId(null);
            return;
        }

        if (tool === 'text' && clickedOnEmpty) {
            const pos = stageRef.current.getPointerPosition();
            const newText = {
                id: `text-${Date.now()}`,
                text: 'Double click to edit',
                x: pos.x / zoom,
                y: pos.y / zoom,
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

    // Handle text double click
    const handleTextDblClick = (e) => {
        if (!e.target.text) return;
        const textNode = e.target;
        setTextEditing(textNode);
        
        const textPosition = textNode.absolutePosition();
        const stageBox = stageRef.current.container().getBoundingClientRect();
        const areaPosition = {
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y
        };

        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        textarea.value = textNode.text();
        textarea.style.position = 'absolute';
        textarea.style.top = `${areaPosition.y}px`;
        textarea.style.left = `${areaPosition.x}px`;
        textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`;
        textarea.style.height = 'auto';
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
        textarea.style.textAlign = textNode.align();
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

    // Handle transform end
    const handleTransformEnd = (e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

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
                zoom={zoom}
                setZoom={setZoom}
                onSave={() => {/* Implement save functionality */}}
            />
            
            <div className="editor-main">
                <LayersPanel 
                    layers={layers}
                    setLayers={setLayers}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                    onDeleteLayer={(id) => {
                        if (id.startsWith('text-')) {
                            setTextElements(prev => prev.filter(t => t.id !== id));
                        }
                        setLayers(prev => prev.filter(l => l.id !== id));
                        if (selectedId === id) setSelectedId(null);
                    }}
                />
                
                <div className="canvas-container">
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
                                                ref={productRef}
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
        </div>
    );
};

export default ImageEditor;