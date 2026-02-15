
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Info, MessageSquare, X, ChevronRight, Sword, Shield, Coffee, Hammer, Sparkles, BookOpen, Users, Radar } from 'lucide-react';
import { TAUNTS } from './constants';
import { Taunt, TauntCategory, ChatMessage } from './types';
import { GoogleGenAI } from "@google/genai";

// --- Components ---

const CategoryIcon: React.FC<{ category: TauntCategory }> = ({ category }) => {
  switch (category) {
    case TauntCategory.COMBAT: return <Sword size={16} className="text-red-400" />;
    case TauntCategory.INTEL: return <Radar size={16} className="text-cyan-400" />;
    case TauntCategory.ESSENTIAL: return <Shield size={16} className="text-blue-400" />;
    case TauntCategory.PLAYERS: return <Users size={16} className="text-purple-400" />;
    case TauntCategory.FLAVOR: return <Sparkles size={16} className="text-yellow-400" />;
    default: return <Coffee size={16} className="text-gray-400" />;
  }
};

const TauntCard: React.FC<{ taunt: Taunt }> = ({ taunt }) => {
  // Map internal color names to tailwind classes
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500/50 shadow-blue-500/5',
    red: 'border-red-500/50 shadow-red-500/5',
    yellow: 'border-yellow-500/50 shadow-yellow-500/5',
    green: 'border-green-500/50 shadow-green-500/5',
    teal: 'border-teal-500/50 shadow-teal-500/5',
    purple: 'border-purple-500/50 shadow-purple-500/5',
    orange: 'border-orange-500/50 shadow-orange-500/5',
    pink: 'border-pink-500/50 shadow-pink-500/5',
  };

  const colorClass = taunt.color ? colorMap[taunt.color] : 'border-[#2d323d]';

  return (
    <div className={`flex items-center gap-4 bg-[#1a1d24] border ${colorClass} p-4 rounded-xl active:bg-[#252a35] transition-all shadow-lg`}>
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#252a35] rounded-full border border-yellow-500/20">
        <span className="text-yellow-500 font-cinzel text-xl font-bold">{taunt.id}</span>
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <CategoryIcon category={taunt.category} />
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{taunt.category}</span>
        </div>
        <p className="text-gray-100 font-medium text-lg leading-tight">{taunt.text}</p>
      </div>
      <ChevronRight className="text-gray-700 flex-shrink-0" size={18} />
    </div>
  );
};

const AssistantModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "You are an expert Age of Empires IV tactician. Provide concise, mobile-friendly advice on counters, build orders, and strategy. Keep responses extremely brief (under 80 words) for reading during matches.",
          temperature: 0.7,
        }
      });

      const aiText = response.text || "Tactical scouting failed.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Connection to command lost." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0c0e12]">
      <div className="flex items-center justify-between p-4 border-b border-[#2d323d] bg-[#161921]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black">
            <Sparkles size={18} />
          </div>
          <h2 className="font-cinzel font-bold text-lg text-yellow-500">Tactical Scout</h2>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400">
          <X size={24} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center mt-12 px-6">
            <div className="bg-[#1a1d24] p-6 rounded-2xl border border-dashed border-gray-700">
              <p className="text-gray-400 text-sm">
                "Ask for counters or build orders, commander."
              </p>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              m.role === 'user' ? 'bg-yellow-600 text-white rounded-tr-none' : 'bg-[#1a1d24] text-gray-200 border border-[#2d323d] rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1d24] p-4 rounded-2xl animate-pulse">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#161921] border-t border-[#2d323d] pb-8">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Advice needed..."
            className="flex-grow bg-[#0c0e12] border border-[#2d323d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
          />
          <button onClick={handleSend} disabled={isLoading} className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold">
            Ask
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<TauntCategory | 'All'>('All');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const categories = ['All', ...Object.values(TauntCategory)];

  const filteredTaunts = useMemo(() => {
    return TAUNTS.filter(t => {
      const matchesSearch = t.id.toString().includes(search) || t.text.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-[#0c0e12] flex flex-col relative overflow-hidden">
      <header className="sticky top-0 z-30 bg-[#0c0e12]/80 backdrop-blur-lg border-b border-[#2d323d] px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1a1d24] border border-yellow-500/30 rounded-lg flex items-center justify-center">
              <Sword className="text-yellow-500" size={24} />
            </div>
            <div>
              <h1 className="font-cinzel text-xl font-bold text-white leading-none">AoE IV Taunts</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">114 Official Taunts</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAssistantOpen(true)}
            className="flex items-center gap-2 bg-[#1a1d24] border border-[#2d323d] px-3 py-2 rounded-lg text-yellow-500 font-bold text-xs"
          >
            <Sparkles size={16} /> SCOUT
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center">
            <Search className="text-gray-500" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search command..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a1d24] border border-[#2d323d] rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/50"
          />
        </div>

        <div className="flex overflow-x-auto gap-2 py-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                activeCategory === cat
                  ? 'bg-yellow-500 text-black border-yellow-500'
                  : 'bg-[#1a1d24] text-gray-400 border-[#2d323d]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-grow px-4 py-6 space-y-3 no-scrollbar pb-24">
        {filteredTaunts.length > 0 ? (
          filteredTaunts.map((t) => <TauntCard key={t.id} taunt={t} />)
        ) : (
          <div className="text-center py-20 text-gray-500">No taunts found.</div>
        )}
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm pointer-events-none">
        <div className="bg-blue-900/90 backdrop-blur-md border border-blue-400/30 p-3 rounded-2xl shadow-2xl flex items-center gap-4">
          <Info className="text-blue-400 shrink-0" size={18} />
          <p className="text-blue-100 text-[11px] leading-tight">
            Use <span className="font-bold">/</span> followed by the number in game chat.
          </p>
        </div>
      </div>

      {isAssistantOpen && <AssistantModal onClose={() => setIsAssistantOpen(false)} />}
    </div>
  );
}
