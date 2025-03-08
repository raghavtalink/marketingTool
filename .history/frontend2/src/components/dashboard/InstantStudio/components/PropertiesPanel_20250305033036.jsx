import React from 'react';
import { Sliders } from 'lucide-react';
import TextProperties from '../components';
import ShapeProperties from './properties/ShapeProperties';
import ImageProperties from './properties/ImageProperties';
import BackgroundProperties from './properties/BackgroundProperties';

const PropertiesPanel = ({ 
  selectedElement, 
  selectedElementData, 
  elements, 
  setElements 
}) => {
  if (!selectedElement || !selectedElementData) {
    return (
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <Sliders size={16} className="text-gray-400" />
          <h3 className="text-white font-medium">Properties</h3>
        </div>
        <p className="text-gray-400 text-sm">Select an element to edit its properties</p>
      </div>
    );
  }
  
  const renderPropertiesPanel = () => {
    switch (selectedElementData.type) {
      case 'text':
        return (
          <TextProperties 
            selectedElement={selectedElement}
            selectedElementData={selectedElementData}
            elements={elements}
            setElements={setElements}
          />
        );
      case 'shape':
        return (
          <ShapeProperties 
            selectedElement={selectedElement}
            selectedElementData={selectedElementData}
            elements={elements}
            setElements={setElements}
          />
        );
      case 'product':
        return (
          <ImageProperties 
            selectedElement={selectedElement}
            selectedElementData={selectedElementData}
            elements={elements}
            setElements={setElements}
          />
        );
      case 'background':
        return (
          <BackgroundProperties 
            selectedElement={selectedElement}
            selectedElementData={selectedElementData}
            elements={elements}
            setElements={setElements}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <Sliders size={16} className="text-gray-400" />
        <h3 className="text-white font-medium">Properties</h3>
      </div>
      
      {renderPropertiesPanel()}
    </div>
  );
};

export default PropertiesPanel;