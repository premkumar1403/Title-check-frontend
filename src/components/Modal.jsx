import React from 'react';
import { Copy } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  title, 
  content, 
  onClose, 
  onCopy 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-white/20 scale-95 animate-zoomIn transition-transform duration-300">
        <div className="flex justify-between items-center p-5 border-b border-gray-300/40">
          <h3 className="text-2xl font-bold text-gray-900 tracking-wide">
            {title}
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => onCopy(content)}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Copy size={18} />
              Copy
            </button>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-red-500 text-3xl font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 hover:scrollbar-thumb-blue-500">
          <p className="text-gray-800 text-lg whitespace-pre-wrap leading-relaxed tracking-wide">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Modal;