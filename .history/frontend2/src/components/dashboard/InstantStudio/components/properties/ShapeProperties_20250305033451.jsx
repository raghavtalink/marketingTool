import React from 'react';

const ShapeProperties = ({ selectedElement, selectedElementData, elements, setElements }) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Shape Type</label>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setElements(elements.map(el => 
                el.id === selectedElement ? { ...el, shapeType: 'rectangle' } : el
              ));
            }}
            className={`p-2 border ${selectedElementData.shapeType === 'rectangle' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md flex-1 text-center`}
          >
            Rectangle
          </button>
          <button 
            onClick={() => {
              setElements(elements.map(el => 
                el.id === selectedElement ? { ...el, shapeType: 'circle' } : el
              ));
            }}
            className={`p-2 border ${selectedElementData.shapeType === 'circle' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md flex-1 text-center`}
          >
            Circle
          </button>
          <button 
            onClick={() => {
              setElements(elements.map(el => 
                el.id === selectedElement ? { ...el, shapeType: 'triangle' } : el
              ));
            }}
            className={`p-2 border ${selectedElementData.shapeType === 'triangle' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md flex-1 text-center`}
          >
            Triangle
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Width</label>
        <input 
          type="number" 
          value={selectedElementData.width} 
          onChange={(e) => {
            setElements(elements.map(el => 
              el.id === selectedElement ? { ...el, width: Number(e.target.value) } : el
            ));
          }} 
          className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        />
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Height</label>
        <input 
          type="number" 
          value={selectedElementData.height} 
          onChange={(e) => {
            setElements(elements.map(el => 
              el.id === selectedElement ? { ...el, height: Number(e.target.value) } : el
            ));
          }} 
          className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        />
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Rotation (degrees)</label>
        <input 
          type="number" 
          value={selectedElementData.rotation} 
          onChange={(e) => {
            setElements(elements.map(el => 
              el.id === selectedElement ? { ...el, rotation: Number(e.target.value) } : el
            ));
          }} 
          className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        />
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
  );
};

export default ShapeProperties;