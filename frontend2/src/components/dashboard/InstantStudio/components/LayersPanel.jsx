import React from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown,
  Trash2,
  Lock,
  Unlock
} from 'lucide-react';

const LayersPanel = ({ 
  layers, 
  setLayers, 
  selectedElement, 
  setSelectedElement,
  elements,
  setElements
}) => {
  const toggleLayerVisibility = (id) => {
    setLayers(
      layers.map(layer => 
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };
  
  const toggleLayerLock = (id) => {
    setLayers(
      layers.map(layer => 
        layer.id === id ? { ...layer, locked: !layer.locked } : layer
      )
    );
  };
  
  const moveLayerUp = (index) => {
    if (index === 0) return;
    const newLayers = [...layers];
    [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
    setLayers(newLayers);
  };
  
  const moveLayerDown = (index) => {
    if (index === layers.length - 1) return;
    const newLayers = [...layers];
    [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    setLayers(newLayers);
  };
  
  const deleteLayer = (id) => {
    if (id === 'background' || id === 'product') return;
    
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };
  
  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <Layers size={16} className="text-gray-400" />
        <h3 className="text-white font-medium">Layers</h3>
      </div>
      
      <div className="space-y-2">
        {layers.map((layer, index) => (
          <div 
            key={layer.id}
            className={`flex items-center justify-between p-2 rounded ${
              selectedElement === layer.id ? 'bg-blue-900/30 border border-blue-500' : 'bg-gray-800 border border-gray-700'
            }`}
            onClick={() => setSelectedElement(layer.id)}
          >
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerVisibility(layer.id);
                }}
                className="text-gray-400 hover:text-white"
              >
                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <span className="text-white text-sm truncate max-w-[120px]">
                {layer.name}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerLock(layer.id);
                }}
                className="text-gray-400 hover:text-white"
              >
                {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayerUp(index);
                }}
                className="text-gray-400 hover:text-white"
                disabled={index === 0}
              >
                <ChevronUp size={14} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayerDown(index);
                }}
                className="text-gray-400 hover:text-white"
                disabled={index === layers.length - 1}
              >
                <ChevronDown size={14} />
              </button>
              {layer.id !== 'background' && layer.id !== 'product' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLayer(layer.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayersPanel;