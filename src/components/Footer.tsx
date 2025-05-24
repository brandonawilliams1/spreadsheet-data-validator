import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            © {currentYear} DataScan. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors duration-150">
              Privacy
            </a>
            <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors duration-150">
              Terms
            </a>
            <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors duration-150">
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;