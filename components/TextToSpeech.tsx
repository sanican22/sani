import React, { useState, useRef } from 'react';
import { generateSpeech } from '../services/geminiService';
import { VoiceName } from '../types';
import { Volume2, Play, Pause, Loader2, Mic } from 'lucide-react';

export const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Kore);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    // Stop current audio if exists
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioUrl(null);
    }

    try {
      const arrayBuffer = await generateSpeech(text, selectedVoice);
      const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setIsPlaying(false);
    } catch (error) {
      alert("Ses oluşturulurken bir hata meydana geldi.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => setIsPlaying(false);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Mic className="text-indigo-400" size={24} />
              </div>
              Ses Sentezleme
            </h2>
            <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-400 border border-slate-700">Gemini TTS</span>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Seslendirilmesini istediğiniz metni buraya girin..."
            className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none scrollbar-hide"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Ses Tonu</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(VoiceName).map((voice) => (
                  <button
                    key={voice}
                    onClick={() => setSelectedVoice(voice)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all
                      ${selectedVoice === voice 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                  >
                    {voice}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-end justify-end">
              <button
                onClick={handleGenerate}
                disabled={isLoading || !text.trim()}
                className="w-full md:w-auto px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Volume2 size={20} />}
                Sesi Oluştur
              </button>
            </div>
          </div>
        </div>

        {/* Audio Player Bar */}
        <div className="bg-slate-950 border-t border-slate-800 p-6 flex items-center gap-4">
          <button 
            onClick={togglePlayback}
            disabled={!audioUrl}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
              ${!audioUrl 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-900/20'
              }`}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>

          <div className="flex-1">
            {audioUrl ? (
              <div className="h-12 bg-slate-900 rounded-lg border border-slate-800 flex items-center px-4 relative overflow-hidden">
                {/* Fake Waveform Visualization */}
                <div className="flex items-center gap-1 h-full w-full justify-center opacity-50">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-indigo-400 rounded-full transition-all duration-300"
                      style={{ 
                        height: isPlaying ? `${Math.random() * 100}%` : '20%',
                        animation: isPlaying ? `bounce ${0.5 + Math.random()}s infinite` : 'none'
                      }}
                    />
                  ))}
                </div>
                <audio 
                  ref={audioRef} 
                  src={audioUrl} 
                  onEnded={handleAudioEnded} 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                Ses çıktısı bekleniyor...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};