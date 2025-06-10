import React from 'react';
import { Download } from 'lucide-react';

const DownloadProgress = ({ 
  isDownloading, 
  progress, 
  onCancel 
}) => {
  if (!isDownloading) return null;

  const progressPercentage =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Download className="animate-bounce" size={20} />
            Preparing Download
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-red-500 text-2xl font-bold cursor-pointer transition-colors"
            title="Cancel Download"
          >
            ×
          </button>
        </div>

        {progress.total > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Fetching data...</span>
              <span>
                {progress.current} / {progress.total} pages
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-center mt-2 text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}% Complete
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer"
          >
            Cancel Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadProgress;