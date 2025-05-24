import * as XLSX from 'xlsx';

interface ParseResult {
  data: any[];
  headers: string[];
}

export const parseSpreadsheet = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          throw new Error('Failed to read file');
        }
        
        const data = e.target.result;
        const extension = file.name.split('.').pop()?.toLowerCase();
        
        if (extension === 'csv') {
          // Handle CSV
          const parsedData = parseCSV(data as string);
          resolve(parsedData);
        } else if (extension === 'xlsx' || extension === 'xls') {
          // Handle Excel
          const parsedData = parseExcel(data);
          resolve(parsedData);
        } else {
          reject(new Error('Unsupported file format. Please upload CSV or Excel files.'));
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    // Read file based on type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

const parseCSV = (csvData: string): ParseResult => {
  const lines = csvData.split('\n');
  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }
  
  // Generate column headers (A, B, C, etc.)
  const maxColumns = Math.max(...lines.map(line => line.split(',').length));
  const headers = Array.from({ length: maxColumns }, (_, i) => 
    String.fromCharCode(65 + i) // A = 65 in ASCII
  );
  
  const data = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    const row: Record<string, string> = {};
    
    values.forEach((value, index) => {
      if (index < headers.length) {
        row[headers[index]] = value.trim();
      }
    });
    
    data.push(row);
  }
  
  return { data, headers };
};

const parseExcel = (data: string | ArrayBuffer): ParseResult => {
  const workbook = XLSX.read(data, { type: 'array' });
  
  // Get the first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Get the range
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  // Generate column headers (A, B, C, etc.)
  const headers = Array.from({ length: range.e.c + 1 }, (_, i) => 
    String.fromCharCode(65 + i) // A = 65 in ASCII
  );
  
  // Convert all cells to array of arrays
  const rawData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    defval: '' // Default empty value for missing cells
  });
  
  // Convert to our data format
  const formattedData = rawData.map(row => {
    const obj: Record<string, any> = {};
    (row as any[]).forEach((cell, index) => {
      if (index < headers.length) {
        obj[headers[index]] = cell;
      }
    });
    return obj;
  });
  
  return { data: formattedData, headers };
};