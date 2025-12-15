import React, { useCallback, useState } from 'react';
import { Identity, AnalyzedPhoto } from '../types';
import { analyzeFace } from '../services/geminiService';

interface ScannerProps {
  identities: Identity[];
  onAnalysisComplete: (photo: AnalyzedPhoto) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ identities, onAnalysisComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<{name: string, status: string}[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Add to queue UI
    const newQueueItems = fileArray.map(f => ({ name: f.name, status: 'pending' }));
    setProcessingQueue(prev => [...prev, ...newQueueItems]);

    // Process sequentially (could be parallelized, but sequential allows better error handling/rate limit management for demo)
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) continue;

      setProcessingQueue(prev => prev.map(item => item.name === file.name ? { ...item, status: 'processing' } : item));

      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        const base64Image = await base64Promise;

        const result = await analyzeFace(base64Image, identities);

        const analyzedPhoto: AnalyzedPhoto = {
          id: crypto.randomUUID(),
          url: base64Image,
          matchedIdentityId: result.matchedIdentityId,
          confidence: result.confidence,
          timestamp: Date.now(),
          status: 'analyzed'
        };

        onAnalysisComplete(analyzedPhoto);
        setProcessingQueue(prev => prev.filter(item => item.name !== file.name)); // Remove from queue when done

      } catch (error) {
        console.error("Error processing file", file.name, error);
        setProcessingQueue(prev => prev.map(item => item.name === file.name ? { ...item, status: 'error' } : item));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div 
        className={`
          relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
          ${isDragging 
            ? 'border-orange-500 bg-orange-500/10 scale-[1.02]' 
            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="pointer-events-none">
          <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto mb-6 flex items-center justify-center text-orange-500 shadow-lg shadow-orange-900/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Drag & Drop Photos Here
          </h3>
          <p className="text-slate-400 mb-6">
            Upload selfies or group photos. We'll identify the people.
          </p>
        </div>
        
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          id="photo-upload"
          onChange={handleFileInput} 
        />
        <label 
          htmlFor="photo-upload"
          className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-lg font-medium cursor-pointer transition-colors shadow-lg shadow-orange-600/20"
        >
          Select Files
        </label>
      </div>

      {/* Processing Queue Status */}
      {processingQueue.length > 0 && (
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Processing Queue</h4>
          <div className="space-y-3">
            {processingQueue.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-slate-400 truncate max-w-[200px]">{item.name}</span>
                <div className="flex items-center gap-2">
                  {item.status === 'processing' && (
                     <>
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                        <span className="text-orange-500">Analyzing with Gemini...</span>
                     </>
                  )}
                  {item.status === 'pending' && <span className="text-slate-600">Pending</span>}
                  {item.status === 'error' && <span className="text-red-500">Failed</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};