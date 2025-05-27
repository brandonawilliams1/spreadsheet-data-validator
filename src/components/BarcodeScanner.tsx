import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const BarcodeScanner = () => {
  const { searchData } = useApp();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lastDetection, setLastDetection] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!isScannerOpen) return;
    
    let stream: MediaStream | null = null;
    let animationFrameId: number;
    
    const startCamera = async () => {
      try {
        // Check if video element exists
        if (!videoRef.current) {
          throw new Error('Video element not found');
        }

        // Check if stream is already active
        if (videoRef.current.srcObject) {
          const currentStream = videoRef.current.srcObject as MediaStream;
          currentStream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }

        // First check if the API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported in this browser');
        }

        // Request camera access with specific constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be loaded before playing
          videoRef.current.onloadedmetadata = async () => {
            try {
              if (videoRef.current) {
                await videoRef.current.play();
                setIsCameraAvailable(true);
                setErrorMessage('');
                setIsScanning(true);
                // Start scanning for barcodes
                animationFrameId = requestAnimationFrame(scanBarcode);
              }
            } catch (playError) {
              console.error('Error playing video:', playError);
              throw new Error('Failed to start video playback');
            }
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setIsCameraAvailable(false);
        
        // Provide specific error messages based on the error
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setErrorMessage('Camera access was denied. Please allow camera access in your browser settings and try again.');
          } else if (err.name === 'NotFoundError') {
            setErrorMessage('No camera found. Please ensure your device has a working camera and try again.');
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            setErrorMessage('Your camera is in use by another application. Please close other applications using the camera and try again.');
          } else if (err.message === 'Camera API not supported in this browser') {
            setErrorMessage('Your browser does not support camera access. Please try using a modern browser like Chrome, Firefox, or Safari.');
          } else if (err.message === 'Video element not found') {
            setErrorMessage('Camera initialization failed. Please refresh the page and try again.');
          } else if (err.message === 'Failed to start video playback') {
            setErrorMessage('Failed to start the camera. Please check your camera settings and try again.');
          } else {
            setErrorMessage('Could not access camera. Please check your camera connection and browser settings.');
          }
        } else {
          setErrorMessage('An unexpected error occurred while accessing the camera.');
        }
      }
    };
    
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setIsScanning(false);
    };
  }, [isScannerOpen]);
  
  // Mock barcode scanning function
  // In a real implementation, you would use a barcode scanning library
  const scanBarcode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Draw video frame to canvas
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // In a real implementation, you would process the canvas image
        // to detect barcodes using a library like zbar.wasm, QuaggaJS, etc.
        
        // For this demo, let's simulate barcode detection randomly
        if (Math.random() < 0.005) { // 0.5% chance per frame to detect a barcode
          const mockBarcodes = ['1234567890', 'ABC123456', 'PROD987654', 'ITEM-54321'];
          const detectedBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
          
          // If this is a new barcode, use it
          if (detectedBarcode !== lastDetection) {
            setLastDetection(detectedBarcode);
            searchData(detectedBarcode);
            closeScannerAfterDelay();
            return; // Stop scanning after detection
          }
        }
      }
    }
    
    // Continue scanning
    requestAnimationFrame(scanBarcode);
  };
  
  const toggleScanner = () => {
    setIsScannerOpen(!isScannerOpen);
    if (!isScannerOpen) {
      setErrorMessage(''); // Clear any previous error messages when opening
    }
  };
  
  const closeScanner = () => {
    setIsScannerOpen(false);
    setErrorMessage(''); // Clear error message when closing
  };
  
  const closeScannerAfterDelay = () => {
    setTimeout(() => {
      setIsScannerOpen(false);
      setErrorMessage(''); // Clear error message when auto-closing
    }, 2000);
  };

  const renderErrorMessage = () => (
    <div className="bg-red-50 p-4 rounded-md flex items-start">
      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
      <div>
        <p className="text-red-700">{errorMessage}</p>
        <p className="mt-2 text-sm text-red-600">
          If the problem persists, try the following:
          <ul className="list-disc ml-5 mt-1">
            <li>Check if your camera is properly connected</li>
            <li>Allow camera access in your browser settings</li>
            <li>Close other applications that might be using the camera</li>
            <li>Refresh the page and try again</li>
          </ul>
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <button
        type="button"
        onClick={toggleScanner}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
      >
        <Camera className="mr-2 h-4 w-4" />
        Scan Barcode
      </button>
      
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-md w-full">
            <div className="p-4 bg-teal-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-medium">Barcode Scanner</h3>
              <button 
                onClick={closeScanner}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4">
              {isCameraAvailable ? (
                <div className="relative bg-black aspect-[4/3] rounded-md overflow-hidden">
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                  ></video>
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover opacity-0"
                  ></canvas>
                  
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4/5 h-1/3 border-2 border-teal-400 rounded-md">
                      <div className="absolute top-0 left-0 w-full animate-scan bg-teal-400 opacity-30 h-0.5"></div>
                    </div>
                  </div>
                  
                  {/* Last detection display */}
                  {lastDetection && (
                    <div className="absolute bottom-4 left-0 right-0 mx-auto bg-teal-600 text-white py-2 px-4 rounded-md max-w-[80%] text-center">
                      <p className="text-sm font-medium">Detected: {lastDetection}</p>
                    </div>
                  )}
                </div>
              ) : (
                errorMessage && renderErrorMessage()
              )}
              
              {isCameraAvailable && (
                <p className="mt-4 text-sm text-gray-600">
                  Position the barcode within the scanning area.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;