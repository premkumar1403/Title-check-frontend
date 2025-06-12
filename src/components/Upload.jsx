import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import FileUploadBox from "./FileUploadBox";
import SearchControls from "./SearchControls";
import DataTable from "./DataTable";
import Pagination from "./Pagination";
import Modal from "./Modal";
import DownloadProgress from "./DownloadProgress";
import ValidationPopup from "./ValidationPopup";
import useAuthStore from "../store/useAuthStore";
import useFileStore from "../store/useFileStore";

const Upload = () => {
  // Local UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [visitedItems, setVisitedItems] = useState(new Set());
  const [currentlyViewedItem, setCurrentlyViewedItem] = useState(null);
  const [validationPopupOpen, setValidationPopupOpen] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthStore();

  // Zustand store
  const {
    // State
    files,
    page,
    totalPages,
    query,
    isUploading,
    isUploaded,
    uploadingMessage,
    selectedFile,
    uploadedFileData,
    isLoading,
    uploadedFileName,
    isRefreshing,
    excludedConferenceNames,
    isDownloading,
    downloadProgress,
    validationErrors,

    // Actions
    setPage,
    setQuery,
    setSelectedFile,
    fetchData,
    fetchUploadedFileData,
    uploadFile,
    cancelUpload,
    resetUpload,
    refreshData,
    downloadTableData,
    cancelDownload,
  } = useFileStore();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to access this page.");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Data fetching effect
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        fetchData(query, page, logout, navigate);
      } else if (isUploaded && uploadedFileData) {
        fetchUploadedFileData(page, logout, navigate);
      } else if (!isUploaded) {
        fetchData("", page, logout, navigate);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query, page, isUploaded, uploadedFileData, isAuthenticated, fetchData, fetchUploadedFileData, logout, navigate]);


  useEffect(() => {
    if (validationErrors) {
      setValidationPopupOpen(true);
    }
  }, [validationErrors]);

  const handleRefresh = async () => {
    await refreshData(logout, navigate);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (
      file &&
      ![
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ].includes(file.type)
    ) {
      toast.error("Only Excel files are allowed.");
      return;
    }

    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadFile(selectedFile, logout, navigate);
      
      // Handle validation errors
      if (result?.validationError) {
        setValidationPopupOpen(true);
        return;
      }

      // Clear file input
      document.getElementById("file").value = null;
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleChange = async(e)=>{
    const [...name] = e.target.name;
    const [...value] = e.target.value;
  }

  const handleReset = () => {
    resetUpload();
    setCurrentlyViewedItem(null);
    document.getElementById("file").value = null;
  };

  const handleDownloadTableData = async () => {
    await downloadTableData(logout, navigate);
  };

  const handleCancelDownload = () => {
    cancelDownload();
  };

  const handleCancelUpload = () => {
    cancelUpload();
  };

  // Utility functions (keep these in component as they're UI-related)
  const createUniqueId = (file, conf, commentType, confIndex) => {
    const baseId = conf.id || `${file.Title}-${conf.Conference_Name}-${confIndex}`;
    return `${baseId}-${commentType}`;
  };

  const isCurrentlyViewed = (file, conf, commentType, confIndex) => {
    const uniqueId = createUniqueId(file, conf, commentType, confIndex);
    return currentlyViewedItem === uniqueId;
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const normalized_query = query
      .toLowerCase()
      .replace(/[-''"/=.,:;]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const regex = new RegExp(`(${normalized_query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, idx) =>
      regex.test(part) ? (
        <mark key={idx} className="bg-yellow-300 text-black px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleOpenModal = (content, title, file, conf, commentType, confIndex) => {
    setModalContent(content);
    setModalTitle(title);
    setIsModalOpen(true);
    const uniqueId = createUniqueId(file, conf, commentType, confIndex);
    setCurrentlyViewedItem(uniqueId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent("");
    setModalTitle("");
  };

  const handleCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Text copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy text.");
      });
  };

  const statusText = {
    text: query.trim()
      ? "Database Search Results"
      : isUploaded
      ? "Uploaded file Data"
      : "Database Records",
    className: query.trim()
      ? "text-orange-700 bg-orange-100"
      : isUploaded
      ? "text-green-700 bg-green-100"
      : "text-blue-700 bg-blue-100",
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar onLogout={logout} />
      <div
        className={`p-4 sm:p-6 flex flex-col ${
          isUploaded
            ? "lg:flex-row lg:items-start lg:gap-6 min-h-[calc(100vh-80px)]"
            : "items-center justify-center min-h-[calc(100vh-80px)]"
        }`}
      >
        <FileUploadBox
          isUploading={isUploading}
          uploadingMessage={uploadingMessage}
          selectedFile={selectedFile}
          uploadedFileName={uploadedFileName}
          isUploaded={isUploaded}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          onReset={handleReset}
          onCancelUpload={handleCancelUpload}
        />
        {isUploaded && (
          <div className="w-full lg:w-[67%] xl:w-[72%] 2xl:w-[74%] bg-white rounded-2xl shadow-lg p-4 sm:p-6 mt-6 lg:mt-0">
            <SearchControls
              query={query}
              onQueryChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              onDownload={handleDownloadTableData}
              isDownloading={isDownloading}
              onCancelDownload={handleCancelDownload}
              statusText={statusText}
            />
            <DataTable
              files={files}
              excludedConferenceNames={excludedConferenceNames}
              query={query}
              isLoading={isLoading}
              onOpenModal={handleOpenModal}
              isCurrentlyViewed={isCurrentlyViewed}
              highlightMatch={highlightMatch}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        title={modalTitle}
        content={modalContent}
        onClose={handleCloseModal}
        onCopy={handleCopy}
      />
      {/* <DownloadProgress
        isDownloading={isDownloading}
        progress={downloadProgress}
        onCancel={handleCancelDownload}
      /> */}
      <ValidationPopup
        isOpen={validationPopupOpen}
        errors={validationErrors}
        onClose={() => setValidationPopupOpen(false)}
      />
    </>
  );
};

export default Upload;