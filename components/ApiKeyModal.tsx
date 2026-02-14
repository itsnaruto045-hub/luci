
import React, { useState } from 'react';
import { API_KEY_TUTORIAL_URL, CREATOR_CREDIT, LUCI_LOGO_URL } from '../constants';

interface ApiKeyModalProps {
  onSubmit: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSubmit }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.length < 20) {
      setError('Please enter a valid Gemini API key.');
      return;
    }
    onSubmit(key);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-950/90 backdrop-blur-2xl overflow-y-auto">
      <div className="max-w-lg w-full glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 my-auto shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mx-auto shadow-2xl shadow-pink-500/40 animate-float border-2 border-pink-500/50">
            <img src={LUCI_LOGO_URL} alt="Luci Avatar" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Connect Luci</h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
            Paste a <span className="text-pink-400 font-bold underline underline-offset-4">Gemini API Key</span> to begin.
          </p>
        </div>

        <div className="bg-black/40 rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-white/5 shadow-inner">
          <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2">
            <i className="fas fa-sparkles text-pink-400"></i>
            Quick Setup
          </h3>
          <ul className="text-xs md:text-sm space-y-3 md:space-y-4 text-slate-300 font-medium">
            <li className="flex items-start gap-3">
              <span className="bg-pink-500/20 text-pink-400 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 font-black">1</span>
              <span>Open <a href={API_KEY_TUTORIAL_URL} target="_blank" rel="noopener" className="text-pink-400 hover:text-pink-300 transition-colors font-bold border-b border-pink-500/30">Google AI Studio</a></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-pink-500/20 text-pink-400 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 font-black">2</span>
              <span>Create an API Key (it's free).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-pink-500/20 text-pink-400 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 font-black">3</span>
              <span>Paste it below to wake up Luci.</span>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
            <input
              type="password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError('');
              }}
              placeholder="Paste Key Here..."
              className="relative w-full bg-slate-900/95 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all font-mono text-center tracking-widest text-pink-400 placeholder:tracking-normal placeholder:text-slate-600 text-sm md:text-base"
            />
            {error && <p className="text-red-400 text-[10px] md:text-xs mt-2 font-bold px-2 flex items-center gap-2 animate-pulse">
              <i className="fas fa-exclamation-triangle"></i> {error}
            </p>}
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl shadow-xl shadow-pink-500/30 transition-all active:scale-[0.96] text-sm md:text-lg uppercase tracking-widest"
          >
            Wake Up Luci
          </button>
        </form>

        <p className="mt-8 text-center text-[8px] md:text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
            Built by {CREATOR_CREDIT}
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;
