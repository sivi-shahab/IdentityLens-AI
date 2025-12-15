import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { IdentityManager } from './components/IdentityManager';
import { Scanner } from './components/Scanner';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { Identity, AnalyzedPhoto, ViewState } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [analyzedPhotos, setAnalyzedPhotos] = useState<AnalyzedPhoto[]>([]);

  // Check for existing session
  useEffect(() => {
    const storedAuth = localStorage.getItem('identityLens_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('identityLens_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('identityLens_auth');
    setCurrentView('dashboard');
  };

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

  // Render Login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Authenticated View
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 ml-64 min-h-screen relative">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-lg font-medium text-white capitalize">{currentView}</h2>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <div className="text-xs text-orange-200 font-medium">Gemini 2.5 Flash Connected</div>
             </div>
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
                 <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg text-orange-200 mb-6 flex items-start gap-3">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                   <div>
                      You haven't added any identities yet. Recognition will return "Unknown" for everyone. 
                      <button onClick={() => setCurrentView('identities')} className="underline ml-2 font-bold hover:text-orange-100">Go add some!</button>
                   </div>
                 </div>
               ) : null}

               <Scanner 
                 identities={identities} 
                 onAnalysisComplete={(photo) => {
                   handleAnalysisComplete(photo);
                 }} 
               />
               
               {analyzedPhotos.length > 0 && (
                 <div className="mt-12 border-t border-slate-800 pt-8">
                   <h3 className="text-xl font-bold mb-6">Recent Scans</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {analyzedPhotos.slice(0, 6).map(photo => (
                        <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                           <img src={photo.url} className="w-full h-full object-cover opacity-60" alt="" />
                           <div className="absolute inset-0 flex items-center justify-center">
                             {photo.matchedIdentityId ? (
                               <span className="bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">Match</span>
                             ) : (
                               <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full border border-slate-600">Unknown</span>
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