import React from 'react';
import { Eye } from 'lucide-react';

const DataTable = ({
  files,
  excludedConferenceNames,
  query,
  isLoading,
  onOpenModal,
  isCurrentlyViewed,
  highlightMatch
}) => {
  const filteredFiles = files
    .map((file) => {
      const filteredConfs = Array.isArray(file.Conference)
        ? file.Conference.filter(
            (conf) =>
              !excludedConferenceNames.includes(
                conf?.Conference_Name?.trim().toUpperCase()
              )
          )
        : [];
      return { ...file, Conference: filteredConfs };
    })
    .filter((file) => file.Conference.length > 0);

  return (
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
        {isLoading ? (
          <tbody>
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
          </tbody>
        ) : (
          <tbody>
            {!Array.isArray(filteredFiles) || filteredFiles.length === 0 ? (
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
              filteredFiles.map((file, fileIndex) => (
                <React.Fragment key={fileIndex}>
                  {file.Conference.map((conf, confIndex) => {
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
                                onOpenModal(
                                  conf.Precheck_Comments,
                                  "Precheck Comments",
                                  file,
                                  conf,
                                  "precheck",
                                  confIndex
                                )
                              }
                              className={`cursor-pointer flex items-center justify-center gap-1 px-3 py-1 rounded transition-colors mx-auto ${
                                isCurrentlyViewed(file, conf, "precheck", confIndex)
                                  ? "bg-gray-500 text-white hover:bg-gray-600"
                                  : "bg-blue-500 text-white hover:bg-blue-600"
                              }`}
                              title={
                                isCurrentlyViewed(file, conf, "precheck", confIndex)
                                  ? "Currently viewing - Click to view again"
                                  : "Click to view full comments"
                              }
                            >
                              <Eye size={14} />
                              {isCurrentlyViewed(file, conf, "precheck", confIndex) ? "Viewed" : "View"}
                            </button>
                          ) : (
                            <i>-</i>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {conf?.Firstset_Comments?.trim() ? (
                            <button
                              onClick={() =>
                                onOpenModal(
                                  conf.Firstset_Comments,
                                  "Firstset Comments",
                                  file,
                                  conf,
                                  "firstset",
                                  confIndex
                                )
                              }
                              className={`cursor-pointer flex items-center justify-center gap-1 px-3 py-1 rounded transition-colors mx-auto ${
                                isCurrentlyViewed(file, conf, "firstset", confIndex)
                                  ? "bg-gray-500 text-white hover:bg-gray-600"
                                  : "bg-purple-500 text-white hover:bg-purple-600"
                              }`}
                              title={
                                isCurrentlyViewed(file, conf, "firstset", confIndex)
                                  ? "Currently viewing - Click to view again"
                                  : "Click to view full comments"
                              }
                            >
                              <Eye size={14} />
                              {isCurrentlyViewed(file, conf, "firstset", confIndex) ? "Viewed" : "View"}
                            </button>
                          ) : (
                            <i>-</i>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </tbody>
        )}
      </table>
    </div>
  );
};

export default DataTable;