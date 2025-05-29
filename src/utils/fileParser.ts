import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

interface ParseResult {
  data: any[];
  headers: string[];
}

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const parseSpreadsheet = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        if (!e.target?.result) {
          throw new Error('Failed to read file');
        }
        
        const data = e.target.result;
        const extension = file.name.split('.').pop()?.toLowerCase();
        
        let parsedData: ParseResult;
        
        switch (extension) {
          case 'csv':
            parsedData = parseCSV(data as string);
            break;
          case 'xlsx':
          case 'xls':
            parsedData = parseExcel(data);
            break;
          case 'pdf':
            parsedData = await parsePDF(data);
            break;
          default:
            throw new Error('Unsupported file format. Please upload CSV, Excel, or PDF files.');
        }
        
        resolve(parsedData);
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
    } else if (extension === 'pdf') {
      reader.readAsArrayBuffer(file);
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

const parsePDF = async (data: string | ArrayBuffer): Promise<ParseResult> => {
  // Load the PDF document
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const numPages = pdf.numPages;
  
  // Extract text from all pages
  const textContent: string[] = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ')
      .trim();
    textContent.push(pageText);
  }
  
  // Convert text content to structured data
  const headers = ['Page', 'Content'];
  const data = textContent.map((content, index) => ({
    A: `Page ${index + 1}`,
    B: content
  }));
  
  return {
    data,
    headers: ['A', 'B']
  };
};