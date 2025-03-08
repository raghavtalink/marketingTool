import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Stage, Layer, Image, Text, Rect, Circle, Line } from 'react-konva';
import { 
  Layers, 
  Type, 
  Move, 
  Maximize, 
  Minimize,
  Trash2, 
  Plus, 
  Edit2, 
  ChevronUp, 
  ChevronDown,
  Download,
  Sliders,
  Eye,
  EyeOff,
  Square,
  Circle as CircleIcon,
  Triangle
} from 'react-feather';
import useImage from 'use-image';
import { v4 as uuidv4 } from 'uuid';

// GraphQL queries and mutations
const GENERATE_IMAGE = gql`
  mutation GenerateImage($input: ImageGenerationInput!) {
    generateImage(input: $input) {
      success
      image
      error
    }
  }
`;

const REMOVE_BACKGROUND = gql`
  mutation RemoveBackground($input: BackgroundRemovalInput!) {
    removeBackground(input: $input) {
      success
      image
      error
    }
  }
`;

const PRODUCTS_QUERY = gql`
  query Products {
    products {
      id
      name
      description
      category
      price
      inventoryCount
      competitorUrls
      currency
      userId
      createdAt
      updatedAt
    }
  }
`;

const InstantStudio = () => {
  // Canvas state
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [scale, setScale] = useState(1);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [showRemoveBackground, setShowRemoveBackground] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lightingAdjustment, setLightingAdjustment] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0
  });
  
  // Refs
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // GraphQL hooks
  const [generateImage, { loading: generatingImage }] = useMutation(GENERATE_IMAGE);
  const [removeBackground, { loading: removingBackground }] = useMutation(REMOVE_BACKGROUND);
  const { data: productsData, loading: loadingProducts } = useQuery(PRODUCTS_QUERY);
  
  // Load background image
  const [bgImage] = useImage(backgroundImage);
  
  // Load product image
  const [prodImage] = useImage(productImage?.src);
  
  // Get selected element data
  const selectedElementData = selectedElement === 'product' 
    ? productImage 
    : elements.find(el => el.id === selectedElement);
  
  // Handle background generation
  const handleGenerateBackground = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    
    try {
      const { data } = await generateImage({
        variables: {
          input: {
            prompt,
            steps: null
          }
        }
      });
      
      if (data.generateImage.success) {
        setBackgroundImage(`data:image/jpeg;base64,${data.generateImage.image}`);
      } else {
        console.error('Error generating image:', data.generateImage.error);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle product image upload
  const handleProductImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Calculate dimensions to fit within canvas
        const maxWidth = canvasSize.width * 0.8;
        const maxHeight = canvasSize.height * 0.8;
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        if (height > maxHeight) {
          const ratio = maxHeight / height;
          height = height * ratio;
          width = width * ratio;
        }
        
        setProductImage({
          src: event.target.result,
          x: (canvasSize.width - width) / 2,
          y: (canvasSize.height - height) / 2,
          width,
          height,
          rotation: 0,
          originalWidth: img.width,
          originalHeight: img.height
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  // Handle background removal
  const handleRemoveBackground = async () => {
    if (!productImage?.src) return;
    
    try {
      const { data } = await removeBackground({
        variables: {
          input: {
            image: productImage.src,
            productId: selectedProduct
          }
        }
      });
      
      if (data.removeBackground.success) {
        setProductImage({
          ...productImage,
          src: `data:image/png;base64,${data.removeBackground.image}`
        });
      } else {
        console.error('Error removing background:', data.removeBackground.error);
      }
    } catch (error) {
      console.error('Error removing background:', error);
    }
  };
  
  // Add text element
  const addTextElement = () => {
    const id = uuidv4();
    const newElement = {
      id,
      type: 'text',
      text: 'Double click to edit',
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 20,
      width: 200,
      height: 40,
      fontSize: 20,
      fontFamily: 'Arial',
      color: '#ffffff',
      textAlign: 'center',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      rotation: 0,
      visible: true
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(id);
  };
  
  // Add shape element
  const addShapeElement = () => {
    const id = uuidv4();
    const newElement = {
      id,
      type: 'shape',
      shapeType: 'rectangle',
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 50,
      width: 100,
      height: 100,
      fill: '#3b82f6',
      stroke: '#1d4ed8',
      strokeWidth: 2,
      rotation: 0,
      visible: true
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(id);
  };
  
  // Export canvas as image
  const exportImage = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'instant-studio-design.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Handle element selection
  const handleSelect = (id) => {
    setSelectedElement(id);
  };
  
  // Handle element deletion
  const handleDelete = () => {
    if (selectedElement === 'product') {
      setProductImage(null);
    } else if (selectedElement) {
      setElements(elements.filter(el => el.id !== selectedElement));
    }
    setSelectedElement(null);
  };
  
  // Handle element visibility toggle
  const toggleVisibility = (id) => {
    if (id === 'product') {
      setProductImage({
        ...productImage,
        visible: !productImage.visible
      });
    } else {
      setElements(elements.map(el => 
        el.id === id ? { ...el, visible: !el.visible } : el
      ));
    }
  };
  
  // Handle layer reordering
  const moveLayer = (id, direction) => {
    const index = elements.findIndex(el => el.id === id);
    if (index === -1) return;
    
    const newElements = [...elements];
    const element = newElements[index];
    
    if (direction === 'up' && index < newElements.length - 1) {
      newElements[index] = newElements[index + 1];
      newElements[index + 1] = element;
    } else if (direction === 'down' && index > 0) {
      newElements[index] = newElements[index - 1];
      newElements[index - 1] = element;
    }
    
    setElements(newElements);
  };
  
  // Apply lighting adjustments to product image
  const applyLightingAdjustments = () => {
    if (!productImage || !backgroundImage) return;
    
    // This would be implemented with a canvas-based image processing library
    // For now, we'll just simulate the effect by updating state
    setProductImage({
      ...productImage,
      lightingAdjusted: true
    });
  };
  
  // Render properties panel based on selected element
  const renderProperties = () => {
    if (!selectedElement) return null;
    
    return (
      <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
        <h3 className="text-lg font-medium text-white mb-4">Properties</h3>
        
        {selectedElement === 'product' && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Position X</label>
              <input 
                type="number" 
                value={Math.round(selectedElementData.x)} 
                onChange={(e) => setProductImage({...productImage, x: Number(e.target.value)})} 
                className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Position Y</label>
              <input 
                type="number" 
                value={Math.round(selectedElementData.y)} 
                onChange={(e) => setProductImage({...productImage, y: Number(e.target.value)})} 
                className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Width</label>
              <input 
                type="number" 
                value={Math.round(selectedElementData.width)} 
                onChange={(e) => setProductImage({...productImage, width: Number(e.target.value)})} 
                className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Height</label>
              <input 
                type="number" 
                value={Math.round(selectedElementData.height)} 
                onChange={(e) => setProductImage({...productImage, height: Number(e.target.value)})} 
                className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Rotation</label>
              <input 
                type="number" 
                value={Math.round(selectedElementData.rotation || 0)} 
                onChange={(e) => setProductImage({...productImage, rotation: Number(e.target.value)})} 
                className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>
            {backgroundImage && (
              <>
                <div className="mt-4 mb-2">
                  <h4 className="text-md font-medium text-white">Lighting Adjustments</h4>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400">Brightness</label>
                  <input 
                    type="range" 
                    min="-100" 
                    max="100" 
                    value={lightingAdjustment.brightness} 
                    onChange={(e) => setLightingAdjustment({...lightingAdjustment, brightness: Number(e.target.value)})} 
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400">Contrast</label>
                  <input 
                    type="range" 
                    min="-100" 
                    max="100" 
                    value={lightingAdjustment.contrast} 
                    onChange={(e) => setLightingAdjustment({...lightingAdjustment, contrast: Number(e.target.value)})} 
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400">Saturation</label>
                  <input 
                    type="range" 
                    min="-100" 
                    max="100" 
                    value={lightingAdjustment.saturation} 
                    onChange={(e) => setLightingAdjustment({...lightingAdjustment, saturation: Number(e.target.value)})} 
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400">Temperature</label>
                  <input 
                    type="range" 
                    min="-100" 
                    max="100" 
                    value={lightingAdjustment.temperature} 
                    onChange={(e) => setLightingAdjustment({...lightingAdjustment, temperature: Number(e.target.value)})} 
                    className="w-full"
                  />
                </div>
                <button 
                  onClick={applyLightingAdjustments}
                  className="mt-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Apply Lighting Adjustments
                </button>
              </>
            )}
          </div>
        )}
        
        {selectedElementData?.type === 'text' && (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Text</label>
                <textarea 
                  value={selectedElementData.text} 
                  onChange={(e) => {
                    setElements(elements.map(el => 
                      el.id === selectedElement ? { ...el, text: e.target.value } : el
                    ));
                  }} 
                  className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Font Size</label>
                <input 
                  type="number" 
                  value={selectedElementData.fontSize} 
                  onChange={(e) => {
                    setElements(elements.map(el => 
                      el.id === selectedElement ? { ...el, fontSize: Number(e.target.value) } : el
                    ));
                  }} 
                  className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Font Family</label>
                <select 
                  value={selectedElementData.fontFamily} 
                  onChange={(e) => {
                    setElements(elements.map(el => 
                      el.id === selectedElement ? { ...el, fontFamily: e.target.value } : el
                    ));
                  }} 
                  className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Palatino">Palatino</option>
                  <option value="Garamond">Garamond</option>
                  <option value="Bookman">Bookman</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                  <option value="Arial Black">Arial Black</option>
                  <option value="Impact">Impact</option>
                  <option value="Lucida Sans">Lucida Sans</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Text Color</label>
                <input 
                  type="color" 
                  value={selectedElementData.color} 
                  onChange={(e) => {
                    setElements(elements.map(el => 
                      el.id === selectedElement ? { ...el, color: e.target.value } : el
                    ));
                  }} 
                  className="p-1 bg-gray-800 border border-gray-700 rounded-md w-full h-8"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Text Alignment</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setElements(elements.map(el => 
                        el.id === selectedElement ? { ...el, textAlign: 'left' } : el
                      ));
                    }}
                    className={`p-2 border ${selectedElementData.textAlign === 'left' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="17" y1="10" x2="3" y2="10"></line>
                      <line x1="21" y1="6" x2="3" y2="6"></line>
                      <line x1="21" y1="14" x2="3" y2="14"></line>
                      <line x1="17" y1="18" x2="3" y2="18"></line>
                    </svg>
                  </button>
                  <button 
                    onClick={() => {
                      setElements(elements.map(el => 
                        el.id === selectedElement ? { ...el, textAlign: 'center' } : el
                      ));
                    }}
                    className={`p-2 border ${selectedElementData.textAlign === 'center' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="21" y1="10" x2="3" y2="10"></line>
                      <line x1="21" y1="6" x2="3" y2="6"></line>
                      <line x1="21" y1="14" x2="3" y2="14"></line>
                      <line x1="21" y1="18" x2="3" y2="18"></line>
                    </svg>
                  </button>
                  <button 
                    onClick={() => {
                      setElements(elements.map(el => 
                        el.id === selectedElement ? { ...el, textAlign: 'right' } : el
                      ));
                    }}
                    className={`p-2 border ${selectedElementData.textAlign === 'right' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="21" y1="10" x2="7" y2="10"></line>
                      <line x1="21" y1="6" x2="3" y2="6"></line>
                      <line x1="21" y1="14" x2="3" y2="14"></line>
                      <line x1="21" y1="18" x2="7" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Font Style</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setElements(elements.map(el => 
                        el.id === selectedElement ? { ...el, fontWeight: el.fontWeight === 'bold' ? 'normal' : 'bold' } : el
                      ));
                    }}
                    className={`p-2 border ${selectedElementData.fontWeight === 'bold' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                    </svg>
                  </button>
                  <button 
                    onClick={() => {
                      setElements(elements.map(el => 
                        el.id === selectedElement ? { ...el, fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' } : el
                      ));
                    }}
                    className={`p-2 border ${selectedElementData.fontStyle === 'italic' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="4" x2="10" y2="4"></line>
                      <line x1="14" y1="20" x2="5" y2="20"></line>
                      <line x1="15" y1="4" x2="9" y2="20"></line>
                    </svg>
                  </button>
                  <button 
                    onClick={() => {
                      setElements(elements.map(el => 
                        el.id === selectedElement ? { ...el, textDecoration: el.textDecoration === 'underline' ? 'none' : 'underline' } : el
                      ));
                    }}
                    className={`p-2 border ${selectedElementData.textDecoration === 'underline' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
                      <line x1="4" y1="21" x2="20" y2="21"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        
        {selectedElementData?.type === 'shape' && (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Shape Type</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setElements(elements.map(el => 
                        el.id === selectedElement ? { ...el, shapeType: 'rectangle' } : el
                      ));
                    }}
                    className={`p-2 border ${selectedElementData.shapeType === 'rectangle' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md`}
                  >
                    <Square size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      setElements(elements.map(el => 
                        el.id === selectedElement ? { ...el, shapeType: 'circle' } : el
                      ));
                    }}
                    className={`p-2 border ${selectedElementData.shapeType === 'circle' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md`}
                  >
                    <CircleIcon size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      setElements(elements.map(el => 
                        el.id === selectedElement ? { ...el, shapeType: 'triangle' } : el
                      ));
                    }}
                    className={`p-2 border ${selectedElementData.shapeType === 'triangle' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md`}
                  >
                    <Triangle size={16} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Fill Color</label>
                <input 
                  type="color" 
                  value={selectedElementData.fill} 
                  onChange={(e) => {
                    setElements(elements.map(el => 
                      el.id === selectedElement ? { ...el, fill: e.target.value } : el
                    ));
                  }} 
                  className="p-1 bg-gray-800 border border-gray-700 rounded-md w-full h-8"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Border Color</label>
                <input 
                  type="color" 
                  value={selectedElementData.stroke} 
                  onChange={(e) => {
                    setElements(elements.map(el => 
                      el.id === selectedElement ? { ...el, stroke: e.target.value } : el
                    ));
                  }} 
                  className="p-1 bg-gray-800 border border-gray-700 rounded-md w-full h-8"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Border Width</label>
                <input 
                  type="number" 
                  value={selectedElementData.strokeWidth} 
                  onChange={(e) => {
                    setElements(elements.map(el => 
                      el.id === selectedElement ? { ...el, strokeWidth: Number(e.target.value) } : el
                    ));
                  }} 
                  className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-gray-900 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Instant Studio</h2>
        <p className="text-gray-400 mt-1">Turn