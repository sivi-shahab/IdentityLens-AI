import React, { useMemo, useState } from 'react';
import { Identity, AnalyzedPhoto } from '../types';

interface DashboardProps {
  identities: Identity[];
  photos: AnalyzedPhoto[];
}

export const Dashboard: React.FC<DashboardProps> = ({ identities, photos }) => {
  const [filterId, setFilterId] = useState<string | 'all' | 'unknown'>('all');

  const stats = useMemo(() => {
    const totalPhotos = photos.length;
    const recognized = photos.filter(p => p.matchedIdentityId).length;
    const unknown = totalPhotos - recognized;
    return { totalPhotos, recognized, unknown };
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (filterId === 'all') return photos;
    if (filterId === 'unknown') return photos.filter(p => !p.matchedIdentityId);
    return photos.filter(p => p.matchedIdentityId === filterId);
  }, [photos, filterId]);

  // Chart Data Calculation for the Graphic
  const chartData = useMemo(() => {
    const data = identities.map(id => ({
      label: id.name,
      value: photos.filter(p => p.matchedIdentityId === id.id).length,
      color: 'bg-gradient-to-r from-orange-500 to-amber-500',
      width: 0,
      id: id.id
    }));
    
    // Add Unknown
    data.push({
        label: 'Unknown',
        value: stats.unknown,
        color: 'bg-slate-600',
        width: 0,
        id: 'unknown'
    });

    // Sort by value descending
    data.sort((a, b) => b.value - a.value);

    // Calculate relative width for the bars
    const max = Math.max(...data.map(d => d.value), 1);
    return data.map(d => ({ ...d, width: (d.value / max) * 100 }));
  }, [identities, photos, stats.unknown]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Photos Scanned</p>
          <p className="text-3xl font-bold text-white">{stats.totalPhotos}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-orange-500"></div>
          <p className="text-slate-400 text-sm font-medium mb-1">Recognized Faces</p>
          <p className="text-3xl font-bold text-white">{stats.recognized}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-sm relative overflow-hidden">
           <div className="absolute right-0 top-0 h-full w-2 bg-slate-500"></div>
          <p className="text-slate-400 text-sm font-medium mb-1">Unknown / Unmatched</p>
          <p className="text-3xl font-bold text-white">{stats.unknown}</p>
        </div>
      </div>

      {/* Usage Graphic/Chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
          Scan Activity Frequency
        </h3>
        <div className="space-y-4">
          {chartData.map((item) => (
             <div key={item.id} className="group">
               <div className="flex justify-between text-sm mb-1">
                 <span className="text-slate-300 font-medium">{item.label}</span>
                 <span className="text-slate-400 font-mono">{item.value}</span>
               </div>
               <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out relative`}
                    style={{ width: `${item.width}%` }}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
               </div>
             </div>
          ))}
          {photos.length === 0 && (
              <div className="py-8 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                  No scan data available. Upload photos to see usage statistics.
              </div>
          )}
        </div>
      </div>
        
      {/* Gallery Section */}
      <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
             <h3 className="text-xl font-bold text-white">Gallery</h3>
             
              {/* Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto scrollbar-hide pb-2 sm:pb-0">
                <button
                  onClick={() => setFilterId('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filterId === 'all' 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterId('unknown')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filterId === 'unknown' 
                      ? 'bg-slate-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Unknown ({stats.unknown})
                </button>
                 {identities.map(id => {
                  const count = photos.filter(p => p.matchedIdentityId === id.id).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={id.id}
                      onClick={() => setFilterId(id.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                        filterId === id.id 
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <img src={id.avatarUrl} className="w-4 h-4 rounded-full object-cover" alt="" />
                      {id.name} ({count})
                    </button>
                  );
                })}
              </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPhotos.map((photo) => {
              const matchedIdentity = identities.find(i => i.id === photo.matchedIdentityId);
              
              return (
                <div key={photo.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                  <img src={photo.url} alt="Analyzed" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {matchedIdentity ? (
                      <div className="flex items-center gap-2">
                        <img src={matchedIdentity.avatarUrl} className="w-8 h-8 rounded-full border-2 border-orange-500 object-cover" alt="" />
                        <div>
                          <p className="text-white text-sm font-bold shadow-black drop-shadow-md">{matchedIdentity.name}</p>
                          <p className="text-orange-400 text-xs font-mono">{(photo.confidence * 100).toFixed(0)}% Match</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-500 flex items-center justify-center text-slate-500 text-xs font-bold">?</div>
                        <div>
                          <p className="text-white text-sm font-bold shadow-black drop-shadow-md">Unknown</p>
                          <p className="text-slate-400 text-xs">No match found</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredPhotos.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-500">No photos found for this filter.</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};