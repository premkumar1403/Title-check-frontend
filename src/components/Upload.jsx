import React, { useState, useEffect } from "react";
import { LogOut, Loader, Eye, Copy, Download, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { MdNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import Template from "./Template";
let cancelTokenSource = null;

const Upload = ({ logout }) => {
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadingMessage, setUploadingMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileData, setUploadedFileData] = useState(null); // Store uploaded file data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [IsLoading, setIsLoading] = useState(false);
  const [visitedItems, setVisitedItems] = useState(new Set());
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const createUniqueId = (file, conf, commentType, confIndex) => {
    const baseId =
      conf.id || `${file.Title}-${conf.Conference_Name}-${confIndex}`;
    return `${baseId}-${commentType}`;
  };
  const isVisited = (file, conf, commentType, confIndex) => {
    const uniqueId = createUniqueId(file, conf, commentType, confIndex);
    return visitedItems.has(uniqueId);
  };
  const [currentModalItem, setCurrentModalItem] = useState({
    itemId: null,
    commentType: null,
  });

  const [validationPopupOpen, setValidationPopupOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState("");

  const navigate = useNavigate();

  const Api_Base_Url =
    import.meta.env.VITE_REACT_APP_NET_URI ||
    import.meta.env.VITE_REACT_APP_LOCAL_URI;

  const fetchData = async (searchTerm = "", currentPage = 1) => {
    try {
      const res = await axios.get(
        `${Api_Base_Url}/api/v1/file/file-get?q=${searchTerm}&page=${currentPage}`
      );
      setFiles(res.data.data);
      setTotalPages(res.data.total_page || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data.");
    }
  };

  const fetchUploadedFileData = async (currentPage = 1) => {
    if (!uploadedFileData) return;
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${Api_Base_Url}/api/v1/file/file-upload?page=${currentPage}`,
        uploadedFileData.formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setFiles(res.data.response);
      setTotalPages(res.data.total_page || 1);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching uploaded file data:", error);
      toast.error("Failed to fetch uploaded file data.");
    }
  };

  // Handle search and pagination
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        // When searching, always search in database regardless of upload status
        fetchData(query, page);
      } else if (isUploaded && uploadedFileData) {
        // When not searching and file is uploaded, show uploaded file data
        fetchUploadedFileData(page);
      } else if (!isUploaded) {
        // When not uploaded and not searching, show all database records
        fetchData("", page);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query, page, isUploaded, uploadedFileData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (query.trim()) {
        // If there's a search query, refresh search results from database
        await fetchData(query, page);
        toast.success("Search results refreshed!");
      } else if (isUploaded && uploadedFileData) {
        // If file is uploaded and no search, refresh uploaded file data
        await fetchUploadedFileData(page);
        toast.success("Uploaded data refreshed!");
      } else {
        // If no upload and no search, refresh all database records
        await fetchData("", page);
        toast.success("Database records refreshed!");
      }
    } catch (error) {
      console.error("Refresh failed:", error);
      toast.error("Failed to refresh data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
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

  const handleCancelUpload = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Upload cancelled by user.");
    }
  };

  const handleDownloadTableData = async () => {
    try {
      toast.info("Preparing download... This may take a moment.");

      let allData = [];

      // Determine which data source to use and fetch all pages
      if (query.trim()) {
        // If there's a search query, fetch all search results from database
        allData = await fetchAllSearchResults(query);
      } else if (isUploaded && uploadedFileData) {
        // If file is uploaded and no search, fetch all uploaded file data
        allData = await fetchAllUploadedFileData();
      } else {
        // If no upload and no search, fetch all database records
        allData = await fetchAllDatabaseRecords();
      }

      if (!Array.isArray(allData) || allData.length === 0) {
        toast.error("No data to download.");
        return;
      }

      // Create a map to group data by title
      const groupedData = new Map();

      allData.forEach((file) => {
        const title = file?.Title || "";

        if (Array.isArray(file?.Conference) && file.Conference.length > 0) {
          file.Conference.forEach((conf) => {
            if (!groupedData.has(title)) {
              groupedData.set(title, {
                Title: title,
                Conference_Names: [],
                Decision_With_Comments: [],
                Precheck_Comments: [],
                Firstset_Comments: [],
              });
            }

            const group = groupedData.get(title);

            // Add conference name if it's not empty and not already added
            const confName = conf?.Conference_Name || "";
            if (confName && !group.Conference_Names.includes(confName)) {
              group.Conference_Names.push(confName);
            }

            // Add comments if they're not empty and not already added
            const decisionComment = conf?.Decision_With_Comments || "";
            if (
              decisionComment &&
              !group.Decision_With_Comments.includes(decisionComment)
            ) {
              group.Decision_With_Comments.push(decisionComment);
            }

            const precheckComment = conf?.Precheck_Comments || "";
            if (
              precheckComment &&
              !group.Precheck_Comments.includes(precheckComment)
            ) {
              group.Precheck_Comments.push(precheckComment);
            }

            const firstsetComment = conf?.Firstset_Comments || "";
            if (
              firstsetComment &&
              !group.Firstset_Comments.includes(firstsetComment)
            ) {
              group.Firstset_Comments.push(firstsetComment);
            }
          });
        } else {
          // Handle files with no conference data
          if (!groupedData.has(title)) {
            groupedData.set(title, {
              Title: title,
              Conference_Names: ["No Conference Data"],
              Decision_With_Comments: [""],
              Precheck_Comments: [""],
              Firstset_Comments: [""],
            });
          }
        }
      });

      // Convert grouped data to export format
      const exportData = Array.from(groupedData.values()).map((group) => ({
        Title: group.Title,
        Conference_Name: group.Conference_Names.join(", "),
        Decision_With_Comments: group.Decision_With_Comments.join(", "),
        Precheck_Comments: group.Precheck_Comments.join(", "),
        Firstset_Comments: group.Firstset_Comments.join(", "),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Table Data");

      const fileName = query.trim()
        ? `Search_Results_${new Date().toISOString().split("T")[0]}.xlsx`
        : `Uploaded_Data_${new Date().toISOString().split("T")[0]}.xlsx`;

      XLSX.writeFile(wb, fileName);
      toast.success(
        `Download completed! ${exportData.length} records exported.`
      );
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download data. Please try again.");
    }
  };

  // Fetch all search results from database (paginated)
  const fetchAllSearchResults = async (searchTerm) => {
    let allData = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const res = await axios.get(
          `${Api_Base_Url}/api/v1/file/file-get?q=${searchTerm}&page=${currentPage}`
        );

        const pageData = res.data.data || [];
        const totalPages = res.data.total_page || 1;

        if (pageData.length === 0 || currentPage > totalPages) {
          hasMore = false;
        } else {
          allData = [...allData, ...pageData];
          currentPage++;

          if (currentPage > totalPages) {
            hasMore = false;
          }
        }
      } catch (error) {
        console.error(
          `Error fetching search results page ${currentPage}:`,
          error
        );
        throw error;
      }
    }

    return allData;
  };

  // Fetch all uploaded file data (paginated)
  const fetchAllUploadedFileData = async () => {
    if (!uploadedFileData) return [];

    let allData = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const res = await axios.post(
          `${Api_Base_Url}/api/v1/file/file-upload?page=${currentPage}`,
          uploadedFileData.formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const pageData = res.data.response || [];
        const totalPages = res.data.total_page || 1;

        if (pageData.length === 0 || currentPage > totalPages) {
          hasMore = false;
        } else {
          allData = [...allData, ...pageData];
          currentPage++;

          // Update progress
          toast.info(
            `Fetching uploaded data... Page ${currentPage - 1} of ${totalPages}`
          );

          if (currentPage > totalPages) {
            hasMore = false;
          }
        }
      } catch (error) {
        console.error(
          `Error fetching uploaded file data page ${currentPage}:`,
          error
        );
        throw error;
      }
    }

    return allData;
  };

  // Fetch all database records (paginated)
  const fetchAllDatabaseRecords = async () => {
    let allData = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const res = await axios.get(
          `${Api_Base_Url}/api/v1/file/file-get?q=&page=${currentPage}`
        );

        const pageData = res.data.data || [];
        const totalPages = res.data.total_page || 1;

        if (pageData.length === 0 || currentPage > totalPages) {
          hasMore = false;
        } else {
          allData = [...allData, ...pageData];
          currentPage++;

          if (currentPage > totalPages) {
            hasMore = false;
          }
        }
      } catch (error) {
        console.error(
          `Error fetching database records page ${currentPage}:`,
          error
        );
        throw error;
      }
    }

    return allData;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Step 1: Read the file and validate content before uploading
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const requiredFields = [
        "Title",
        "Author_Mail",
        "Conference_Name",
        "Decision_With_Comments",
      ];

      const invalidRows = [];

      jsonData.forEach((row, index) => {
        const missing = requiredFields.filter(
          (field) => !row[field] || String(row[field]).trim() === ""
        );
        if (missing.length > 0) {
          invalidRows.push({
            rowNumber: index + 2,
            missingFields: missing,
          });
        }
      });

      if (invalidRows.length > 0) {
        const issueMessage = invalidRows
          .map(
            (row) =>
              `Paper_ID - ${
                row.rowNumber
              }: Missing fields - ${row.missingFields.join(", ")}`
          )
          .join("\n");

        setValidationErrors(issueMessage);
        setValidationPopupOpen(true);
        return;
      }

      // Step 2: Store filename before upload
      const fileName = selectedFile.name;

      // Step 3: Proceed with upload since validation passed
      setIsUploading(true);
      setUploadingMessage("Uploading...");
      cancelTokenSource = axios.CancelToken.source();

      const uploadResponse = await axios.post(
        `${Api_Base_Url}/api/v1/file/file-upload?page=${page}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          cancelToken: cancelTokenSource.token,
        }
      );

      setUploadingMessage("Processing uploaded data...");

      setUploadedFileData({
        formData: formData,
        response: uploadResponse.data.response,
      });

      setFiles(uploadResponse.data.response);
      setTotalPages(uploadResponse.data.total_page);
      setIsUploaded(true);
      setUploadedFileName(fileName); // Store the filename
      setSelectedFile(null);
      setPage(1);
      setQuery("");
      toast.success("File uploaded successfully!");
    } catch (err) {
      if (axios.isCancel(err)) {
        toast.warn("Upload cancelled.");
      } else {
        console.error("Upload failed:", err);
        toast.error("Upload failed. Please try again.");
      }
    } finally {
      setIsUploading(false);
      setUploadingMessage("");
      cancelTokenSource = null;
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setIsUploaded(false);
    setUploadedFileData(null);
    setUploadedFileName(""); // Clear the uploaded filename
    setFiles([]);
    setPage(1);
    setQuery("");
    setTotalPages(1);
    document.getElementById("file").value = null;
  };
  const handleLogout = async () => {
    try {
      const res = await axios.get(`${Api_Base_Url}/api/v1/users/signout`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        logout();
        localStorage.removeItem("isAuthenticated");
        navigate("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const normalized_query = query
      .toLowerCase()
      .replace(/[-’'"/=.,:;]/g, " ")
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

  const openModal = (content, title, file, conf, commentType, confIndex) => {
    setModalContent(content);
    setModalTitle(title);
    setCurrentModalItem({
      file,
      conf,
      commentType,
      confIndex,
    });
    setIsModalOpen(true);

    // Mark as visited when viewed with the unique identifier
    const uniqueId = createUniqueId(file, conf, commentType, confIndex);
    setVisitedItems((prev) => new Set([...prev, uniqueId]));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent("");
    setModalTitle("");
  };

  const copyToClipboard = (
    text,
    file = null,
    conf = null,
    commentType = null,
    confIndex = null
  ) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Text copied to clipboard!");
        // Mark as visited when copied (if all parameters are provided)
        if (file && conf && commentType !== null && confIndex !== null) {
          const uniqueId = createUniqueId(file, conf, commentType, confIndex);
          setVisitedItems((prev) => new Set([...prev, uniqueId]));
        }
      })
      .catch(() => {
        toast.error("Failed to copy text.");
      });
  };

  const Modal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              {modalTitle}
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() =>
                  copyToClipboard(
                    modalContent,
                    currentModalItem.file,
                    currentModalItem.conf,
                    currentModalItem.commentType,
                    currentModalItem.confIndex
                  )
                }
                className="flex items-center gap-1 px-3 cursor-pointer py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <Copy size={16} />
                Copy
              </button>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {modalContent}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Navbar */}
      <div className="bg-gray-800 text-white flex justify-between items-center px-6 py-4">
        <h1 className="sm:text-md md:text-2xl font-bold">
          Title Check - File Upload
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm bg-red-600 px-3 py-1 cursor-pointer rounded hover:bg-red-700"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Main content */}
      <div
        className={`p-4 sm:p-6 flex flex-col ${
          isUploaded
            ? "lg:flex-row lg:items-start lg:gap-6 min-h-[calc(100vh-80px)]"
            : "items-center justify-center min-h-[calc(100vh-80px)]"
        }`}
      >
        {/* Upload Box */}
        <div
          className={`w-full ${
            isUploaded
              ? "lg:w-[33%] xl:w-[28%] 2xl:w-[26%]"
              : "lg:w-[50%] xl:w-[40%] 2xl:w-[35%]"
          } sm:w-[95%] border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center mx-auto shadow-md bg-white`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-4 text-blue-600">
              <Loader className="animate-spin" size={32} />
              <p className="font-semibold">{uploadingMessage}</p>
              <button
                onClick={handleCancelUpload}
                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
              >
                Cancel Upload
              </button>
            </div>
          ) : (
            <>
              <div className="text-4xl text-blue-500 mb-2">📤</div>
              <p className="mb-1 font-semibold">
                Choose Browse File from Device
              </p>
              <input
                type="file"
                id="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor="file"
                className="cursor-pointer mt-2 inline-block text-blue-600 border border-blue-600 rounded px-4 py-1 hover:bg-blue-50"
              >
                Browse Files
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
                    onClick={handleUpload}
                    disabled={!selectedFile}
                    className={`px-3 py-2 rounded text-white flex items-center gap-2 text-sm ${
                      selectedFile
                        ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        : "bg-blue-300 cursor-not-allowed"
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3 py-2 rounded cursor-pointer text-white bg-red-600 hover:bg-red-700 text-sm"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Only show template and notes when NOT uploaded */}
              {!isUploaded && !selectedFile && (
                <>
                  <Template />
                  <div className="text-left mt-4">
                    <p className="font-bold text-amber-600">Note:</p>
                    <ul className="list-disc ml-5 mt-1 text-sm sm:text-base">
                      <li>Upload only XLSX or XLS files.</li>
                      <li>Follow the given template format.</li>
                      <li>
                        Ex: Title, Author_Mail, Conference_Name,
                        Decision_With_Comments, Precheck_Comments,
                        Firstset_Comments
                      </li>
                      <li>All fields must be filled with valid data.</li>
                    </ul>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Table Section */}
        {isUploaded && (
          <div className="w-full lg:w-[67%] xl:w-[72%] 2xl:w-[74%] bg-white rounded-2xl shadow-lg p-4 sm:p-6 mt-6 lg:mt-0">
            {/* Search Section with Download Button */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch gap-3 mb-4">
              <div className="flex gap-2 w-full sm:flex-1">
                <input
                  type="text"
                  placeholder="Search by Title or Conference Name"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="border px-4 py-2 rounded flex-1"
                />
                <button
                  onClick={handleRefresh}
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
                <span
                  className={`text-sm px-2 py-3 rounded text-center ${
                    query.trim()
                      ? "text-orange-700 bg-orange-100"
                      : "text-blue-700 bg-blue-100"
                  }`}
                >
                  {query.trim()
                    ? "Database Search Results"
                    : "Uploaded File Data"}
                </span>
                <button
                  onClick={handleDownloadTableData}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export Excel</span>
                </button>
              </div>
            </div>

            {/* Enhanced Table with better alignment */}
            <div className="overflow-auto max-w-full shadow-xl rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 sticky top-0 z-10 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-left w-[60%]">
                      Title
                    </th>
                    <th className="py-3 px-4 font-semibold text-center w-[10%]">
                      Conference
                    </th>
                    <th className="py-3 px-4 font-semibold text-center w-[10%]">
                      Decision
                    </th>
                    <th className="py-3 px-4 font-semibold text-center w-[10%]">
                      Precheck
                    </th>
                    <th className="py-3 px-4 font-semibold text-center w-[10%]">
                      Firstset
                    </th>
                  </tr>
                </thead>
                {IsLoading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-10 text-blue-600 font-medium"
                    >
                      <div className="flex justify-center items-center gap-3 py-10">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-blue-600 font-medium">
                          Loading page data...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tbody>
                    {!Array.isArray(files) || files.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-6 text-gray-500"
                        >
                          {query.trim()
                            ? "No matching records found in database."
                            : "No records found."}
                        </td>
                      </tr>
                    ) : (
                      files.map((file, fileIndex) => (
                        <React.Fragment key={fileIndex}>
                          {Array.isArray(file?.Conference) &&
                          file.Conference.length > 0 ? (
                            file.Conference.map((conf, confIndex) => {
                              const decision = (
                                conf?.Decision_With_Comments || ""
                              ).toLowerCase();
                              let decisionClass =
                                "text-yellow-600 font-semibold";

                              if (decision.includes("accept"))
                                decisionClass = "text-green-600 font-semibold";
                              else if (decision.includes("reject"))
                                decisionClass = "text-red-600 font-semibold";
                              else if (decision.includes("revision"))
                                decisionClass = "text-blue-600 font-semibold";

                              const isLastRow =
                                confIndex === file.Conference.length - 1;
                              const rowBorderClass = isLastRow
                                ? "border-b-2 border-indigo-300"
                                : "";

                              return (
                                <tr
                                  key={confIndex}
                                  className={`hover:bg-indigo-50 transition duration-200 even:bg-white odd:bg-gray-50 ${rowBorderClass}`}
                                >
                                  {confIndex === 0 && (
                                    <td
                                      rowSpan={file.Conference.length}
                                      className="py-4 px-4 align-top font-medium border-r-2 border-r-indigo-300 w-[50%]"
                                      title={file?.Title || ""}
                                    >
                                      <div className="break-words">
                                        {highlightMatch
                                          ? highlightMatch(
                                              file.Title?.toUpperCase() || "",
                                              query
                                            )
                                          : file.Title || ""}
                                      </div>
                                    </td>
                                  )}
                                  <td className="py-3 px-4 text-center border-r-2 border-r-indigo-300 w-[15%]">
                                    <div className="break-words">
                                      {conf?.Conference_Name?.trim().toUpperCase() || (
                                        <i>Unnamed Conference</i>
                                      )}
                                    </div>
                                  </td>
                                  <td
                                    className={`py-3 px-4 text-center border-r-2 border-r-indigo-300 w-[15%] ${decisionClass}`}
                                  >
                                    <div className="break-words">
                                      {conf?.Decision_With_Comments?.trim().toUpperCase() || (
                                        <i>-</i>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-center border-r-2 border-r-indigo-300">
                                    {conf?.Precheck_Comments?.trim() ? (
                                      <button
                                        onClick={() =>
                                          openModal(
                                            conf.Precheck_Comments,
                                            "Precheck Comments",
                                            file,
                                            conf,
                                            "precheck",
                                            confIndex
                                          )
                                        }
                                        className={`cursor-pointer flex items-center justify-center gap-1 px-3 py-1 rounded transition-colors mx-auto ${
                                          isVisited(
                                            file,
                                            conf,
                                            "precheck",
                                            confIndex
                                          )
                                            ? "bg-gray-500 text-white hover:bg-gray-600"
                                            : "bg-blue-500 text-white hover:bg-blue-600"
                                        }`}
                                        title={
                                          isVisited(
                                            file,
                                            conf,
                                            "precheck",
                                            confIndex
                                          )
                                            ? "Already viewed - Click to view again"
                                            : "Click to view full comments"
                                        }
                                      >
                                        <Eye size={14} />
                                        {isVisited(
                                          file,
                                          conf,
                                          "precheck",
                                          confIndex
                                        )
                                          ? "Viewed"
                                          : "View"}
                                      </button>
                                    ) : (
                                      <i>-</i>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {conf?.Firstset_Comments?.trim() ? (
                                      <button
                                        onClick={() =>
                                          openModal(
                                            conf.Firstset_Comments,
                                            "Firstset Comments",
                                            file,
                                            conf,
                                            "firstset",
                                            confIndex
                                          )
                                        }
                                        className={`cursor-pointer flex items-center justify-center gap-1 px-3 py-1 rounded transition-colors mx-auto ${
                                          isVisited(
                                            file,
                                            conf,
                                            "firstset",
                                            confIndex
                                          )
                                            ? "bg-gray-500 text-white hover:bg-gray-600"
                                            : "bg-purple-500 text-white hover:bg-purple-600"
                                        }`}
                                        title={
                                          isVisited(
                                            file,
                                            conf,
                                            "firstset",
                                            confIndex
                                          )
                                            ? "Already viewed - Click to view again"
                                            : "Click to view full comments"
                                        }
                                      >
                                        <Eye size={14} />
                                        {isVisited(
                                          file,
                                          conf,
                                          "firstset",
                                          confIndex
                                        )
                                          ? "Viewed"
                                          : "View"}
                                      </button>
                                    ) : (
                                      <i>-</i>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr className="hover:bg-indigo-50 transition duration-200 border-b-2 border-indigo-300">
                              <td className="py-4 px-4 font-medium border-r w-[30%]">
                                <div className="break-words">
                                  {highlightMatch
                                    ? highlightMatch(file?.Title || "", query)
                                    : file?.Title || ""}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center w-[15%]">
                                <i>No Conference Data</i>
                              </td>
                              <td className="py-3 px-4 text-center text-yellow-600 font-semibold w-[15%]">
                                <i>-</i>
                              </td>
                              <td className="py-3 px-4 text-center w-[20%]">
                                <i>-</i>
                              </td>
                              <td className="py-3 px-4 text-center w-[20%]">
                                <i>-</i>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                )}
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 text-sm text-center">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-full border cursor-pointer transition font-medium flex items-center gap-2
            ${
              page === 1
                ? "bg-blue-100 text-blue-400 border-blue-200 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 border-blue-500 shadow-md"
            }`}
              >
                <GrFormPrevious className="text-xl" /> Prev
              </button>

              <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold shadow-sm">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-full border cursor-pointer transition font-medium flex items-center gap-2
            ${
              page === totalPages
                ? "bg-blue-100 text-blue-400 border-blue-200 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 border-blue-500 shadow-md"
            }`}
              >
                Next <MdNavigateNext className="text-xl" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal />

      {validationPopupOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300 bg-gradient-to-r from-red-100 to-white rounded-t-2xl">
              <h3 className="text-xl font-bold text-red-700">
                ❗ Missing Fields in Excel File
              </h3>
              <button
                onClick={() => setValidationPopupOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl font-extrabold cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh] text-gray-700 text-sm leading-relaxed font-mono tracking-wide whitespace-pre-wrap">
              {validationErrors}
            </div>
            <div className="flex justify-end px-6 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setValidationPopupOpen(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Upload;