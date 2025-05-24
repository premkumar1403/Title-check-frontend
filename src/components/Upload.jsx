import React, { useState, useEffect } from "react";
import { LogOut, Loader } from "lucide-react";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {Tooltip} from "react-tooltip";

let cancelTokenSource = null;

const Upload = ({ logout }) => {
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingMessage, setUploadingMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const navigate = useNavigate();

  const fetchData = async (searchTerm = "", currentPage = 1) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_URI
        }/api/v1/file/file-get?q=${searchTerm}&page=${currentPage}`
      );
      setFiles(res.data.data);
      setTotalPages(res.data.total_page || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data.");
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData(query, page);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query, page]);

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

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      setUploadingMessage("Uploading...");
      cancelTokenSource = axios.CancelToken.source();

      await axios.post(
        `${import.meta.env.VITE_REACT_APP_URI}/api/v1/file/file-upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          cancelToken: cancelTokenSource.token,
        }
      );

      toast.success("File uploaded successfully!");
      setUploadingMessage("Processing uploaded data...");
      await fetchData();
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

  const handleCancelUpload = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Upload cancelled by user.");
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        Title: "",
        Author_Mail: "",
        Conference_Name: "",
        Decision_With_Comments: "",
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Title_Template.xlsx");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsUploading(true);
      setUploadingMessage("Uploading...");
      cancelTokenSource = axios.CancelToken.source();

      await axios.post(
        `${import.meta.env.VITE_REACT_APP_URI}/api/v1/file/file-upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          cancelToken: cancelTokenSource.token,
        }
      );

      toast.success("File uploaded successfully!");
      setUploadingMessage("Processing uploaded data...");
      await fetchData();
      setSelectedFile(null); // reset after upload
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
    document.getElementById("file").value = null;
  };

  const handleLogout = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_URI}/api/v1/users/signout`,
        { withCredentials: true }
      );
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
    const regex = new RegExp(`(${query})`, "gi");
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

  return (
    <>
      {/* Navbar */}
      <div className="bg-gray-800 text-white flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-bold">Title Check - File Upload</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm bg-red-600 px-3 py-1 cursor-pointer rounded hover:bg-red-700"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Main content */}
      <div className="p-6 flex gap-6">
        {/* Upload Box */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center h-2/5">
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
                  <p className="truncate">{selectedFile.name}</p>
                  <p className="text-red-500 text-xs">Max Upload Size: 50 MB</p>
                </div>
              )}

              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className={`px-2 py-1 rounded text-white flex items-center gap-2 ${
                    selectedFile
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-300 cursor-not-allowed"
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={handleReset}
                  disabled={!selectedFile}
                  className="px-2 py-1 rounded text-white bg-red-600 cursor-pointer hover:bg-red-700"
                >
                  Reset
                </button>
              </div>

              <button
                onClick={handleDownloadTemplate}
                className="text-sm text-white bg-green-500 px-2 mt-5 py-2 rounded cursor-pointer hover:bg-green-600"
              >
                ⬇ Download Excel Template
              </button>

              <span
                data-tooltip-id="templateInfo"
                className="ml-2 cursor-pointer text-gray-500"
              >
                ℹ️
              </span>

              <Tooltip
                id="templateInfo"
                place="top"
                effect="solid"
                className="max-w-xs text-left"
              >
                The Excel template should contain the following columns: <br />
                <strong>Title</strong>, <strong>Author_Mail</strong>,{" "}
                <strong>Conference_Name</strong>, and{" "}
                <strong>Decision_With_Comments</strong>.<br />
                Fill them accordingly before uploading.
              </Tooltip>
            </>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto w-9/12">
          <input
            type="text"
            placeholder="Search by Title or Conference Name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border px-4 py-2 rounded w-full mb-4"
          />
          <table className="min-w-full text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 text-left">Title</th>
                <th className="py-2 px-4 text-left">Conference</th>
                <th className="py-2 px-4 text-left">Decision_With_Comments</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                files.map((file, idx) => (
                  <tr key={idx} className="border-b align-top">
                    <td className="py-2 px-4">
                      {highlightMatch(file.Title, query)}
                    </td>

                    {/* Display all Conference Names */}
                    <td className="py-2 px-4">
                      {file.Conference?.map((conf, i) => (
                        <div key={i} className="mb-1">
                          {conf.Conference_Name}
                        </div>
                      ))}
                    </td>

                    {/* Display all Decisions with Color Coding */}
                    <td className="py-2 px-4">
                      {file.Conference?.map((conf, i) => {
                        const decision =
                          conf.Decision_With_Commends?.toLowerCase() || "";
                        let decisionClass = "text-yellow-600 font-semibold";

                        if (decision.includes("accept"))
                          decisionClass = "text-green-600 font-semibold";
                        else if (decision.includes("reject"))
                          decisionClass = "text-red-600 font-semibold";
                        else if (decision.includes("revision"))
                          decisionClass = "text-blue-600 font-semibold";

                        return (
                          <div key={i} className={`mb-1 ${decisionClass}`}>
                            {conf.Decision_With_Commends}
                          </div>
                        );
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-full border cursor-pointer transition duration-200 font-medium 
                ${
                  page === 1
                    ? "bg-blue-100 text-blue-400 border-blue-200 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 border-blue-500 shadow-md"
                }`}
            >
              ⬅ Prev
            </button>

            <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold shadow-sm">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-full border cursor-pointer transition duration-200 font-medium 
                ${
                  page === totalPages
                    ? "bg-blue-100 text-blue-400 border-blue-200 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 border-blue-500 shadow-md"
                }`}
            >
              Next ➡
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upload;
