import React from 'react';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import { useApp } from '../context/AppContext';
import { Database, Trash2, AlertTriangle } from 'lucide-react';

const FilesPage = () => {
  const { files, removeFile } = useApp();

  const removeAllFiles = () => {
    if (confirm('Are you sure you want to remove all files? This cannot be undone.')) {
      files.forEach(file => removeFile(file.id));
    }
  };

  const totalRows = files.reduce((acc, file) => acc + file.data.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            File Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload, view, and manage your spreadsheet files
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Spreadsheet</h2>
        <FileUpload />
      </div>

      {files.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Your Files ({files.length})
            </h2>
            {files.length > 0 && (
              <button
                onClick={removeAllFiles}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Remove All
              </button>
            )}
          </div>
          
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              title="Total Files"
              value={files.length}
              icon={<Database className="h-5 w-5 text-blue-500" />}
              color="blue"
            />
            <StatsCard
              title="Total Data Rows"
              value={totalRows}
              icon={<Database className="h-5 w-5 text-teal-500" />}
              color="teal"
            />
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Browser Storage</h3>
                <p className="text-xs text-yellow-700 mt-1">
                  Files are stored in your browser. Clearing cache will delete all files.
                </p>
              </div>
            </div>
          </div>
          
          <FileList />
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Files are processed locally and stored in your browser. No data is sent to any server.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  color: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100',
    teal: 'bg-teal-50 border-teal-100',
    purple: 'bg-purple-50 border-purple-100',
  }[color] || 'bg-gray-50 border-gray-100';
  
  return (
    <div className={`p-4 rounded-lg border ${colorClasses} flex items-center`}>
      <div className="mr-4">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default FilesPage;