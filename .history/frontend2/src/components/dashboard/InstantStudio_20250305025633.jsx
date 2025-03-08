import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  Image, 
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
  Circle,
  Triangle,
  Crop,
  Scissors
} from 'react-feather';
import { Stage, Layer, Image as KonvaImage, Text, Rect, Circle as KonvaCircle, RegularPolygon } from 'react-konva';
import useImage from 'use-image';
import '../../custom.css';

// GraphQL mutations
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

// Query to fetch products
const GET_PRODUCTS = gql`
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

// Component to handle image with background removed
const ProductImage = ({ src, x, y, width, height, draggable, onDragEnd, onSelect, isSelected, onTransformEnd }) => {
  const [image] = useImage(src);
  const shapeRef = useRef();
  
  useEffect(() => {
    if (isSelected && shapeRef.current) {
      // You could add transformer here if needed
    }
  }, [isSelected]);

  return (
    <KonvaImage
      ref={shapeRef}
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      draggable={draggable}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      onTransformEnd={onTransformEnd}
    />
  );
};

// Component to handle background image
const BackgroundImage = ({ src, width, height }) => {
  const [image] = useImage(src);
  
  return (
    <KonvaImage
      image={image}
      width={width}
      height={height}
    />
  );
};

// Text element component
const TextElement = ({ text, x, y, fontSize, fontFamily, fill, draggable, onDragEnd, onSelect, isSelected, onTransformEnd }) => {
  const textRef = useRef();
  
  useEffect(() => {
    if (isSelected && textRef.current) {
      // You could add transformer here if needed
    }
  }, [isSelected]);

  return (
    <Text
      ref={textRef}
      text={text}
      x={x}
      y={y}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fill={fill}
      draggable={draggable}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      onTransformEnd={onTransformEnd}
    />
  );
};

// Shape components
const ShapeElement = ({ type, x, y, width, height, fill, draggable, onDragEnd, onSelect, isSelected, onTransformEnd }) => {
  const shapeRef = useRef();
  
  useEffect(() => {
    if (isSelected && shapeRef.current) {
      // You could add transformer here if needed
    }
  }, [isSelected]);

  if (type === 'rectangle') {
    return (
      <Rect
        ref={shapeRef}
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        draggable={draggable}
        onDragEnd={onDragEnd}
        onClick={onSelect}
        onTap={onSelect}
        onTransformEnd={onTransformEnd}
      />
    );
  } else if (type === 'circle') {
    return (
      <KonvaCircle
        ref={shapeRef}
        x={x + width/2}
        y={y + height/2}
        radius={Math.min(width, height)/2}
        fill={fill}
        draggable={draggable}
        onDragEnd={onDragEnd}
        onClick={onSelect}
        onTap={onSelect}
        onTransformEnd={onTransformEnd}
      />
    );
  } else if (type === 'triangle') {
    return (
      <RegularPolygon
        ref={shapeRef}
        x={x + width/2}
        y={y + height/2}
        sides={3}
        radius={Math.min(width, height)/2}
        fill={fill}
        draggable={draggable}
        onDragEnd={onDragEnd}
        onClick={onSelect}
        onTap={onSelect}
        onTransformEnd={onTransformEnd}
      />
    );
  }
  
  return null;
};

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
  const { loading, error, data } = useQuery(GET_PRODUCTS);
  
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
    
    elements.forEach((element, index) => {
      newLayers.push({
        id: element.id,
        type: element.type,
        name: `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} ${index + 1}`,
        visible: element.visible !== false,
        locked: element.locked || false
      });
    });
    
    setLayers(newLayers.reverse()); // Reverse to match canvas stacking order
  }, [backgroundImage, productImage, elements]);
  
  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };
  
  // Handle file upload for product image
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          // Calculate dimensions to fit within canvas while maintaining aspect ratio
          const aspectRatio = img.width / img.height;
          let newWidth = canvasSize.width * 0.5;
          let newHeight = newWidth / aspectRatio;
          
          if (newHeight > canvasSize.height * 0.8) {
            newHeight = canvasSize.height * 0.8;
            newWidth = newHeight * aspectRatio;
          }
          
          const newProductImage = {
            src: event.target.result,
            x: (canvasSize.width - newWidth) / 2,
            y: (canvasSize.height - newHeight) / 2,
            width: newWidth,
            height: newHeight,
            originalWidth: img.width,
            originalHeight: img.height
          };
          
          setProductImage(newProductImage);
          
          if (removeBackground) {
            handleRemoveBackground(event.target.result);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle background removal
  const handleRemoveBackground = async (imageData) => {
    if (!imageData) return;
    
    try {
      setIsProcessing(true);
      const result = await removeBackgroundMutation({
        variables: {
          input: {
            image: imageData,
            productId: selectedProduct?.id || ""
          }
        }
      });
      
      if (result.data.removeBackground.success) {
        // Update product image with background removed
        setProductImage(prev => ({
          ...prev,
          src: `data:image/png;base64,${result.data.removeBackground.image}`
        }));
      } else {
        console.error("Background removal failed:", result.data.removeBackground.error);
      }
    } catch (error) {
      console.error("Error removing background:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle background generation
  const handleGenerateBackground = async () => {
    if (!prompt) return;
    
    try {
      setIsGenerating(true);
      const result = await generateImageMutation({
        variables: {
          input: {
            prompt: prompt,
            steps: null
          }
        }
      });
      
      if (result.data.generateImage.success) {
        setBackgroundImage({
          src: `data:image/jpeg;base64,${result.data.generateImage.image}`,
          width: canvasSize.width,
          height: canvasSize.height
        });
      } else {
        console.error("Image generation failed:", result.data.generateImage.error);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Add text element
  const handleAddText = () => {
    const newText = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'Double click to edit',
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      visible: true
    };
    
    setElements([...elements, newText]);
  };
  
  // Add shape element
  const handleAddShape = (shapeType) => {
    const newShape = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType: shapeType,
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 50,
      width: 100,
      height: 100,
      fill: '#cccccc',
      visible: true
    };
    
    setElements([...elements, newShape]);
  };
  
  // Handle element selection
  const handleSelectElement = (element) => {
    setSelectedElement(element);
  };
  
  // Handle element drag
  const handleElementDrag = (e, id) => {
    const { x, y } = e.target.position();
    
    if (id === 'product') {
      setProductImage({
        ...productImage,
        x,
        y
      });
    } else {
      setElements(
        elements.map(el => 
          el.id === id ? { ...el, x, y } : el
        )
      );
    }
  };
  
  // Handle element transform
  const handleElementTransform = (e, id) => {
    // Handle scaling, rotation, etc.
    const node = e.target;
    
    if (id === 'product') {
      setProductImage({
        ...productImage,
        x: node.x(),
        y: node.y(),
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY()
      });
    } else {
      setElements(
        elements.map(el => 
          el.id === id ? { 
            ...el, 
            x: node.x(), 
            y: node.y(),
            width: node.width() * node.scaleX(),
            height: node.height() * node.scaleY()
          } : el
        )
      );
    }
  };
  
  // Handle layer visibility toggle
  const handleLayerVisibility = (id) => {
    if (id === 'background') {
      // Toggle background visibility
    } else if (id === 'product') {
      setProductImage({
        ...productImage,
        visible: !productImage.visible
      });
    } else {
      setElements(
        elements.map(el => 
          el.id === id ? { ...el, visible: !el.visible } : el
        )
      );
    }
    
    // Update layers state
    setLayers(
      layers.map(layer => 
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };
  
  // Handle layer reordering
  const handleLayerReorder = (id, direction) => {
    const layerIndex = layers.findIndex(layer => layer.id === id);
    if (layerIndex === -1) return;
    
    if (direction === 'up' && layerIndex > 0) {
      const newLayers = [...layers];
      [newLayers[layerIndex], newLayers[layerIndex - 1]] = [newLayers[layerIndex - 1], newLayers[layerIndex]];
      setLayers(newLayers);
      
      // Update elements order accordingly
      // This is more complex and depends on your specific implementation
    } else if (direction === 'down' && layerIndex < layers.length - 1) {
      const newLayers = [...layers];
      [newLayers[layerIndex], newLayers[layerIndex + 1]] = [newLayers[layerIndex + 1], newLayers[layerIndex]];
      setLayers(newLayers);
      
      // Update elements order accordingly
    }
  };
  
  // Handle element deletion
  const handleDeleteElement = (id) => {
    if (id === 'product') {
      setProductImage(null);
    } else if (id === 'background') {
      setBackgroundImage(null);
    } else {
      setElements(elements.filter(el => el.id !== id));
    }
    
    setSelectedElement(null);
  };
  
  // Export canvas as image
  const handleExport = () => {
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
  
  // Render the canvas
  const renderCanvas = () => {
    return (
      <Stage 
        width={canvasSize.width} 
        height={canvasSize.height} 
        ref={stageRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedElement(null);
          }
        }}
        className="border border-gray-700 bg-gray-800"
      >
        <Layer>
          {/* Background */}
          {backgroundImage && (
            <BackgroundImage 
              src={backgroundImage.src} 
              width={canvasSize.width} 
              height={canvasSize.height} 
            />
          )}
          
          {/* Product Image */}
          {productImage && productImage.visible !== false && (
            <ProductImage 
              src={productImage.src}
              x={productImage.x}
              y={productImage.y}
              width={productImage.width}
              height={productImage.height}
              draggable={true}
              onDragEnd={(e) => handleElementDrag(e, 'product')}
              onSelect={() => handleSelectElement('product')}
              isSelected={selectedElement === 'product'}
              onTransformEnd={(e) => handleElementTransform(e, 'product')}
            />
          )}
          
          {/* Other Elements */}
          {elements.map((element) => {
            if (element.visible === false) return null;
            
            if (element.type === 'text') {
              return (
                <TextElement 
                  key={element.id}
                  text={element.text}
                  x={element.x}
                  y={element.y}
                  fontSize={element.fontSize}
                  fontFamily={element.fontFamily}
                  fill={element.fill}
                  draggable={true}
                  onDragEnd={(e) => handleElementDrag(e, element.id)}
                  onSelect={() => handleSelectElement(element.id)}
                  isSelected={selectedElement === element.id}
                  onTransformEnd={(e) => handleElementTransform(e, element.id)}
                />
              );
            } else if (element.type === 'shape') {
              return (
                <ShapeElement 
                  key={element.id}
                  type={element.shapeType}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  fill={element.fill}
                  draggable={true}
                  onDragEnd={(e) => handleElementDrag(e, element.id)}
                  onSelect={() => handleSelectElement(element.id)}
                  isSelected={selectedElement === element.id}
                  onTransformEnd={(e) => handleElementTransform(e, element.id)}
                />
              );
            }
            
            return null;
          })}
        </Layer>
      </Stage>
    );
  };
  
  // Render the toolbar
  const renderToolbar = () => {
    return (
      <div className="flex flex-col gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-medium text-white">Tools</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              className="p-2 bg-gray-800 rounded-md hover:bg-gray-700 text-white"
              onClick={() => fileInputRef.current.click()}
            >
              <Image size={20} />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </button>
            <button 
              className="p-2 bg-gray-800 rounded-md hover:bg-gray-700 text-white"
              onClick={handleAddText}
            >
              <Type size={20} />
            </button>
            <button 
              className="p-2 bg-gray-800 rounded-md hover:bg-gray-700 text-white"
              onClick={() => handleAddShape('rectangle')}
            >
              <Square size={20} />
            </button>
            <button 
              className="p-2 bg-gray-800 rounded-md hover:bg-gray-700 text-white"
              onClick={() => handleAddShape('circle')}
            >
              <Circle size={20} />
            </button>
            <button 
              className="p-2 bg-gray-800 rounded-md hover:bg-gray-700 text-white"
              onClick={() => handleAddShape('triangle')}
            >
              <Triangle size={20} />
            </button>
            <button 
              className="p-2 bg-gray-800 rounded-md hover:bg-gray-700 text-white"
              onClick={() => selectedElement && handleDeleteElement(selectedElement)}
              disabled={!selectedElement}
            >
              <Trash2 size={20} className={!selectedElement ? "opacity-50" : ""} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-medium text-white">Background</h3>
          <div className="flex flex-col gap-2">
            <input 
              type="text" 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              placeholder="Describe your background..." 
              className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            />
            <button 
              className="p-2 bg-indigo-600 rounded-md hover:bg-indigo-700 text-white flex items-center justify-center"
              onClick={handleGenerateBackground}
              disabled={isGenerating || !prompt}
            >
              {isGenerating ? "Generating..." : "Generate Background"}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-medium text-white">Product Image</h3>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="removeBackground" 
              checked={removeBackground} 
              onChange={() => setRemoveBackground(!removeBackground)} 
              className="rounded text-indigo-600"
            />
            <label htmlFor="removeBackground" className="text-white">Remove Background</label>
          </div>
          {productImage && (
            <button 
              className="p-2 bg-indigo-600 rounded-md hover:bg-indigo-700 text-white flex items-center justify-center"
              onClick={() => handleRemoveBackground(productImage.src)}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Process Image"}
            </button>
          )}
        </div>
        
        <div className="flex flex-col gap-2 mt-auto">
          <button 
            className="p-2 bg-green-600 rounded-md hover:bg-green-700 text-white flex items-center justify-center gap-2"
            onClick={handleExport}
          >
            <Download size={16} />
            Export Design
          </button>
        </div>
      </div>
    );
  };
  
  // Render the layers panel
  const renderLayers = () => {
    return (
      <div className="flex flex-col gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Layers</h3>
        </div>
        
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {layers.map((layer) => (
            <div 
              key={layer.id} 
              className={`flex items-center justify-between p-2 rounded-md ${selectedElement === layer.id ? 'bg-gray-700' : 'bg-gray-800'} hover:bg-gray-700`}
              onClick={() => handleSelectElement(layer.id)}
            >
              <div className="flex items-center gap-2">
                <button 
                  className="p-1 rounded-md hover:bg-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLayerVisibility(layer.id);
                  }}
                >
                  {layer.visible ? <Eye size={16} className="text-white" /> : <EyeOff size={16} className="text-gray-400" />}
                </button>
                <span className="text-white">{layer.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  className="p-1 rounded-md hover:bg-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLayerReorder(layer.id, 'up');
                  }}
                >
                  <ChevronUp size={16} className="text-white" />
                </button>
                <button 
                  className="p-1 rounded-md hover:bg-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLayerReorder(layer.id, 'down');
                  }}
                >
                  <ChevronDown size={16} className="text-white" />
                </button>
                <button 
                  className="p-1 rounded-md hover:bg-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteElement(layer.id);
                  }}
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render properties panel for selected element
  const renderProperties = () => {
    if (!selectedElement) return null;
    
    let selectedElementData;
    if (selectedElement === 'product') {
      selectedElementData = productImage;
    } else if (selectedElement === 'background') {
      selectedElementData = backgroundImage;
    } else {
      selectedElementData = elements.find(el => el.id === selectedElement);
    }
    
    if (!selectedElementData) return null;
    
    return (
      <div className="flex flex-col gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg">
        <h3 className="text-lg font-medium text-white">Properties</h3>
        
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
          </div>
        )}
        
        {selectedElementData.type === 'text' && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Text</label>
              <input 
                type="text" 
                value={selectedElementData.text} 
                onChange={(e) => {
                  setElements(elements.map(el => 
                    el.id === selectedElement ? { ...el, text: e.target.value } : el
                  ));
                }} 
                className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
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
          </>
        )}

        {/* Shape properties */}
        {selectedElementData && selectedElementData.type === 'shape' && (
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
                  <Circle size={16} />
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
    </div>
  );
};

export default InstantStudio;