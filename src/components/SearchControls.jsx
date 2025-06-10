import React from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { MdCancel } from 'react-icons/md';

const SearchControls = ({
  query,
  onQueryChange,
  onRefresh,
  isRefreshing,
  onDownload,
  isDownloading,
  onCancelDownload,
  statusText
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch gap-3 mb-4">
      <div className="flex gap-2 w-full sm:flex-1">
        <input
          type="text"
          placeholder="Search by Title or Conference Name"
          value={query}
          onChange={onQueryChange}
          className="border px-4 py-2 rounded flex-1"
        />
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`px-3 py-2 rounded border transition-colors flex items-center justify-center ${
            isRefreshing
              ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-800 cursor-pointer"
          }`}
          title="Refresh current data"
        >
          <RefreshCw
            size={18}
            className={isRefreshing ? "animate-spin" : ""}
          />
        </button>
      </div>
      <div className="flex gap-2 justify-center items-center">
        <span className={`text-sm px-2 py-3 rounded text-center ${statusText.className}`}>
          {statusText.text}
        </span>
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            isDownloading
              ? "bg-blue-400 text-gray-200 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
          }`}
        >
          {isDownloading ? (
            <span className="hidden sm:inline">Downloading...</span>
          ) : (
            <>
              <Download size={16} />
              <span className="hidden sm:inline">
                {query.trim() ? "Export Search" : "Export Response"}
              </span>
            </>
          )}
        </button>

        {isDownloading && (
          <button
            onClick={onCancelDownload}
            className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer transition-colors"
          >
           <MdCancel className='text-xl'/>
            <span className="hidden sm:inline">Cancel</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchControls;