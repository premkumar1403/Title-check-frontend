import React from 'react';
import { MdNavigateNext } from 'react-icons/md';
import { GrFormPrevious } from 'react-icons/gr';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 text-sm text-center">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-full border cursor-pointer transition font-medium flex items-center gap-2
          ${currentPage === 1
            ? "bg-blue-100 text-blue-400 border-blue-200 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600 border-blue-500 shadow-md"
          }`}
      >
        <GrFormPrevious className="text-xl" /> Prev
      </button>

      <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold shadow-sm">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-full border cursor-pointer transition font-medium flex items-center gap-2
          ${currentPage === totalPages
            ? "bg-blue-100 text-blue-400 border-blue-200 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600 border-blue-500 shadow-md"
          }`}
      >
        Next <MdNavigateNext className="text-xl" />
      </button>
    </div>
  );
};

export default Pagination;