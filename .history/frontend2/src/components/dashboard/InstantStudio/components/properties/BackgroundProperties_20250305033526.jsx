import React from 'react';

const BackgroundProperties = ({ selectedElement, selectedElementData, elements, setElements }) => {
  return (
    <div className="space-y-3">
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
              // Update background brightness in parent state
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
              // Update background contrast in parent state
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
              // Update background saturation in parent state
            }} 
            className="w-full"
          />
          <span className="text-white text-sm">
            {Math.round((selectedElementData.saturation || 1) * 100)}%
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Blur</label>
        <div className="flex items-center gap-2">
          <input 
            type="range" 
            min="0" 
            max="20" 
            step="0.5"
            value={selectedElementData.blur || 0} 
            onChange={(e) => {
              // Update background blur in parent state
            }} 
            className="w-full"
          />
          <span className="text-white text-sm">
            {selectedElementData.blur || 0}px
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Color Overlay</label>
        <div className="flex items-center gap-2">
          <input 
            type="color" 
            value={selectedElementData.colorOverlay || '#ffffff'} 
            onChange={(e) => {
              // Update background color overlay in parent state
            }} 
            className="p-1 bg-gray-800 border border-gray-700 rounded-md w-full h-8"
          />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={selectedElementData.colorOverlayOpacity || 0} 
            onChange={(e) => {
              // Update background color overlay opacity in parent state
            }} 
            className="w-full"
          />
          <span className="text-white text-sm">
            {Math.round((selectedElementData.colorOverlayOpacity || 0) * 100)}%
          </span>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button 
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex-1"
          onClick={() => {
            // Reset all background adjustments to default values
          }}
        >
          Reset Adjustments
        </button>
        
        <button 
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex-1"
          onClick={() => {
            // Open modal to regenerate background
            document.getElementById('generate-background-modal').showModal();
          }}
        >
          Regenerate
        </button>
      </div>
    </div>
  );
};

export default BackgroundProperties;