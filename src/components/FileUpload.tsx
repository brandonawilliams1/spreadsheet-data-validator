import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, Check, AlertCircle, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FileUpload = () => {
  const { addFile, isLoading, error } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadSuccess(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadSuccess(false);
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !['csv', 'xlsx', 'xls', 'pdf'].includes(fileExtension)) {
      alert('Please upload a CSV, Excel, or PDF file');
      return;
    }
    
    setFileName(file.name);
    
    try {
      await addFile(file);
      setUploadSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (extension: string | undefined) => {
    switch (extension?.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-12 w-12 text-red-400" />;
      default:
        return <FileSpreadsheet className="h-12 w-12 text-gray-400" />;
    }
  };

  return (
    <div className="mb-8">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging 
            ? 'border-teal-500 bg-teal-50' 
            : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls,.pdf"
          onChange={handleFileSelect}
          ref={fileInputRef}
        />
        
        {getFileIcon(fileName.split('.').pop())}
        
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Upload a file
        </h3>
        
        <p className="mt-1 text-xs text-gray-500">
          CSV, XLSX, XLS, or PDF (max. 10MB)
        </p>
        
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            onClick={triggerFileInput}
            disabled={isLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? 'Uploading...' : 'Select File'}
          </button>
        </div>
        
        <p className="mt-2 text-xs text-gray-500">
          Or drag and drop a file
        </p>
      </div>

      {fileName && (
        <div className={`mt-4 p-3 rounded-md flex items-center ${
          error ? 'bg-red-50' : (uploadSuccess ? 'bg-green-50' : 'bg-gray-50')
        }`}>
          <div className="flex-shrink-0">
            {error ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              uploadSuccess ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                getFileIcon(fileName.split('.').pop())
              )
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${
              error ? 'text-red-800' : (uploadSuccess ? 'text-green-800' : 'text-gray-800')
            }`}>
              {fileName}
            </p>
            {error && <p className="text-sm text-red-700 mt-1">{error}</p>}
            {uploadSuccess && <p className="text-sm text-green-700 mt-1">File uploaded successfully!</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;