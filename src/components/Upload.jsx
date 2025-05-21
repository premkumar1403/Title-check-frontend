// import React from "react";
// import { X, AlertTriangle } from 'lucide-react';

// const Upload = () => {
//   return (
//     <>
//         <h1 className="text-center text-white text-3xl py-4">
//           Title Check - File Upload
//         </h1>
//         <div className="min-h-screen flex items-center justify-center p-4">
//       <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-xl">
//         <div className="flex justify-between items-start mb-6">
//           <h2 className="text-2xl font-bold">Upload Files</h2>
//           <button className="text-gray-500 hover:text-gray-700">
//             <X size={24} />
//           </button>
//         </div>

//         <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center mb-8">
//           <div className="text-4xl text-blue-400 mb-2">📤</div>
//           <p className="mb-2 font-semibold">Drag files to upload</p>
//           <p className="text-sm text-gray-500">or</p>
//           <label htmlFor="file" className="mt-2 px-4 py-2 text-sm font-medium text-blue-500 border border-blue-500 rounded hover:bg-blue-50">Browse Files</label>
//             <input type="file" name="file" id="file" className="hidden"/>
//           <p className="mt-4 text-sm text-gray-400">
//             Max file size: <span className="font-medium">50MB</span><br />
//             Supported file types: <span className="font-medium">XLSX (Only)</span>
//           </p>
//         </div>

//         <div className="space-y-4">
//           {/* File 1 */}
//           <div className="flex items-center space-x-2">
//             <span className="w-4 h-4 rounded-full border-2 border-blue-500"></span>
//             <div className="flex-1">
//               <p className="text-sm font-medium text-gray-700">FileName-01.jpg <span className="text-gray-500">35MB</span></p>
//               <div className="w-full h-1 bg-blue-200 rounded-full mt-1">
//                 <div className="h-1 bg-blue-500 rounded-full w-[100%]"></div>
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//     </>
//   );
// };

// export default Upload;

import React from "react";
import { X, Download, LogOut } from "lucide-react";
import * as XLSX from "xlsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Upload = ({ logout }) => {
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      ![
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/vnd.google-apps.spreadsheet",
      ].includes(file.type)
    ) {
      alert("Only Excel or Google Sheets files are allowed.");
      return;
    }
    console.log("File accepted:", file);
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

  const handleLogout = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_URI}/api/v1/users/signout`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        logout();
        navigate("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div className="bg-gray-800 text-white flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-bold">Title Check - File Upload</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm bg-red-600 px-3 py-1 rounded hover:bg-red-700 cursor-pointer"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">Upload Files</h2>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center mb-8">
            <div className="text-4xl text-blue-400 mb-2">📤</div>
            <p className="mb-2 font-semibold">Drag files to upload</p>
            <p className="text-sm text-gray-500">or</p>
            <label
              htmlFor="file"
              className="mt-2 px-4 py-2 text-sm font-medium text-blue-500 border border-blue-500 rounded hover:bg-blue-50 cursor-pointer"
            >
              Browse Files
            </label>
            <input
              type="file"
              name="file"
              id="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="mt-4 text-sm text-gray-400">
              Max file size: <span className="font-medium">50MB</span>
              <br />
              Supported file types: <span className="font-medium">
                XLSX
              </span>{" "}
              (Only)
            </p>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm cursor-pointer"
          >
            <Download size={16} />
            Download Excel Template
          </button>
        </div>
      </div>
    </>
  );
};

export default Upload;
