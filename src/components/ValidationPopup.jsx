import React from 'react';

const ValidationPopup = ({ isOpen, errors, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300 bg-gradient-to-r from-red-100 to-white rounded-t-2xl">
          <h3 className="text-xl font-bold text-red-700">
            ❗ Missing Fields in Excel File
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-extrabold cursor-pointer"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh] text-gray-700 text-sm leading-relaxed font-mono tracking-wide whitespace-pre-wrap">
          {errors}
        </div>
        <div className="flex justify-end px-6 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationPopup;