import React from 'react';
import { FileSpreadsheet, Trash2, Calendar, Database, File, FileText } from 'lucide-react';
import { useApp, SpreadsheetFile } from '../context/AppContext';

const FileList = () => {
  const { files, removeFile, activeFile, setActiveFile } = useApp();

  if (files.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <Database className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
        <p className="mt-1 text-sm text-gray-500">Upload a file to get started</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getFileIcon = (extension: string) => {
    switch (extension) {
      case 'csv':
        return <File className="h-6 w-6 text-green-500" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-6 w-6 text-blue-500" />;
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleSelectFile = (file: SpreadsheetFile) => {
    setActiveFile(file.id === activeFile?.id ? null : file);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {files.map((file) => (
          <li
            key={file.id}
            className={`p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
              activeFile?.id === file.id ? 'bg-teal-50 border-l-4 border-teal-500' : ''
            }`}
            onClick={() => handleSelectFile(file)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <div className="flex-shrink-0">
                  {getFileIcon(file.extension)}
                </div>
                <div className="ml-4 truncate">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <p className="text-xs text-gray-500">{formatDate(file.dateUploaded)}</p>
                    <span className="mx-2 text-gray-300">•</span>
                    <p className="text-xs text-gray-500">{file.data.length} rows</p>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="inline-flex items-center p-1.5 border border-transparent rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;