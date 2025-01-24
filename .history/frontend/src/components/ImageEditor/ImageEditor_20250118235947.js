import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import { FiUpload, FiTrash2, FiMaximize2, FiMinimize2, FiRotateCw } from 'react-icons/fi';
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

    return (
        <div className="image-editor-container">
            <div className="toolbar">
                <div className="tool-group">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the background you want..."
                        className="prompt-input"
                    />
                    <button 
                        onClick={handleGenerateBackground}
                        disabled={isLoading || !prompt}
                        className="tool-button"
                    >
                        Generate Background
                    </button>
                </div>

                <div className="tool-group">
                    <label className="tool-button upload-button">
                        <FiUpload />
                        <span>Upload Product</span>
                        <input
                            type="file"
                            onChange={handleProductUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </label>
                    {productImage && (
                        <button 
                            onClick={() => setProductImage(null)}
                            className="tool-button"
                        >
                            <FiTrash2 /> Remove Product
                        </button>
                    )}
                </div>

                <div className="tool-group">
                    <button 
                        onClick={undo} 
                        disabled={historyStep === 0}
                        className="tool-button"
                    >
                        Undo
                    </button>
                    <button 
                        onClick={redo}
                        disabled={historyStep === history.length - 1}
                        className="tool-button"
                    >
                        Redo
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="canvas-container">
                <Stage
                    width={canvas.width}
                    height={canvas.height}
                    ref={stageRef}
                    onClick={(e) => {
                        const clickedOnEmpty = e.target === e.target.getStage();
                        if (clickedOnEmpty) {
                            setSelectedId(null);
                        }
                    }}
                >
                    <Layer>
                        {background && (
                            <KonvaImage
                                image={background}
                                width={canvas.width}
                                height={canvas.height}
                            />
                        )}
                        {productImage && (
                            <KonvaImage
                                id="product"
                                ref={productRef}
                                image={productImage.image}
                                x={productImage.x}
                                y={productImage.y}
                                width={productImage.width}
                                height={productImage.height}
                                rotation={productImage.rotation}
                                scaleX={productImage.scaleX}
                                scaleY={productImage.scaleY}
                                draggable
                                onClick={() => setSelectedId('product')}
                                onTap={() => setSelectedId('product')}
                                onDragEnd={handleTransformEnd}
                                onTransformEnd={handleTransformEnd}
                            />
                        )}
                        {selectedId === 'product' && (
                            <Transformer
                                ref={transformerRef}
                                boundBoxFunc={(oldBox, newBox) => {
                                    // Limit resize
                                    const minWidth = 5;
                                    const minHeight = 5;
                                    if (newBox.width < minWidth || newBox.height < minHeight) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                            />
                        )}
                    </Layer>
                </Stage>
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