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

// ... existing imports ...

const InstantStudio = () => {
    // State for canvas and elements
    const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [elements, setElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [removeBackground, setRemoveBackground] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [layers, setLayers] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Refs
    const stageRef = useRef(null);
    const fileInputRef = useRef(null);
    
    // GraphQL hooks
    const [generateImageMutation] = useMutation(GENERATE_IMAGE);
    const [removeBackgroundMutation] = useMutation(REMOVE_BACKGROUND);
    const { loading, error, data } = useQuery(PRODUCTS_QUERY);
    
    // Effect to initialize layers when elements change
    useEffect(() => {
      const newLayers = [];
      
      if (backgroundImage) {
        newLayers.push({
          id: 'background',
          type: 'background',
          name: 'Background',
          visible: true,
          locked: false
        });
      }
      
      if (productImage) {
        newLayers.push({
          id: 'product',
          type: 'product',
          name: 'Product',
          visible: true,
          locked: false
        });
      }
      
      elements.forEach((element) => {
        newLayers.push({
          id: element.id,
          type: element.type,
          name: element.type === 'text' ? 
            `Text: ${element.text.substring(0, 10)}${element.text.length > 10 ? '...' : ''}` : 
            `Shape: ${element.shapeType || 'rectangle'}`,
          visible: true,
          locked: false
        });
      });
      
      setLayers(newLayers);
    }, [elements, backgroundImage, productImage]);
    
    // Get selected element data
    const selectedElementData = selectedElement ? 
      elements.find(el => el.id === selectedElement) || 
      (selectedElement === 'product' ? { type: 'product' } : 
       selectedElement === 'background' ? { type: 'background' } : null) : 
      null;
    
    // Handle file upload
    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        
        if (removeBackground) {
          handleRemoveBackground(dataUrl);
        } else {
          setProductImage(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    };
    
    // Handle background removal
    const handleRemoveBackground = async (imageData) => {
      setIsProcessing(true);
      
      try {
        const result = await removeBackgroundMutation({
          variables: {
            input: {
              image: imageData,
              productId: selectedProduct?.id || ""
            }
          }
        });
        
        if (result.data?.removeBackground?.success) {
          setProductImage(result.data.removeBackground.image);
        } else {
          console.error("Background removal failed:", result.data?.removeBackground?.error);
          // Fallback to original image
          setProductImage(imageData);
        }
      } catch (error) {
        console.error("Error removing background:", error);
        // Fallback to original image
        setProductImage(imageData);
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Generate background with AI
    const handleGenerateBackground = async () => {
      if (!prompt.trim() || isGenerating) return;
      
      setIsGenerating(true);
      
      try {
        const result = await generateImageMutation({
          variables: {
            input: {
              prompt: prompt.trim(),
              steps: null
            }
          }
        });
        
        if (result.data?.generateImage?.success) {
          setBackgroundImage(result.data.generateImage.image);
          document.getElementById('generate-background-modal').close();
        } else {
          console.error("Image generation failed:", result.data?.generateImage?.error);
        }
      } catch (error) {
        console.error("Error generating image:", error);
      } finally {
        setIsGenerating(false);
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
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#ffffff',
        width: 200,
        height: 40,
        rotation: 0,
        textAlign: 'center',
        draggable: true
      };
      
      setElements([...elements, newElement]);
      setSelectedElement(id);
    };
    
    // Add shape element
    const addShapeElement = (shapeType) => {
      const id = uuidv4();
      const newElement = {
        id,
        type: 'shape',
        shapeType: shapeType || 'rectangle',
        x: canvasSize.width / 2 - 50,
        y: canvasSize.height / 2 - 50,
        width: 100,
        height: 100,
        fill: '#4299e1',
        stroke: '#2b6cb0',
        strokeWidth: 2,
        rotation: 0,
        draggable: true
      };
      
      setElements([...elements, newElement]);
      setSelectedElement(id);
    };
    
    // Export canvas as image
    const handleExport = () => {
      if (!stageRef.current) return;
      
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'instant-studio-design.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    // Render properties panel based on selected element
    const renderPropertiesPanel = () => {
      if (!selectedElement) {
        return (
          <div className="p-4">
            <p className="text-gray-400 text-center">Select an element to edit its properties</p>
          </div>
        );
      }
      
      const elementType = selectedElementData?.type;
      
      return (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-medium text-white">Properties</h3>
          
          {elementType === 'background' && (
            <div className="space-y-4">
              <button 
                onClick={() => document.getElementById('generate-background-modal').showModal()}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Change Background
              </button>
            </div>
          )}
          
          {elementType === 'product' && (
            <div className="space-y-4">
              <button 
                onClick={() => fileInputRef.current.click()}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Change Product Image
              </button>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="remove-bg" 
                  checked={removeBackground} 
                  onChange={(e) => setRemoveBackground(e.target.checked)}
                  className="w-4 h-4 bg-gray-800 border-gray-700 rounded"
                />
                <label htmlFor="remove-bg" className="text-sm text-gray-400">
                  Remove background on next upload
                </label>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Opacity</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={selectedElementData.opacity || 1} 
                  onChange={(e) => {
                    // Update product opacity
                  }}
                  className="w-full"
                />
              </div>
            </div>
          )}
          
          {elementType === 'text' && (
            <>
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
                  value={selectedElementData.fill} 
                  onChange={(e) => {
                    setElements(elements.map(el => 
                      el.id === selectedElement ? { ...el, fill: e.target.value } : el
                    ));
                  }} 
                  className="p-1 bg-gray-800 border border-gray-700 rounded-md w-full h-8"
                />
              </div>
            </>
          )}
          
          {elementType === 'shape' && (
            <>
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
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
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
                        console.log("Product image updated:", newAttrs);
                      }}
                      x={canvasSize.width / 2 - 100}
                      y={canvasSize.height / 2 - 100}
                      width={200}
                      height={200}
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
            
            {/* Toolbar */}
            <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-lg p-2 flex gap-2">
              <button 
                onClick={() => document.getElementById('generate-background-modal').showModal()}
                className="p-2 text-gray-400 hover:text-white"
                title="Generate Background"
              >
                <Image size={20} />
              </button>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="p-2 text-gray-400 hover:text-white"
                title="Upload Product Image"
              >
                <Plus size={20} />
              </button>
              <button 
                onClick={addTextElement}
                className="p-2 text-gray-400 hover:text-white"
                title="Add Text"
              >
                <Type size={20} />
              </button>
              <button 
                onClick={() => addShapeElement('rectangle')}
                className="p-2 text-gray-400 hover:text-white"
                title="Add Shape"
              >
                <Square size={20} />
              </button>
              <button 
                onClick={handleExport}
                className="p-2 text-gray-400 hover:text-white"
                title="Export Design"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
            {/* Tabs */}
            <div className="border-b border-gray-800">
              <div className="flex">
                <button className="flex-1 py-3 px-4 text-white font-medium border-b-2 border-blue-500">
                  Design
                </button>
                <button className="flex-1 py-3 px-4 text-gray-400 hover:text-white">
                  Settings
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {/* Layers Panel */}
              <div className="border-b border-gray-800">
                <div className="p-4">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <Layers size={18} className="mr-2" /> Layers
                  </h3>
                </div>
                
                <div className="px-2 pb-4 space-y-1">
                  {layers.map((layer, index) => (
                    <div 
                      key={layer.id}
                      onClick={() => setSelectedElement(layer.id)}
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        selectedElement === layer.id ? 'bg-blue-900/30 border border-blue-800' : 'hover:bg-gray-800'
                      }`}
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