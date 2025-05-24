import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, ArrowUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SearchBox = () => {
  const { searchData, searchQuery, setSearchQuery, searchHistory } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Update input value when searchQuery changes externally (e.g., from barcode scanner)
  useEffect(() => {
    if (searchQuery && searchQuery !== inputValue) {
      setInputValue(searchQuery);
    }
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchData(inputValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const clearInput = () => {
    setInputValue('');
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const selectHistoryItem = (query: string) => {
    setInputValue(query);
    searchData(query);
    setIsHistoryOpen(false);
  };

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        historyRef.current && 
        !historyRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsHistoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onClick={() => searchHistory.length > 0 && setIsHistoryOpen(true)}
            placeholder="Search spreadsheet data..."
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
          />
          
          {inputValue && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute inset-y-0 right-10 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          
          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-teal-600"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </form>
      
      {isHistoryOpen && searchHistory.length > 0 && (
        <div 
          ref={historyRef}
          className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg py-1 border border-gray-200 max-h-60 overflow-auto"
        >
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
            Recent Searches
          </div>
          
          {searchHistory.map((item, index) => (
            <button
              key={index}
              onClick={() => selectHistoryItem(item)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;