import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { ImageGenerator } from './components/ImageGenerator';
import { VideoGenerator } from './components/VideoGenerator';
import { TextToSpeech } from './components/TextToSpeech';
import { AppMode } from './types';
import { BrainCircuit, Sparkles, MessageSquareText, Volume2, Film } from 'lucide-react';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.CHAT);

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.CHAT:
        return <ChatInterface />;
      case AppMode.IMAGE:
        return <ImageGenerator />;
      case AppMode.VIDEO:
        return <VideoGenerator />;
      case AppMode.AUDIO:
        return <TextToSpeech />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Mobile Header for very small screens */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 z-50">
        <BrainCircuit className="w-6 h-6 text-indigo-500 mr-2" />
        <span className="font-bold text-xl tracking-tight text-white">SKRAN</span>
      </div>

      <Sidebar currentMode={currentMode} setMode={setCurrentMode} />
      
      <main className="flex-1 flex flex-col relative h-full md:ml-64 pt-16 md:pt-0 transition-all duration-300">
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
          <div className="flex items-center text-sm text-slate-400">
            <span className="flex items-center gap-2">
              {currentMode === AppMode.CHAT && <><MessageSquareText size={18} /> Akıllı Sohbet</>}
              {currentMode === AppMode.IMAGE && <><Sparkles size={18} /> Görsel Stüdyosu (Imagen 4)</>}
              {currentMode === AppMode.VIDEO && <><Film size={18} /> Video Stüdyosu (Veo 3.1)</>}
              {currentMode === AppMode.AUDIO && <><Volume2 size={18} /> Ses Sentezleme</>}
            </span>
          </div>
          <div className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            SKRAN AI Pro v2.0
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;