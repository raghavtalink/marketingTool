import React from 'react';
import { 
  Type, 
  Square, 
  Circle as CircleIcon, 
  Triangle,
  Download,
  Plus
} from 'lucide-react';

const Toolbar = ({ onAddText, onAddShape, onExport }) => {
  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onAddText()}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center"
            title="Add Text"
          >
            <Type size={16} />
          </button>
          
          <button 
            onClick={() => onAddShape('rectangle')}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center"
            title="Add Rectangle"
          >
            <Square size={16} />
          </button>
          
          <button 
            onClick={() => onAddShape('circle')}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center"
            title="Add Circle"
          >
            <CircleIcon size={16} />
          </button>
          
          <button 
            onClick={() => onAddShape('triangle')}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center"
            title="Add Triangle"
          >
            <Triangle size={16} />
          </button>
        </div>
        
        <button 
          onClick={onExport}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center"
          title="Export Design"
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;