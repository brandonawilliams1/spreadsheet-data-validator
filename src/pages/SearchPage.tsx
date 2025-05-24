import React from 'react';
import SearchBox from '../components/SearchBox';
import BarcodeScanner from '../components/BarcodeScanner';
import SearchResults from '../components/SearchResults';
import FileList from '../components/FileList';
import { useApp } from '../context/AppContext';
import { Upload, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const SearchPage = () => {
  const { files, searchQuery, searchResults } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Search Data
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Search through your spreadsheet data using text or barcode scanning
          </p>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100">
            <Upload className="h-6 w-6 text-teal-600" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">No spreadsheets yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            You need to upload at least one spreadsheet file before you can search.
          </p>
          <div className="mt-4">
            <Link
              to="/files"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Upload a file
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 shadow rounded-lg">
              <div className="mb-6">
                <SearchBox />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <BarcodeScanner />
                </div>
                
                <div className="text-sm text-gray-500">
                  {searchResults.length > 0 && searchQuery && (
                    <span>Found {searchResults.length} results for "{searchQuery}"</span>
                  )}
                </div>
              </div>
            </div>
            
            <SearchResults />
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 shadow rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Your Files</h2>
                <Link
                  to="/files"
                  className="text-sm font-medium text-teal-600 hover:text-teal-500"
                >
                  Manage Files
                </Link>
              </div>
              <FileList />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Search className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Search Tips</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Click a file on the right to search only within that file</li>
                      <li>Use the barcode scanner on mobile devices</li>
                      <li>Search is not case sensitive</li>
                      <li>Search looks for partial matches</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;