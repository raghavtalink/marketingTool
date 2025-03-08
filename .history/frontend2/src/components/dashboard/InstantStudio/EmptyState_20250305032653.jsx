import React from 'react';
import { Plus, Image } from 'lucide-react';

const EmptyState = ({ onGenerateBackground, onUploadProduct }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Create Your Design</h3>
        <p className="text-gray-400 mb-6">Start by generating a background or uploading your product image</p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={onGenerateBackground}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Generate Background
          </button>
          <button 
            onClick={onUploadProduct}
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Image size={18} /> Upload Product Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;