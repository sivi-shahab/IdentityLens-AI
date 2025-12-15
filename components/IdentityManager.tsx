import React, { useState, useRef } from 'react';
import { Identity } from '../types';

interface IdentityManagerProps {
  identities: Identity[];
  onAddIdentity: (name: string, file: File) => void;
  onDeleteIdentity: (id: string) => void;
}

export const IdentityManager: React.FC<IdentityManagerProps> = ({
  identities,
  onAddIdentity,
  onDeleteIdentity,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && selectedFile) {
      onAddIdentity(newName, selectedFile);
      setNewName('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsAdding(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Identity Database</h2>
          <p className="text-slate-400">Manage registered faces for recognition.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-lg transition-all font-medium flex items-center gap-2 shadow-lg shadow-orange-900/20"
        >
          {isAdding ? 'Cancel' : '+ Add New Identity'}
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 p-6 bg-slate-800/50 border border-slate-700 rounded-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-semibold text-white mb-4">Register New Identity</h3>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-start">
            <div 
              className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-orange-500/30 transition-all border-2 border-dashed border-slate-500 hover:border-orange-400 relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 text-xs text-center p-2">Click to upload avatar</span>
              )}
              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                <span className="text-white text-xs">Change</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={!newName || !selectedFile}
                className="px-6 py-2 bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors"
              >
                Save Identity
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {identities.length === 0 && !isAdding && (
           <div className="col-span-full py-20 text-center border border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
             <p className="text-slate-400 text-lg">No identities registered yet.</p>
             <p className="text-slate-600 text-sm mt-2">Add a person to start recognizing them in photos.</p>
           </div>
        )}
        
        {identities.map((identity) => (
          <div key={identity.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-orange-900/10 transition-all group">
            <div className="aspect-square w-full relative">
               <img src={identity.avatarUrl} alt={identity.name} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                  <button 
                    onClick={() => onDeleteIdentity(identity.id)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    Remove
                  </button>
               </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white">{identity.name}</h3>
              <p className="text-xs text-slate-500">ID: {identity.id.slice(0, 8)}...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};