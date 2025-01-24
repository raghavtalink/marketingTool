import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { getProducts } from '../../services/products';
import { generateBackground, removeBackground, harmonizeImages } from '../../services/imageEditor';
import './ImageEditor.css';

const ImageEditor = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [background, setBackground] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
    const [productPosition, setProductPosition] = useState({ x: 400, y: 300 });
    const [productScale, setProductScale] = useState(1);
    
    const stageRef = useRef(null);
    const productImageRef = useRef(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            setError('Failed to fetch products');
        }
    };

    const handleProductUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsLoading(true);
            // First remove background
            const formData = new FormData();
            formData.append('file', file);
            const removedBgResponse = await removeBackground(formData);
            
            // Load the processed image
            const img = new window.Image();
            img.src = `data:image/png;base64,${removedBgResponse.image}`;
            img.onload = () => {
                setProductImage(img);
                setIsLoading(false);
            };
        } catch (err) {
            setError('Failed to process product image');
            setIsLoading(false);
        }
    };

    const handleGenerateBackground = async () => {
        if (!prompt) return;

        try {
            setIsLoading(true);
            const response = await generateBackground(prompt);
            
            // Load the generated background
            const img = new window.Image();
            img.src = `data:image/png;base64,${response.image}`;
            img.onload = () => {
                setBackground(img);
                setIsLoading(false);
            };
        } catch (err) {
            setError('Failed to generate background');
            setIsLoading(false);
        }
    };

    const handleHarmonize = async () => {
        if (!background || !productImage) return;

        try {
            setIsLoading(true);
            const harmonizedResponse = await harmonizeImages({
                background: background.src,
                product: productImage.src
            });
            
            // Update product image with harmonized version
            const img = new window.Image();
            img.src = `data:image/png;base64,${harmonizedResponse.image}`;
            img.onload = () => {
                setProductImage(img);
                setIsLoading(false);
            };
        } catch (err) {
            setError('Failed to harmonize images');
            setIsLoading(false);
        }
    };

    return (
        <div className="image-editor-container">
            {/* Controls section */}
            <div className="controls">
                <select 
                    value={selectedProduct} 
                    onChange={(e) => setSelectedProduct(e.target.value)}
                >
                    <option value="">Select a product</option>
                    {products.map(product => (
                        <option key={product._id} value={product._id}>
                            {product.name}
                        </option>
                    ))}
                </select>

                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProductUpload} 
                />

                <div className="prompt-section">
                    <input 
                        type="text" 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the background you want..."
                    />
                    <button 
                        onClick={handleGenerateBackground}
                        disabled={!prompt || isLoading}
                    >
                        Generate Background
                    </button>
                </div>

                <button 
                    onClick={handleHarmonize}
                    disabled={!background || !productImage || isLoading}
                >
                    Harmonize Lighting
                </button>
            </div>

            {/* Canvas section */}
            <Stage
                width={imageSize.width}
                height={imageSize.height}
                ref={stageRef}
            >
                <Layer>
                    {background && (
                        <KonvaImage
                            image={background}
                            width={imageSize.width}
                            height={imageSize.height}
                        />
                    )}
                    {productImage && (
                        <KonvaImage
                            image={productImage}
                            x={productPosition.x}
                            y={productPosition.y}
                            draggable
                            ref={productImageRef}
                            scale={{ x: productScale, y: productScale }}
                            onDragEnd={(e) => {
                                setProductPosition({
                                    x: e.target.x(),
                                    y: e.target.y()
                                });
                            }}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default ImageEditor;