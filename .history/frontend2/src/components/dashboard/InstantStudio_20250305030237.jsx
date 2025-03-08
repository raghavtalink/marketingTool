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
        <p className="text-gray-400 mt-1">Turn basic photos into pro product images with perfect lighting for social media or E-Commerce listings.</p>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 bg-gray-950 relative overflow-hidden">
          {!backgroundImage && !productImage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center p-8 max-w-md">
                <h3 className="text-xl font-bold text-white mb-4">Create Your Design</h3>
                <p className="text-gray-400 mb-6">Start by generating a background or uploading your product image</p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => document.getElementById('generate-background-modal').showModal()}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Generate Background
                  </button>
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <Image size={18} /> Upload Product Image
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Stage
              width={canvasSize.width}
              height={canvasSize.height}
              ref={stageRef}
              onClick={(e) => {
                // Deselect when clicking on empty area
                if (e.target === e.target.getStage()) {
                  setSelectedElement(null);
                }
              }}
            >
              <Layer>
                {/* Background Image */}
                {backgroundImage && (
                  <BackgroundImage 
                    src={backgroundImage} 
                    width={canvasSize.width} 
                    height={canvasSize.height} 
                  />
                )}
                
                {/* Product Image */}
                {productImage && (
                  <DraggableImage 
                    src={productImage}
                    isSelected={selectedElement === 'product'}
                    onClick={() => setSelectedElement('product')}
                    onChange={(newAttrs) => {
                      // Update product image attributes
                    }}
                  />
                )}
                
                {/* Other Elements (Text, Shapes) */}
                {elements.map((element) => {
                  if (!layers.find(l => l.id === element.id)?.visible) return null;
                  
                  switch(element.type) {
                    case 'text':
                      return (
                        <DraggableText
                          key={element.id}
                          {...element}
                          isSelected={selectedElement === element.id}
                          onClick={() => setSelectedElement(element.id)}
                          onChange={(newAttrs) => {
                            setElements(
                              elements.map((el) => 
                                el.id === element.id ? { ...el, ...newAttrs } : el
                              )
                            );
                          }}
                        />
                      );
                    case 'shape':
                      return (
                        <DraggableShape
                          key={element.id}
                          {...element}
                          isSelected={selectedElement === element.id}
                          onClick={() => setSelectedElement(element.id)}
                          onChange={(newAttrs) => {
                            setElements(
                              elements.map((el) => 
                                el.id === element.id ? { ...el, ...newAttrs } : el
                              )
                            );
                          }}
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </Layer>
            </Stage>
          )}
          
          {/* Canvas Controls */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              onClick={() => {
                // Export canvas as image
                const dataURL = stageRef.current.toDataURL();
                const link = document.createElement('a');
                link.download = 'instant-studio-design.png';
                link.href = dataURL;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full"
              title="Download Design"
            >
              <Download size={20} className="text-white" />
            </button>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleProductImageUpload}
          />
        </div>
        
        {/* Right Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button 
              className="flex-1 py-3 px-4 text-white font-medium border-b-2 border-blue-500"
            >
              Layers
            </button>
            <button 
              className="flex-1 py-3 px-4 text-gray-400 font-medium hover:text-white"
            >
              Properties
            </button>
          </div>
          
          {/* Layers Panel */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">Layers</h3>
              <div className="flex gap-1">
                <button 
                  onClick={() => {
                    // Add text element
                    const id = uuidv4();
                    setElements([
                      ...elements,
                      {
                        id,
                        type: 'text',
                        text: 'New Text',
                        x: canvasSize.width / 2 - 50,
                        y: canvasSize.height / 2,
                        fontSize: 24,
                        fontFamily: 'Arial',
                        fill: '#ffffff',
                        width: 100,
                        height: 30,
                        draggable: true,
                        textAlign: 'center'
                      }
                    ]);
                    setSelectedElement(id);
                  }}
                  className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-md"
                  title="Add Text"
                >
                  <Type size={16} className="text-white" />
                </button>
                <button 
                  onClick={() => {
                    // Add shape element
                    const id = uuidv4();
                    setElements([
                      ...elements,
                      {
                        id,
                        type: 'shape',
                        shapeType: 'rect',
                        x: canvasSize.width / 2 - 50,
                        y: canvasSize.height / 2 - 50,
                        width: 100,
                        height: 100,
                        fill: '#4299e1',
                        stroke: '#2b6cb0',
                        strokeWidth: 2,
                        draggable: true
                      }
                    ]);
                    setSelectedElement(id);
                  }}
                  className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-md"
                  title="Add Shape"
                >
                  <Square size={16} className="text-white" />
                </button>
              </div>
            </div>
            
            {/* Layer Items */}
            <div className="space-y-1">
              {layers.map((layer, index) => (
                <div 
                  key={layer.id}
                  className={`flex items-center p-2 rounded ${selectedElement === layer.id ? 'bg-blue-900/30 border border-blue-500' : 'hover:bg-gray-800'}`}
                  onClick={() => setSelectedElement(layer.id)}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setLayers(layers.map(l => 
                        l.id === layer.id ? { ...l, visible: !l.visible } : l
                      ));
                    }}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <span className="ml-2 text-white flex-1 truncate">{layer.name}</span>
                  <div className="flex gap-1">
                    {index > 0 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Move layer up
                          const newLayers = [...layers];
                          [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
                          setLayers(newLayers);
                        }}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <ChevronUp size={14} />
                      </button>
                    )}
                    {index < layers.length - 1 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Move layer down
                          const newLayers = [...layers];
                          [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
                          setLayers(newLayers);
                        }}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <ChevronDown size={14} />
                      </button>
                    )}
                    {layer.id !== 'background' && layer.id !== 'product' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Delete layer
                          setElements(elements.filter(el => el.id !== layer.id));
                          setLayers(layers.filter(l => l.id !== layer.id));
                          if (selectedElement === layer.id) {
                            setSelectedElement(null);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Properties Panel */}
          {renderPropertiesPanel()}
        </div>
      </div>
      
      {/* Generate Background Modal */}
      <dialog id="generate-background-modal" className="modal bg-gray-900/80 backdrop-blur">
        <div className="modal-box bg-gray-900 border border-gray-800 p-6 max-w-md">
          <h3 className="text-lg font-bold text-white mb-4">Generate Background</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the background you want to generate..."
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white"
                rows={4}
              />
            </div>
            <button
              onClick={handleGenerateBackground}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                isGenerating || !prompt.trim() 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Background'}
            </button>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => document.getElementById('generate-background-modal').close()}
              className="py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

// Helper components
const BackgroundImage = ({ src, width, height }) => {
  const [image] = useImage(src);
  return (
    <Image
      image={image}
      width={width}
      height={height}
    />
  );
};

const DraggableImage = ({ src, isSelected, onClick, onChange, ...props }) => {
  const [image] = useImage(src);
  
  return (
    <Image
      image={image}
      onClick={onClick}
      onTap={onClick}
      draggable
      {...props}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
          rotation: node.rotation(),
        });
      }}
    />
  );
};

const DraggableText = ({ isSelected, onClick, onChange, ...props }) => {
  return (
    <Text
      onClick={onClick}
      onTap={onClick}
      draggable
      {...props}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          rotation: node.rotation(),
        });
      }}
    />
  );
};

const DraggableShape = ({ isSelected, onClick, onChange, shapeType, ...props }) => {
  const ShapeComponent = shapeType === 'circle' ? Circle : shapeType === 'triangle' ? Line : Rect;
  
  const shapeProps = shapeType === 'triangle' 
    ? { 
        points: [0, 0, props.width / 2, -props.height, props.width, 0],
        closed: true
      } 
    : {};
  
  return (
    <ShapeComponent
      onClick={onClick}
      onTap={onClick}
      draggable
      {...props}
      {...shapeProps}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
          rotation: node.rotation(),
        });
      }}
    />
  );
};

export default InstantStudio;