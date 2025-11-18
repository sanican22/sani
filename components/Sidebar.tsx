import React from 'react';
import { AppMode } from '../types';
import { MessageSquareText, Sparkles, Volume2, BrainCircuit, Settings, LogOut, Film } from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const navItems = [
    { mode: AppMode.CHAT, label: 'Akıllı Sohbet', icon: <MessageSquareText size={20} />, desc: 'Multi-Model' },
    { mode: AppMode.IMAGE, label: 'Görsel Üretim', icon: <Sparkles size={20} />, desc: 'Imagen 4' },
    { mode: AppMode.VIDEO, label: 'Video Stüdyosu', icon: <Film size={20} />, desc: 'Veo 3.1' },
    { mode: AppMode.AUDIO, label: 'Ses Stüdyosu', icon: <Volume2 size={20} />, desc: 'TTS' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-slate-950 border-r border-slate-800 absolute left-0 top-0 z-40">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-indigo-500">
          <BrainCircuit className="w-7 h-7" />
          <span className="font-bold text-2xl text-white tracking-tight">SKRAN</span>
        </div>
      </div>

      <div className="flex-1 py-6 px-3 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase px-3 mb-2 tracking-wider">
          Yapay Zeka
        </div>
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => setMode(item.mode)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left
              ${currentMode === item.mode 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
          >
            <div className={`${currentMode === item.mode ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}>
              {item.icon}
            </div>
            <div>
              <div className="font-medium text-sm">{item.label}</div>
              <div className={`text-[10px] ${currentMode === item.mode ? 'text-indigo-200' : 'text-slate-600'}`}>
                {item.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-2 w-full text-slate-400 hover:text-white transition-colors text-sm">
          <Settings size={18} />
          <span>Ayarlar</span>
        </button>
        <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
            SK
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-200">Pro Üye</div>
            <div className="text-xs text-slate-500">skran@ai.com</div>
          </div>
          <LogOut size={16} className="text-slate-600 cursor-pointer hover:text-red-400" />
        </div>
      </div>
    </aside>
  );
};