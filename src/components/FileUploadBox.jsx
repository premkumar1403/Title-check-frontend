import React from 'react';
import { Loader } from 'lucide-react';
import Template from './Template';

const FileUploadBox = ({
  isUploading,
  uploadingMessage,
  selectedFile,
  uploadedFileName,
  isUploaded,
  onFileChange,
  onUpload,
  onReset,
  onCancelUpload
}) => {
  return (
    <div
      className={`w-full ${isUploaded
          ? "lg:w-[33%] xl:w-[28%] 2xl:w-[26%]"
          : "lg:w-[50%] xl:w-[40%] 2xl:w-[35%]"
        } sm:w-[95%] border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center mx-auto shadow-md bg-white`}
    >
      {isUploading ? (
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <Loader className="animate-spin" size={32} />
          <p className="font-semibold">{uploadingMessage}</p>
          <button
            onClick={onCancelUpload}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Cancel Upload
          </button>
        </div>
      ) : (
        <>
          <div className="text-4xl text-blue-500 mb-2">📤</div>
          <p className="mb-1 font-semibold">Browse File from Device</p>
          <input
            type="file"
            id="file"
            accept=".xlsx,.xls"
            onChange={onFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <label
            htmlFor="file"
            className="cursor-pointer mt-2 inline-block text-blue-600 border border-blue-600 rounded px-4 py-1 hover:bg-blue-50"
          >
            Browse File
          </label>

          {selectedFile && (
            <div className="mt-4 text-sm">
              <p className="truncate font-medium text-gray-700">
                📄 {selectedFile.name}
              </p>
              <p className="text-red-500 text-xs">Max Upload Size: 50 MB</p>
            </div>
          )}

          {isUploaded && uploadedFileName && (
            <div className="mt-4 text-sm">
              <p className="truncate font-medium text-green-700">
                ✅ Uploaded: {uploadedFileName}
              </p>
            </div>
          )}

          {selectedFile && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button
                onClick={onUpload}
                disabled={!selectedFile}
                className={`px-3 py-2 rounded text-white flex items-center gap-2 text-sm ${selectedFile
                    ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    : "bg-blue-300 cursor-not-allowed"
                  }`}
              >
                Upload
              </button>
              <button
                onClick={onReset}
                className="px-3 py-2 rounded cursor-pointer text-white bg-red-600 hover:bg-red-700 text-sm"
              >
                Reset
              </button>
            </div>
          )}

          {!isUploaded && !selectedFile && (
            <>
              <Template />
              <div className="text-left mt-4">
                <p className="font-bold text-amber-600">Note:</p>
                <ul className="list-disc ml-5 mt-1 text-sm sm:text-base font-serif leading-7">
                  <li>Upload only XLSX or XLS file.</li>
                  <li>Follow the given template format.</li>
                  <li>
                    Ex: Title, Author_Mail, Conference_Name,
                    Decision_With_Comments, Precheck_Comments,
                    Firstset_Comments
                  </li>
                  <li>All fields must be filled with valid data.</li>
                  <li><b>Handlers must use these comments only:</b> Accepted,
                    Revision sent,
                    Rejected,
                    Registered,
                    Sent back to author,
                    Precheck,
                    1st comments Pending,
                    2nd comments Pending,
                    Withdraw</li>
                </ul>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FileUploadBox;
