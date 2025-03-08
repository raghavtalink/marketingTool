import React from 'react';

const TextProperties = ({ selectedElement, selectedElementData, elements, setElements }) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Text</label>
        <textarea 
          value={selectedElementData.text} 
          onChange={(e) => {
            setElements(elements.map(el => 
              el.id === selectedElement ? { ...el, text: e.target.value } : el
            ));
          }} 
          className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white h-20"
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
      
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Text Alignment</label>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setElements(elements.map(el => 
                el.id === selectedElement ? { ...el, align: 'left' } : el
              ));
            }}
            className={`p-2 border ${selectedElementData.align === 'left' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md flex-1 text-center`}
          >
            Left
          </button>
          <button 
            onClick={() => {
              setElements(elements.map(el => 
                el.id === selectedElement ? { ...el, align: 'center' } : el
              ));
            }}
            className={`p-2 border ${selectedElementData.align === 'center' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md flex-1 text-center`}
          >
            Center
          </button>
          <button 
            onClick={() => {
              setElements(elements.map(el => 
                el.id === selectedElement ? { ...el, align: 'right' } : el
              ));
            }}
            className={`p-2 border ${selectedElementData.align === 'right' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'} rounded-md flex-1 text-center`}
          >
            Right
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextProperties;