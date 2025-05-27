import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseSpreadsheet } from '../utils/fileParser';

export interface SpreadsheetFile {
  id: string;
  name: string;
  dateUploaded: Date;
  data: any[];
  headers: string[];
  extension: string;
}

export interface SearchResult {
  file: SpreadsheetFile;
  row: any;
  rowIndex: number;
  matchedColumn: string;
}

export interface SearchLog {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  files: string[];
}

interface AppContextType {
  files: SpreadsheetFile[];
  addFile: (file: File) => Promise<void>;
  removeFile: (fileId: string) => void;
  searchResults: SearchResult[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  error: string | null;
  searchData: (query: string) => void;
  clearSearchResults: () => void;
  activeFile: SpreadsheetFile | null;
  setActiveFile: (file: SpreadsheetFile | null) => void;
  searchHistory: string[];
  searchLogs: SearchLog[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<SpreadsheetFile[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<SpreadsheetFile | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);

  // Load data from localStorage on initial load
  useEffect(() => {
    const storedFiles = localStorage.getItem('spreadsheetFiles');
    const storedHistory = localStorage.getItem('searchHistory');
    const storedLogs = localStorage.getItem('searchLogs');

    if (storedFiles) {
      try {
        const parsedFiles = JSON.parse(storedFiles);
        const filesWithDates = parsedFiles.map((file: any) => ({
          ...file,
          dateUploaded: new Date(file.dateUploaded)
        }));
        setFiles(filesWithDates);
      } catch (error) {
        console.error('Failed to parse stored files:', error);
      }
    }
    
    if (storedHistory) {
      try {
        setSearchHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }

    if (storedLogs) {
      try {
        const parsedLogs = JSON.parse(storedLogs);
        const logsWithDates = parsedLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        setSearchLogs(logsWithDates);
      } catch (error) {
        console.error('Failed to parse search logs:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('spreadsheetFiles', JSON.stringify(files));
  }, [files]);
  
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('searchLogs', JSON.stringify(searchLogs));
  }, [searchLogs]);

  const addFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await parseSpreadsheet(file);
      
      if (!result.data || !result.headers) {
        throw new Error('Failed to parse file: Invalid data structure');
      }
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      
      const newFile: SpreadsheetFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        dateUploaded: new Date(),
        data: result.data,
        headers: result.headers,
        extension: fileExtension
      };

      setFiles(prevFiles => [...prevFiles, newFile]);
      
      if (files.length === 0) {
        setActiveFile(newFile);
      }
      
      setIsLoading(false);
      return Promise.resolve();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse file';
      setError(errorMessage);
      setIsLoading(false);
      return Promise.reject(errorMessage);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    
    if (activeFile && activeFile.id === fileId) {
      setActiveFile(null);
    }
    
    setSearchResults(prevResults => 
      prevResults.filter(result => result.file.id !== fileId)
    );
  };

  const searchData = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    setSearchQuery(query);
    
    if (!searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev].slice(0, 10));
    }

    try {
      const results: SearchResult[] = [];
      const filesToSearch = activeFile ? [activeFile] : files;
      
      filesToSearch.forEach(file => {
        file.data.forEach((row, rowIndex) => {
          for (const header of file.headers) {
            const cellValue = row[header];
            
            if (cellValue == null) continue;
            
            const stringValue = String(cellValue).toLowerCase();
            
            if (stringValue.includes(query.toLowerCase())) {
              results.push({
                file,
                row,
                rowIndex,
                matchedColumn: header
              });
              break;
            }
          }
        });
      });
      
      setSearchResults(results);

      // Add search log
      const newLog: SearchLog = {
        id: `search-${Date.now()}`,
        query,
        timestamp: new Date(),
        resultCount: results.length,
        files: filesToSearch.map(f => f.name)
      };
      
      setSearchLogs(prev => [newLog, ...prev]);
    } catch (err) {
      setError('Error searching data');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearchResults = () => {
    setSearchResults([]);
    setSearchQuery('');
  };

  const value = {
    files,
    addFile,
    removeFile,
    searchResults,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    searchData,
    clearSearchResults,
    activeFile,
    setActiveFile,
    searchHistory,
    searchLogs
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};