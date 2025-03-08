import React from 'react';

const ImageProperties = ({ selectedElement, selectedElementData, elements, setElements }) => {
  // For product image, we need to handle special properties
  // like opacity, brightness, contrast, etc. to help with lighting matching
  
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Opacity</label>
        <div className="flex items-center gap-2">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={selectedElementData.opacity || 1} 
            onChange={(e) => {
              // Update product image opacity in parent state
              // This would need to be handled in the parent component
            }} 
            className="w-full"
          />
          <span className="text-white text-sm">
            {Math.round((selectedElementData.opacity || 1) * 100)}%
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Brightness</label>
        <div className="flex items-center gap-2">
          <input 
            type="range" 
            min="0" 
            max="2" 
            step="0.05"
            value={selectedElementData.brightness || 1} 
            onChange={(e) => {
              // Update product image brightness in parent state
            }} 
            className="w-full"
          />
          <span className="text-white text-sm">
            {Math.round((selectedElementData.brightness || 1) * 100)}%
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Contrast</label>
        <div className="flex items-center gap-2">
          <input 
            type="range" 
            min="0" 
            max="2" 
            step="0.05"
            value={selectedElementData.contrast || 1} 
            onChange={(e) => {
              // Update product image contrast in parent state
            }} 
            className="w-full"
          />
          <span className="text-white text-sm">
            {Math.round((selectedElementData.contrast || 1) * 100)}%
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Saturation</label>
        <div className="flex items-center gap-2">
          <input 
            type="range" 
            min="0" 
            max="2" 
            step="0.05"
            value={selectedElementData.saturation || 1} 
            onChange={(e) => {
              // Update product image saturation in parent state
            }} 
            className="w-full"
          />
          <span className="text-white text-sm">
            {Math.round((selectedElementData.saturation || 1) * 100)}%
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Blend Mode</label>
        <select 
          value={selectedElementData.blendMode || 'normal'} 
          onChange={(e) => {
            // Update product image blend mode in parent state
          }} 
          className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        >
          <option value="normal">Normal</option>
          <option value="multiply">Multiply</option>
          <option value="screen">Screen</option>
          <option value="overlay">Overlay</option>
          <option value="darken">Darken</option>
          <option value="lighten">Lighten</option>
          <option value="color-dodge">Color Dodge</option>
          <option value="color-burn">Color Burn</option>
          <option value="hard-light">Hard Light</option>
          <option value="soft-light">Soft Light</option>
          <option value="difference">Difference</option>
          <option value="exclusion">Exclusion</option>
          <option value="hue">Hue</option>
          <option value="saturation">Saturation</option>
          <option value="color">Color</option>
          <option value="luminosity">Luminosity</option>
        </select>
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Shadow</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Blur</label>
            <input 
              type="number" 
              value={selectedElementData.shadowBlur || 0} 
              onChange={(e) => {
                // Update product image shadow blur in parent state
              }} 
              className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Opacity</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              value={selectedElementData.shadowOpacity || 0.5} 
              onChange={(e) => {
                // Update product image shadow opacity in parent state
              }} 
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <button 
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md w-full"
          onClick={() => {
            // Reset all image adjustments to default values
          }}
        >
          Reset Adjustments
        </button>
      </div>
    </div>
  );
};

export default ImageProperties;