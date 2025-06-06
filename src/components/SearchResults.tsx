import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileSpreadsheet, AlertCircle, Download } from 'lucide-react';
import { useApp, SearchResult } from '../context/AppContext';
import * as XLSX from 'xlsx';

const SearchResults = () => {
  const { searchResults, searchQuery, isLoading, searchLogs } = useApp();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const exportResults = () => {
    if (searchResults.length === 0) return;

    const wb = XLSX.utils.book_new();

    // // Create search results worksheet
    // const resultsData = searchResults.map(result => {
    //   const baseData = {
    //     'File Name': result.file.name,
    //     'Row Number': result.rowIndex + 1,
    //     'Match Found': 'true'
    //   };

    //   const rowData = Object.entries(result.row).reduce((acc, [key, value]) => {
    //     acc[`Data: ${key}`] = value;
    //     return acc;
    //   }, {} as Record<string, any>);

    //   return { ...baseData, ...rowData };
    // });

    // const resultsWs = XLSX.utils.json_to_sheet(resultsData, {
    //   header: [
    //     'File Name',
    //     'Row Number',
    //     'Match Found',
    //     ...Array.from(new Set(searchResults.flatMap(r => 
    //       Object.keys(r.row).map(k => `Data: ${k}`)
    //     )))
    //   ]
    // });

    // Create search history worksheet
    const historyData = searchLogs.map(log => ({
      'Search Query': log.query,
      'Timestamp': log.timestamp.toLocaleString(),
      'Results Found': log.resultCount,
      'Files Searched': log.files.join(', ')
    }));

    const historyWs = XLSX.utils.json_to_sheet(historyData);

    // Auto-size columns for both worksheets
    const maxWidth = 50;
    
    // Results worksheet columns
    // const resultsColWidths: { [key: string]: number } = {};
    // resultsData.forEach(row => {
    //   Object.entries(row).forEach(([key, value]) => {
    //     const width = Math.min(
    //       maxWidth,
    //       Math.max(
    //         key.length,
    //         String(value).length,
    //         resultsColWidths[key] || 0
    //       )
    //     );
    //     resultsColWidths[key] = width;
    //   });
    // });
    // resultsWs['!cols'] = Object.values(resultsColWidths).map(width => ({ width }));

    // History worksheet columns
    const historyColWidths: { [key: string]: number } = {};
    historyData.forEach(row => {
      Object.entries(row).forEach(([key, value]) => {
        const width = Math.min(
          maxWidth,
          Math.max(
            key.length,
            String(value).length,
            historyColWidths[key] || 0
          )
        );
        historyColWidths[key] = width;
      });
    });
    historyWs['!cols'] = Object.values(historyColWidths).map(width => ({ width }));

    // Add worksheets to workbook
    // XLSX.utils.book_append_sheet(wb, resultsWs, 'Search Results');
    XLSX.utils.book_append_sheet(wb, historyWs, 'Search History');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedQuery = searchQuery.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `search-results-${sanitizedQuery}-${timestamp}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (searchQuery && searchResults.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md flex items-start mt-4">
        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">No matches found</h3>
          <p className="mt-1 text-sm text-yellow-700">
            No results found for "{searchQuery}". Try a different search term or upload more files.
          </p>
        </div>
      </div>
    );
  }

  if (!searchQuery || searchResults.length === 0) {
    return null;
  }

  const toggleRowExpanded = (resultId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) {
        newSet.delete(resultId);
      } else {
        newSet.add(resultId);
      }
      return newSet;
    });
  };

  const resultsByFile = searchResults.reduce((acc, result) => {
    const fileId = result.file.id;
    if (!acc[fileId]) {
      acc[fileId] = {
        file: result.file,
        results: []
      };
    }
    acc[fileId].results.push(result);
    return acc;
  }, {} as Record<string, { file: SearchResult['file'], results: SearchResult[] }>);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Search Results {searchResults.length > 0 && `(${searchResults.length})`}
        </h2>
        {searchResults.length > 0 && (
          <button
            onClick={exportResults}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </button>
        )}
      </div>
      
      <div className="space-y-6">
        {Object.values(resultsByFile).map(({ file, results }) => (
          <div key={file.id} className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-base font-medium text-gray-900 flex items-center">
                <FileSpreadsheet className="h-5 w-5 text-teal-500 mr-2" />
                {file.name}
                <span className="ml-2 text-sm text-gray-500">
                  ({results.length} {results.length === 1 ? 'match' : 'matches'})
                </span>
              </h3>
            </div>
            
            <div className="border-t border-gray-200">
              <div className="overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Row
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Match Found
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result) => {
                      const resultId = `${result.file.id}-${result.rowIndex}`;
                      const isExpanded = expandedRows.has(resultId);
                      
                      return (
                        <React.Fragment key={resultId}>
                          <tr className={isExpanded ? 'bg-teal-50' : 'hover:bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {result.rowIndex + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              true
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => toggleRowExpanded(resultId)}
                                className="text-teal-600 hover:text-teal-900 inline-flex items-center"
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Hide</span>
                                    <ChevronUp className="ml-1 h-4 w-4" />
                                  </>
                                ) : (
                                  <>
                                    <span>View All</span>
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                          
                          {isExpanded && (
                            <tr className="bg-gray-50">
                              <td colSpan={4} className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.entries(result.row).map(([key, value]) => (
                                    <div key={key} className="border-b border-gray-200 pb-2">
                                      <span className="text-xs font-medium text-gray-500 block">{key}</span>
                                      <span className="text-sm text-gray-900 mt-1 block">
                                        {String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;