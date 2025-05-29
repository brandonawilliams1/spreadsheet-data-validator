import React from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, Search, Upload, Database } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Spreadsheet Data Search & Barcode Scanner
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Upload your spreadsheet or PDF files, then quickly search through them using text or barcode scanning.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link 
            to="/files" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-150"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload Files
          </Link>
          <Link 
            to="/search" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-150"
          >
            <Search className="mr-2 h-5 w-5" />
            Search Data
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-8">
        <FeatureCard 
          icon={<FileSpreadsheet className="h-8 w-8 text-teal-600" />}
          title="Upload Spreadsheets"
          description="Import your PDF CSV or Excel files to make them searchable instantly."
        />
        <FeatureCard 
          icon={<Search className="h-8 w-8 text-teal-600" />}
          title="Search with Text or Barcode"
          description="Type in search terms or use your device camera to scan barcodes."
        />
        <FeatureCard 
          icon={<Database className="h-8 w-8 text-teal-600" />}
          title="Instant Results"
          description="Find exact matches in your data with clear visual indicators."
        />
      </div>
      
      <div className="mt-16 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <ol className="space-y-6">
            <Step 
              number={1} 
              title="Upload Your Spreadsheet or PDF" 
              description="Import PDF CSV or Excel files containing your inventory or product data."
            />
            <Step 
              number={2} 
              title="Choose Search Method" 
              description="Type in your search query or use the barcode scanner feature."
            />
            <Step 
              number={3} 
              title="View Matches" 
              description="See instant results showing matches found in your spreadsheet data."
            />
          </ol>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 p-3 bg-teal-50 rounded-full">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const Step = ({ number, title, description }: { number: number, title: string, description: string }) => {
  return (
    <li className="flex items-start">
      <div className="flex-shrink-0 bg-teal-100 rounded-full p-3 flex items-center justify-center h-10 w-10 text-teal-700 font-bold">
        {number}
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-gray-600">{description}</p>
      </div>
    </li>
  );
};

export default HomePage;