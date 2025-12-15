import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { IdentityManager } from './components/IdentityManager';
import { Scanner } from './components/Scanner';
import { Dashboard } from './components/Dashboard';
import { Identity, AnalyzedPhoto, ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [analyzedPhotos, setAnalyzedPhotos] = useState<AnalyzedPhoto[]>([]);

  // Load sample data if empty (Simulated persistence could go here)
  useEffect(() => {
    // For demo purposes, we start clean or could load from localStorage
  }, []);

  const handleAddIdentity = (name: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newIdentity: Identity = {
        id: crypto.randomUUID(),
        name,
        avatarUrl: e.target?.result as string,
        createdAt: Date.now(),
      };
      setIdentities(prev => [...prev, newIdentity]);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteIdentity = (id: string) => {
    setIdentities(prev => prev.filter(i => i.id !== id));
  };

  const handleAnalysisComplete = (photo: AnalyzedPhoto) => {
    setAnalyzedPhotos(prev => [photo, ...prev]);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="flex-1 ml-64 min-h-screen relative">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-lg font-medium text-white capitalize">{currentView}</h2>
          <div className="flex items-center gap-4">
             <div className="text-xs text-slate-500">Gemini 2.5 Flash Powered</div>
          </div>
        </header>

        <div className="animate-in fade-in duration-500">
          {currentView === 'identities' && (
            <IdentityManager 
              identities={identities} 
              onAddIdentity={handleAddIdentity}
              onDeleteIdentity={handleDeleteIdentity}
            />
          )}

          {currentView === 'scan' && (
            <div className="p-8">
               <h2 className="text-3xl font-bold text-white mb-2">Scan & Recognize</h2>
               <p className="text-slate-400 mb-8">Upload photos to automatically tag them with your registered identities.</p>
               
               {identities.length === 0 ? (
                 <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg text-orange-200 mb-6">
                   ⚠️ You haven't added any identities yet. Recognition will return "Unknown" for everyone. 
                   <button onClick={() => setCurrentView('identities')} className="underline ml-2 font-bold">Go add some!</button>
                 </div>
               ) : null}

               <Scanner 
                 identities={identities} 
                 onAnalysisComplete={(photo) => {
                   handleAnalysisComplete(photo);
                   // Optionally switch to dashboard after batch, but for now we keep them here to scan more
                 }} 
               />
               
               {analyzedPhotos.length > 0 && (
                 <div className="mt-12 border-t border-slate-800 pt-8">
                   <h3 className="text-xl font-bold mb-6">Recent Scans</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {analyzedPhotos.slice(0, 6).map(photo => (
                        <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-800">
                           <img src={photo.url} className="w-full h-full object-cover opacity-60" alt="" />
                           <div className="absolute inset-0 flex items-center justify-center">
                             {photo.matchedIdentityId ? (
                               <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">Match</span>
                             ) : (
                               <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">Unknown</span>
                             )}
                           </div>
                        </div>
                      ))}
                   </div>
                 </div>
               )}
            </div>
          )}

          {currentView === 'dashboard' && (
            <Dashboard identities={identities} photos={analyzedPhotos} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;