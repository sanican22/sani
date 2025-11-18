
import React, { useState, useRef, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { GeneratedVideo } from '../types';
import { Film, Download, Loader2, Clapperboard, Plus, History, StepForward, Wand2, Save } from 'lucide-react';

export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(null);
  const [videoHistory, setVideoHistory] = useState<GeneratedVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExtendMode, setIsExtendMode] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // If extending, we pass the current video's asset
      const previousAsset = isExtendMode && currentVideo ? currentVideo.asset : undefined;
      
      const result = await generateVideo(prompt, previousAsset);
      
      const newVideo: GeneratedVideo = {
        url: result.url,
        prompt: prompt,
        createdAt: Date.now(),
        asset: result.asset
      };

      setCurrentVideo(newVideo);
      setVideoHistory(prev => [newVideo, ...prev]);
      
      // Reset extend mode after generation
      if (isExtendMode) {
        setIsExtendMode(false);
        setPrompt('');
      }

    } catch (err: any) {
      setError("Video oluşturulamadı. Veo sunucuları yoğun olabilir. Lütfen bekleyip tekrar deneyin.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHistoryClick = (video: GeneratedVideo) => {
    setCurrentVideo(video);
    setIsExtendMode(false);
  };

  const toggleExtendMode = () => {
    if (!currentVideo) return;
    setIsExtendMode(!isExtendMode);
    if (!isExtendMode) {
      setPrompt("Kamera yavaşça uzaklaşır ve sahnede...");
    } else {
      setPrompt("");
    }
  };

  const handleDownload = (e: React.MouseEvent, video: GeneratedVideo) => {
    e.stopPropagation(); // Prevent triggering history click
    const link = document.createElement('a');
    link.href = video.url;
    link.download = `skran-veo-scene-${video.createdAt}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Toolbar / Header */}
      <div className="px-8 py-6 border-b border-slate-900 bg-slate-950 flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
               <Film className="text-red-500" /> Veo Sonsuz Stüdyo
            </h1>
            <p className="text-xs text-slate-500">Google Veo 3.1 • 1080p Sinematik Render</p>
         </div>
         <div className="flex gap-2">
            <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 font-mono">
              {isExtendMode ? 'MOD: UZATMA (EXTEND)' : 'MOD: YENİ SAHNE'}
            </div>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Stage */}
        <div className="flex-1 flex flex-col p-6 relative">
            
            {/* Preview Area */}
            <div className="flex-1 bg-black rounded-2xl border border-slate-800 relative overflow-hidden shadow-2xl flex items-center justify-center group">
               {currentVideo ? (
                 <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                    <video 
                      ref={videoRef}
                      src={currentVideo.url} 
                      controls 
                      autoPlay 
                      loop
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Overlay Controls */}
                    <div className="absolute bottom-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={toggleExtendMode}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all
                          ${isExtendMode 
                            ? 'bg-indigo-600 text-white ring-2 ring-white' 
                            : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'}`}
                      >
                         <StepForward size={16} />
                         {isExtendMode ? 'Uzatma Modu Aktif' : 'Videoyu Uzat'}
                      </button>
                      <button 
                        onClick={(e) => handleDownload(e, currentVideo)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-bold shadow-xl transition-colors flex items-center gap-2"
                      >
                        <Download size={18} /> İndir
                      </button>
                    </div>
                 </div>
               ) : (
                 <div className="text-center p-10">
                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
                      <Clapperboard size={40} className="text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-300 mb-2">Sahne Boş</h3>
                    <p className="text-slate-500">Aşağıdaki panelden ilk sahnenizi oluşturun.</p>
                 </div>
               )}

               {isGenerating && (
                 <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                    <div className="relative w-32 h-32 mb-8">
                       <div className="absolute inset-0 border-t-4 border-red-600 rounded-full animate-spin"></div>
                       <div className="absolute inset-4 border-t-4 border-orange-500 rounded-full animate-spin animation-delay-200"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {isExtendMode ? 'Sahne Uzatılıyor...' : 'Sahne Oluşturuluyor...'}
                    </h2>
                    <p className="text-slate-400 text-sm animate-pulse">Pikseller işleniyor • Veo Engine</p>
                 </div>
               )}
            </div>

            {/* Prompt Bar */}
            <div className="mt-6 relative z-10">
               {isExtendMode && (
                 <div className="absolute -top-8 left-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded-t-lg font-bold flex items-center gap-2">
                   <Wand2 size={12} /> Önceki sahneye devam ediliyor
                 </div>
               )}
               <div className={`bg-slate-900 p-2 rounded-2xl border flex gap-2 shadow-xl transition-colors ${isExtendMode ? 'border-indigo-500 ring-1 ring-indigo-500/50' : 'border-slate-800'}`}>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={isExtendMode ? "Sonra ne oluyor? (Örn: Karakter aniden arkasını döner...)" : "Yeni sahne tarifi... (Örn: Siberpunk sokakta yağmur...)"}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 px-4 text-sm md:text-base"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className={`px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                      ${isExtendMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'}`}
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : isExtendMode ? <StepForward size={20} /> : <Clapperboard size={20} />}
                    {isGenerating ? 'İşleniyor' : isExtendMode ? 'Devam Et' : 'Motor!'}
                  </button>
               </div>
               {error && <p className="text-red-400 text-xs mt-2 ml-2">{error}</p>}
            </div>
        </div>

        {/* History / Timeline Sidebar */}
        <div className="w-64 border-l border-slate-900 bg-slate-950 flex flex-col">
           <div className="p-4 border-b border-slate-900">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                 <History size={14} /> Timeline
              </h3>
           </div>
           <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {videoHistory.map((video, idx) => (
                <div 
                  key={video.createdAt}
                  onClick={() => handleHistoryClick(video)}
                  className={`group cursor-pointer rounded-xl border p-2 transition-all relative overflow-hidden
                    ${currentVideo?.createdAt === video.createdAt ? 'bg-slate-900 border-red-500/50' : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'}`}
                >
                   <div className="aspect-video bg-black rounded-lg mb-2 relative overflow-hidden group-hover:ring-1 ring-white/20">
                      <video src={video.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Film size={14} className="text-white" />
                         </div>
                      </div>
                      {/* Mini Download Button for History Items */}
                      <button 
                         onClick={(e) => handleDownload(e, video)}
                         className="absolute bottom-1 right-1 w-6 h-6 bg-black/60 hover:bg-indigo-600 text-white rounded-md flex items-center justify-center transition-colors pointer-events-auto opacity-0 group-hover:opacity-100"
                         title="Bu klibi indir"
                      >
                        <Download size={12} />
                      </button>
                   </div>
                   <p className="text-xs text-slate-400 line-clamp-2 mb-1">{video.prompt}</p>
                   <span className="text-[10px] text-slate-600">
                      {new Date(video.createdAt).toLocaleTimeString()}
                   </span>
                </div>
              ))}
              
              {videoHistory.length === 0 && (
                <div className="text-center py-10 px-4">
                   <div className="w-12 h-12 border-2 border-dashed border-slate-800 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <Plus size={20} className="text-slate-600" />
                   </div>
                   <p className="text-xs text-slate-500">Oluşturulan klipler burada görünecek.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
