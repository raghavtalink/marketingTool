import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Stage, Layer } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';

import { GENERATE_IMAGE, REMOVE_BACKGROUND, PRODUCTS_QUERY } from './graphql';
import Canvas from './components/Canvas';
import LayersPanel from './components/LayersPanel';
import PropertiesPanel from './components/PropertiesPanel';
import Toolbar from './components/Toolbar';
import GenerateBackgroundModal from './components/GenerateBackgroundModal';
import EmptyState from './components/EmptyState';

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
      
      if (result.data.removeBackground.success) {
        setProductImage(`data:image/png;base64,${result.data.removeBackground.image}`);
      } else {
        console.error("Background removal failed:", result.data.removeBackground.error);
        // Show error message
        setProductImage(imageData);
      }
    } catch (error) {
      console.error("Error removing background:", error);
      // Show error message
      setProductImage(imageData);
    }
    
    setIsProcessing(false);
  };
  
  // Handle background generation
  const handleGenerateBackground = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const result = await generateImageMutation({
        variables: {
          input: {
            prompt: prompt,
            steps: null
          }
        }
      });
      
      if (result.data.generateImage.success) {
        setBackgroundImage(`data:image/jpeg;base64,${result.data.generateImage.image}`);
        document.getElementById('generate-background-modal').close();
      } else {
        console.error("Image generation failed:", result.data.generateImage.error);
        // Show error message
      }
    } catch (error) {
      console.error("Error generating image:", error);
      // Show error message
    }
    
    setIsGenerating(false);
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
      draggable: true,
      rotation: 0,
      textAlign: 'center',
      stroke: '#000000',
      strokeWidth: 0
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
      draggable: true,
      rotation: 0
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
            <EmptyState 
              onGenerateBackground={() => document.getElementById('generate-background-modal').showModal()}
              onUploadProduct={() => fileInputRef.current.click()}
            />
          ) : (
            <Canvas 
              stageRef={stageRef}
              canvasSize={canvasSize}
              backgroundImage={backgroundImage}
              productImage={productImage}
              elements={elements}
              layers={layers}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              setElements={setElements}
            />
          )}
        </div>
        
        {/* Right Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          <Toolbar 
            onAddText={addTextElement}
            onAddShape={addShapeElement}
            onExport={exportImage}
          />
          
          <div className="flex-1 overflow-y-auto">
            <LayersPanel 
              layers={layers}
              setLayers={setLayers}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              elements={elements}
              setElements={setElements}
            />
            
            <PropertiesPanel 
              selectedElement={selectedElement}
              selectedElementData={selectedElementData}
              elements={elements}
              setElements={setElements}
            />
          </div>
        </div>
      </div>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileUpload} 
      />
      
      {/* Generate Background Modal */}
      <GenerateBackgroundModal 
        prompt={prompt}
        setPrompt={setPrompt}
        isGenerating={isGenerating}
        onGenerate={handleGenerateBackground}
      />
    </div>
  );
};

export default InstantStudio;