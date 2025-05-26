import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useApp, SearchResult } from '../context/AppContext';

const SearchResults = () => {
  const { searchResults, searchQuery, isLoading } = useApp();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  // Group results by file
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
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Search Results {searchResults.length > 0 && `(${searchResults.length})`}
      </h2>
      
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
                        Column
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result, idx) => {
                      const resultId = `${result.file.id}-${result.rowIndex}`;
                      const isExpanded = expandedRows.has(resultId);
                      const matchedValue = result.row[result.matchedColumn];
                      
                      return (
                        <React.Fragment key={resultId}>
                          <tr className={isExpanded ? 'bg-teal-50' : 'hover:bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {result.rowIndex + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Column {result.matchedColumn}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <HighlightMatch text={String(matchedValue)} query={searchQuery} />
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
                                      <span className="text-xs font-medium text-gray-500 block">Column {key}</span>
                                      <span className="text-sm text-gray-900 mt-1 block">
                                        {key === result.matchedColumn ? (
                                          <HighlightMatch text={String(value)} query={searchQuery} />
                                        ) : (
                                          String(value)
                                        )}
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

const HighlightMatch = ({ text, query }: { text: string, query: string }) => {
  if (!query) return <span>{text}</span>;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, index) => (
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className="bg-yellow-200 font-semibold">{part}</span>
        ) : (
          <span key={index}>{part}</span>
        )
      ))}
    </span>
  );
};

export default SearchResults;