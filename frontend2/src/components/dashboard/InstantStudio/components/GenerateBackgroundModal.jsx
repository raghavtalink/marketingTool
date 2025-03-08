import React from 'react';

const GenerateBackgroundModal = ({ prompt, setPrompt, isGenerating, onGenerate }) => {
  return (
    <dialog id="generate-background-modal" className="modal">
      <div className="modal-box bg-gray-900 text-white max-w-md">
        <h3 className="font-bold text-lg mb-4">Generate Background</h3>
        <p className="text-gray-400 mb-4">
          Describe the background you want to create for your product
        </p>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., A minimalist white background with soft shadows"
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white mb-4 h-32"
        />
        
        <div className="flex justify-end gap-2">
          <button 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
            onClick={() => document.getElementById('generate-background-modal').close()}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2"
            onClick={onGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default GenerateBackgroundModal;