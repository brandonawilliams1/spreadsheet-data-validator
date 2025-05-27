import React from 'react';
import { useApp, SearchLog } from '../context/AppContext';
import { History, Search, FileSpreadsheet, Clock } from 'lucide-react';

const SearchLogs = () => {
  const { searchLogs } = useApp();

  if (searchLogs.length === 0) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <History className="h-5 w-5 text-gray-500 mr-2" />
          Search History
        </h2>
      </div>

      <div className="space-y-4">
        {searchLogs.map((log) => (
          <div
            key={log.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <span className="font-medium text-gray-900">{log.query}</span>
              </div>
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatDate(log.timestamp)}
              </span>
            </div>

            <div className="mt-2 flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {log.resultCount} {log.resultCount === 1 ? 'result' : 'results'}
              </span>
              <div className="flex items-center">
                <FileSpreadsheet className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">
                  {log.files.length} {log.files.length === 1 ? 'file' : 'files'} searched
                </span>
              </div>
            </div>

            {log.files.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-500">Files searched:</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {log.files.map((fileName, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {fileName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchLogs;