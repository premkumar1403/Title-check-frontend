import React, { useState, useEffect } from "react";
import { LogOut, Loader } from "lucide-react";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { MdNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";

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

  const fetchUploadedFileData = async (currentPage = 1) => {
    if (!uploadedFileData) return;

    try {
      const res = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_URI
        }/api/v1/file/file-upload?page=${currentPage}`,
        uploadedFileData.formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setFiles(res.data.response);
      setTotalPages(res.data.total_page || 1);
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

      const uploadResponse = await axios.post(
        `${import.meta.env.VITE_REACT_APP_URI}/api/v1/file/file-upload?page=1`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          cancelToken: cancelTokenSource.token,
        }
      );

      toast.success("File uploaded successfully!");
      setUploadingMessage("Processing uploaded data...");

      // Store the uploaded file data and form data for pagination
      setUploadedFileData({
        formData: formData,
        response: uploadResponse.data.response,
      });

      setFiles(uploadResponse.data.response);
      setTotalPages(uploadResponse.data.total_page);
      setIsUploaded(true);
      setSelectedFile(null);
      setPage(1); // Reset to first page
      setQuery(""); // Reset search query
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
    setFiles([]);
    setPage(1);
    setQuery("");
    setTotalPages(1);
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
      <div
        className={`p-6 flex ${
          isUploaded
            ? "flex-row items-start gap-6 min-h-[calc(100vh-80px)]"
            : "flex-col items-center justify-center min-h-[calc(100vh-80px)]"
        }`}
      >
        {/* Upload Box */}
        <div
          className={`w-full ${
            isUploaded
              ? "lg:w-[33%] xl:w-[28%] 2xl:w-[26%]"
              : "lg:w-[50%] xl:w-[40%] 2xl:w-[35%]"
          } sm:w-[90%] md:w-[80%] border-2 border-dashed border-gray-300 rounded-xl p-5 sm:p-6 text-center shadow-md bg-white`}
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

              <div>
                <div className="text-left mt-4">
                  <p className="font-bold text-amber-600">Note:</p>
                  <ul className="flex flex-col items-start list-disc">
                    <li>Handlers should upload only XLSX or XLS files.</li>
                    <li>
                      Handlers should follow the template format given below:{" "}
                    </li>
                    <li>
                      Ex: Title, Author_Mail, Conference_Name,
                      Decision_With_Commends
                    </li>
                    <li>
                      All the fields should be filled with necessary details
                      without null values.
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Table Section */}
        {isUploaded && (
          <div className="w-full lg:w-[67%] xl:w-[72%] 2xl:w-[74%] bg-white rounded-2xl shadow-lg p-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Search by Title or Conference Name (searches entire database)"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1); // Reset to first page when searching
                }}
                className="border px-4 py-2 rounded flex-1 mr-4"
              />
              <span
                className={`text-sm px-3 py-1 rounded ${
                  query.trim()
                    ? "text-orange-700 bg-orange-100"
                    : "text-blue-700 bg-blue-100"
                }`}
              >
                {query.trim()
                  ? "Database Search Results"
                  : "Uploaded File Data"}
              </span>
            </div>

            <div className="overflow-x-auto shadow-xl rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 sticky top-0 z-10 text-gray-700">
                  <tr className="text-center">
                    <th className="py-3 px-5 font-semibold">Title</th>
                    <th className="py-3 px-5 font-semibold">Conference</th>
                    <th className="py-3 px-5 font-semibold">
                      Decision
                    </th>
                    <th className="py-3 px-5 font-semibold">Precheck</th>
                    <th className="py-3 px-5 font-semibold">Firstset</th>
                  </tr>
                </thead>
                <tbody>
                  {!Array.isArray(files) || files.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
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
                          file.Conference.map((conf, i) => {
                            const decision = (
                              conf?.Decision_With_Commends || ""
                            ).toUpperCase();
                            let decisionClass = "text-yellow-600 font-semibold";

                            if (decision.includes("accept"))
                              decisionClass = "text-green-600 font-semibold";
                            else if (decision.includes("reject"))
                              decisionClass = "text-red-600 font-semibold";
                            else if (decision.includes("revision"))
                              decisionClass = "text-blue-600 font-semibold";

                            const isLastRow = i === file.Conference.length - 1;
                            const rowBorderClass = isLastRow
                              ? "border-b-2 border-indigo-300"
                              : "";

                            return (
                              <tr
                                key={i}
                                className={`hover:bg-indigo-50 transition duration-200 even:bg-white odd:bg-gray-50 ${rowBorderClass}`}
                              >
                                {i === 0 && (
                                  <td
                                    rowSpan={file.Conference.length}
                                    className="py-4 px-5 align-top font-medium border-r-2 border-r-indigo-300"
                                    title={file?.Title || ""}
                                  >
                                    {highlightMatch
                                      ? highlightMatch(
                                          file.Title.toUpperCase() || "",
                                          query
                                        )
                                      : file.Title || ""}
                                  </td>
                                )}
                                <td
                                  className="py-3 px-5 text-center border-r-2 border-r-indigo-300"
                                  title={conf?.Conference_Name || ""}
                                >
                                  {conf?.Conference_Name?.trim().toUpperCase() || (
                                    <i>Unnamed Conference</i>
                                  )}
                                </td>
                                <td
                                  className={`py-3 px-5 border-r-2 border-r-indigo-300 ${decisionClass}`}
                                >
                                  {conf?.Decision_With_Commends?.trim().toUpperCase() || (
                                    <i>-</i>
                                  )}
                                </td>
                                <td className="py-3 px-5 border-r-2 border-r-indigo-300">
                                  {conf?.Precheck_Commends?.trim() || (
                                    <i className="flex justify-center text-2xl">
                                      -
                                    </i>
                                  )}
                                </td>
                                <td className="py-3 px-5">
                                  {conf?.Firstset_Commends?.trim() || (
                                    <i className="flex justify-center text-2xl">
                                      -
                                    </i>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr className="hover:bg-indigo-50 transition duration-200 border-b-2 border-indigo-300">
                            <td className="py-4 px-5 font-medium border-r">
                              {highlightMatch
                                ? highlightMatch(file?.Title || "", query)
                                : file?.Title || ""}
                            </td>
                            <td className="py-3 px-5">
                              <i>No Conference Data</i>
                            </td>
                            <td className="py-3 px-5 text-yellow-600 font-semibold">
                              <i>-</i>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-6 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-full border cursor-pointer transition duration-200 font-medium flex items-center gap-2
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
                className={`px-4 py-2 rounded-full border cursor-pointer transition duration-200 font-medium flex items-center gap-2
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
    </>
  );
};

export default Upload;
