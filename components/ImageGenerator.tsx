
import React, { useState } from 'react';
import { generateImage, generateResponse } from '../services/geminiService';
import { GeneratedImage } from '../types';
import { Wand2, Download, Loader2, Sparkles, Square, RectangleHorizontal, RectangleVertical, Maximize2 } from 'lucide-react';

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Kare', icon: <Square size={16} /> },
  { id: '16:9', label: 'Yatay', icon: <RectangleHorizontal size={16} /> },
  { id: '9:16', label: 'Dikey', icon: <RectangleVertical size={16} /> },
  { id: '4:3', label: 'Klasik', icon: <Maximize2 size={16} /> },
  { id: '3:4', label: 'Portre', icon: <Maximize2 size={16} className="rotate-90" /> },
];

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Professional Settings
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [useEnhancer, setUseEnhancer] = useState(true);
  const [finalPromptUsed, setFinalPromptUsed] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setFinalPromptUsed('');
    
    try {
      let promptToUse = prompt;

      if (useEnhancer) {
        setStatusText('Sihirli Geliştirici Promptu İyileştiriyor...');
        // Use Gemini 3 Pro to enhance the prompt
        const enhancementPrompt = `
          You are a world-class prompt engineer for high-end AI image generation models like Imagen 3/4 and Midjourney.
          
          Your task: Rewrite the following user description into a highly detailed, photorealistic, and artistic prompt.
          Focus on: Lighting, Composition, Texture, 8K resolution, Cinematic effects, and Color Grading.
          
          Constraint: Output ONLY the enhanced English prompt. Do not add any conversational text.
          
          User Description: "${prompt}"
        `;
        
        const enhanced = await generateResponse(enhancementPrompt, undefined, 'gemini-3-pro-preview');
        if (enhanced && !enhanced.includes("Hata")) {
          promptToUse = enhanced;
        }
      }

      setStatusText('Görsel Oluşturuluyor (Imagen 4)...');
      setFinalPromptUsed(promptToUse);

      const imageUrl = await generateImage(promptToUse, aspectRatio);
      setGeneratedImage({
        url: imageUrl,
        prompt: promptToUse,
        createdAt: Date.now()
      });
    } catch (err: any) {
      setError("Görsel oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsGenerating(false);
      setStatusText('');
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage.url;
      link.download = `skran-art-${generatedImage.createdAt}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-950">
      {/* Header Section */}
      <div className="pt-8 pb-6 px-6 md:px-12 text-center border-b border-slate-900 bg-gradient-to-b from-slate-900 to-slate-950">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight mb-3">
          Profesyonel Görsel Stüdyosu
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          Dünyanın en gelişmiş görsel motoru Imagen 4 ile hayallerinizi sanata dönüştürün.
        </p>
      </div>

      <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Prompt Input */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Görsel Açıklaması
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Örn: Gelecekten bir siberpunk şehir manzarası, neon yağmurları..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none min-h-[120px] text-sm mb-4"
            />
            
            <div className="flex items-center justify-between bg-indigo-900/20 p-3 rounded-xl border border-indigo-500/20 mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${useEnhancer ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  <Sparkles size={14} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${useEnhancer ? 'text-indigo-300' : 'text-slate-400'}`}>Sihirli Geliştirici</span>
                  <span className="text-[10px] text-slate-500">Promptunuzu AI ile profesyonelleştirir</span>
                </div>
              </div>
              <button 
                onClick={() => setUseEnhancer(!useEnhancer)}
                className={`relative w-10 h-6 rounded-full transition-colors ${useEnhancer ? 'bg-indigo-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${useEnhancer ? 'translate-x-4' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
              {isGenerating ? 'İşleniyor...' : 'Oluştur'}
            </button>
          </div>

          {/* Settings */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Boyut Ayarları
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setAspectRatio(ratio.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2
                    ${aspectRatio === ratio.id 
                      ? 'bg-slate-800 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-900/10' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                >
                  {ratio.icon}
                  <span className="text-[10px] font-medium">{ratio.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col items-center justify-center p-6 min-h-[500px] relative overflow-hidden group">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {generatedImage ? (
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                <img 
                  src={generatedImage.url} 
                  alt="Generated" 
                  className="max-h-[600px] w-auto rounded-lg shadow-2xl shadow-black/60 object-contain border border-slate-800/50"
                />
                
                {/* Prominent Download Button */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={handleDownload}
                    className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold shadow-xl hover:bg-indigo-50 transition-colors flex items-center gap-2"
                  >
                    <Download size={18} /> İndir
                  </button>
                </div>

                {/* Info Overlay */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl max-w-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Prompt</div>
                  <p className="text-xs text-slate-200 line-clamp-3">
                    {finalPromptUsed || prompt}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center z-10">
                 {isGenerating ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-t-4 border-purple-500 rounded-full animate-spin animation-delay-200"></div>
                        <div className="absolute inset-4 border-t-4 border-pink-500 rounded-full animate-spin animation-delay-500"></div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{statusText}</h3>
                      <p className="text-slate-400 text-sm">SKRAN Sanat Motoru çalışıyor...</p>
                    </div>
                 ) : (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-indigo-500/30">
                        <Sparkles size={40} className="text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Sanatınızı Yaratın</h3>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        Sol taraftaki panelden detayları girin ve yapay zekanın büyüleyici görseller oluşturmasını izleyin.
                      </p>
                    </>
                 )}
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
