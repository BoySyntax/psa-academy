import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Download, Eye, EyeOff } from "lucide-react";

interface OptimizedPdfViewerProps {
  src: string;
  className?: string;
  width?: number;
  height?: number;
  showControls?: boolean;
}

const OptimizedPdfViewer = ({ 
  src, 
  className = "", 
  width = 800,
  height = 600,
  showControls = true 
}: OptimizedPdfViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Preload PDF metadata
  useEffect(() => {
    if (!src) return;

    // Create a temporary iframe to check PDF availability
    const tempIframe = document.createElement('iframe');
    tempIframe.style.display = 'none';
    tempIframe.src = src;
    
    tempIframe.onload = () => {
      setIsLoading(false);
      setError(false);
      document.body.removeChild(tempIframe);
    };
    
    tempIframe.onerror = () => {
      setError(true);
      setIsLoading(false);
      if (document.body.contains(tempIframe)) {
        document.body.removeChild(tempIframe);
      }
    };

    // Set timeout for slow loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError(false); // Still show PDF even if slow
      }
    }, 5000);

    document.body.appendChild(tempIframe);

    return () => {
      clearTimeout(timeout);
      if (document.body.contains(tempIframe)) {
        document.body.removeChild(tempIframe);
      }
    };
  }, [src, isLoading]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = src.split('/').pop() || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTogglePreview = () => {
    setIsPreview(!isPreview);
  };

  if (error) {
    return (
      <div className={`border rounded-lg bg-gray-50 dark:bg-gray-800 p-8 text-center ${className}`}>
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 mb-2">Failed to load PDF</p>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4 mr-2 inline" />
          Download PDF
        </button>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-900 ${className}`}>
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between p-3 border-b bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePreview}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title={isPreview ? "Show full PDF" : "Show preview"}
            >
              {isPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isPreview ? "Preview" : "Full PDF"}
            </span>
          </div>
          
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PDF Viewer */}
      <div 
        className="relative bg-gray-100 dark:bg-gray-800"
        style={{ width, height }}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading PDF...</p>
            </div>
          </div>
        )}

        {/* PDF iframe */}
        <motion.iframe
          ref={iframeRef}
          src={`${src}#toolbar=${isPreview ? '0' : '1'}&navpanes=${isPreview ? '0' : '1'}&scrollbar=${isPreview ? '0' : '1'}`}
          width={width}
          height={height}
          className="w-full h-full border-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
        />
      </div>

      {/* Info bar */}
      {!isLoading && !error && (
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-t text-xs text-gray-500">
          PDF viewer • {isPreview ? "Preview mode" : "Full view"}
        </div>
      )}
    </div>
  );
};

export default OptimizedPdfViewer;
