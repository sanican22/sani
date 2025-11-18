import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { generateResponse } from '../services/geminiService';
import { Send, Image as ImageIcon, Loader2, User, Bot, X, BrainCircuit, ChevronDown, Zap, Sparkles } from 'lucide-react';

const MODELS = [
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', desc: 'En Yüksek Zeka', icon: <BrainCircuit size={14} /> },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Hızlı Yanıt', icon: <Zap size={14} /> },
  { id: 'gemini-3-pro-preview-sim', name: 'GPT-5.1 (Preview)', desc: 'Deneysel Mod', icon: <Sparkles size={14} /> },
];

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      text: 'Merhaba! Ben SKRAN. Profesyonel yapay zeka asistanınım. Gemini 3 Pro veya GPT-5.1 modunu seçerek başlayabilirsin.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [showModelMenu, setShowModelMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
      imageAttachment: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const currentImage = selectedImage; // Capture for api call
    setSelectedImage(null); // Clear UI immediately
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsLoading(true);

    try {
      // Map "GPT-5.1" selection to actual backend model (Gemini 3 Pro)
      const backendModelId = selectedModel.id === 'gemini-3-pro-preview-sim' 
        ? 'gemini-3-pro-preview' 
        : selectedModel.id;

      const responseText = await generateResponse(
        userMessage.text || "Bu görseli analiz et.", 
        currentImage || undefined,
        backendModelId
      );
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      {/* Model Selector Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-center pointer-events-none">
        <div className="relative pointer-events-auto">
          <button 
            onClick={() => setShowModelMenu(!showModelMenu)}
            className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 px-4 py-1.5 rounded-full text-sm text-slate-200 hover:bg-slate-800 transition-all shadow-lg"
          >
            <span className="text-indigo-400">{selectedModel.icon}</span>
            <span className="font-medium">{selectedModel.name}</span>
            <ChevronDown size={14} className={`text-slate-500 transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showModelMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model);
                    setShowModelMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-slate-800 transition-colors
                    ${selectedModel.id === model.id ? 'bg-indigo-900/20' : ''}`}
                >
                  <div className={`p-2 rounded-lg ${selectedModel.id === model.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                    {model.icon}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${selectedModel.id === model.id ? 'text-indigo-300' : 'text-slate-200'}`}>
                      {model.name}
                    </div>
                    <div className="text-xs text-slate-500">{model.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pt-20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center 
              ${msg.role === 'user' ? 'bg-indigo-600' : msg.role === 'model' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-slate-700'}`}>
              {msg.role === 'user' ? <User size={18} className="text-white" /> : 
               msg.role === 'model' ? <Bot size={18} className="text-white" /> : 
               <BrainCircuit size={18} className="text-indigo-300" />}
            </div>
            
            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] space-y-2`}>
               {/* Display Image Attachment if exists */}
               {msg.imageAttachment && (
                <div className="rounded-lg overflow-hidden border border-slate-700 max-w-xs">
                  <img src={msg.imageAttachment} alt="User upload" className="w-full h-auto object-cover" />
                </div>
              )}

              <div className={`px-5 py-3.5 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm whitespace-pre-wrap
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : msg.role === 'model'
                    ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                    : 'bg-transparent text-slate-400 text-xs italic border border-slate-800'
                }`}>
                {msg.text}
              </div>
              <div className={`text-[10px] text-slate-600 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-4 max-w-4xl mx-auto">
             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
               <Bot size={18} className="text-white" />
             </div>
             <div className="bg-slate-800 border border-slate-700 px-5 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
               <span className="text-slate-400 text-sm">{selectedModel.name} düşünüyor...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 z-20">
        <div className="max-w-4xl mx-auto relative">
          {selectedImage && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-slate-900 rounded-lg border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-2">
              <div className="w-12 h-12 relative rounded overflow-hidden group">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                   <button onClick={clearImage}><X size={14} className="text-white" /></button>
                </div>
              </div>
              <span className="text-xs text-slate-400">Görsel eklendi</span>
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-slate-900/50 border border-slate-700 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Görsel Yükle"
            >
              <ImageIcon size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden" 
              accept="image/*"
            />
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${selectedModel.name} ile sohbet edin...`}
              className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-200 placeholder-slate-500 resize-none max-h-32 py-3 text-sm md:text-base scrollbar-hide"
              rows={1}
              style={{ minHeight: '44px' }}
            />
            
            <button 
              onClick={sendMessage}
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/20"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-600">
              Yapay zeka hata yapabilir. Önemli bilgileri kontrol edin. | {selectedModel.id.includes('pro') ? 'Professional Mode' : 'Standard Mode'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};