
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Message, UserProfile } from '../types';
import { LUCI_SYSTEM_INSTRUCTION, LUCI_LOGO_URL } from '../constants';

interface ChatViewProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  profile: UserProfile;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, setMessages, profile }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Use process.env.API_KEY directly for initialization as per Google GenAI guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, userMessage].map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: `${LUCI_SYSTEM_INSTRUCTION}\nThe user's name is ${profile.name}. Their interests are: ${profile.interests.join(', ')}.`,
          temperature: 0.9,
          topP: 0.95,
        }
      });

      const aiText = response.text || "I'm sorry, I couldn't process that.";
      const modelMessage: Message = {
        role: 'model',
        content: aiText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'model',
        content: "Oh no! My internal circuits are a bit fuzzy. Can we try that again?",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent z-10">
      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:y-6"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-1000">
            <div className="relative mb-4 md:mb-6">
              <div className="w-24 h-24 md:w-40 md:h-40 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-pink-500/50 animate-float border-2 border-pink-500/50">
                  <img src={LUCI_LOGO_URL} alt="Luci" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-12 md:h-12 bg-pink-500 rounded-full border-2 md:border-4 border-[#020617] flex items-center justify-center text-white shadow-lg animate-pulse">
                <i className="fas fa-heart text-[10px] md:text-sm"></i>
              </div>
            </div>
            <h2 className="text-2xl md:text-4xl font-black mb-2 tracking-tighter bg-gradient-to-r from-pink-400 to-white bg-clip-text text-transparent">Hello, {profile.name}!</h2>
            <p className="text-slate-300 text-sm md:text-base max-w-sm leading-relaxed font-medium opacity-90 drop-shadow-md">
              I'm Luci, your AI companion. Ready to chat or call?
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300 fill-mode-both`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={`max-w-[90%] md:max-w-[70%] rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-md border ${
              msg.role === 'user' 
                ? 'bg-pink-600/80 text-white rounded-tr-none border-white/20' 
                : 'bg-slate-950/70 text-slate-100 rounded-tl-none border-pink-500/40'
            }`}>
              <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed font-medium">
                {msg.content}
              </p>
              <div className="flex items-center justify-between mt-2 md:mt-3 opacity-40">
                <span className="text-[9px] font-bold tracking-widest uppercase">
                   {msg.role === 'model' ? 'LUCI' : 'YOU'}
                </span>
                <span className="text-[9px] font-medium">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-slate-950/70 backdrop-blur-md rounded-2xl p-4 rounded-tl-none flex items-center gap-2 border border-pink-500/40 shadow-xl">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-8 bg-transparent z-20">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center gap-2 md:gap-4 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-700"></div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Talk to Luci..."
            className="relative flex-1 bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-xl md:rounded-2xl py-3.5 md:py-5 px-4 md:px-7 focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-slate-600 shadow-2xl text-sm md:text-lg font-medium"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="relative w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <i className={`fas fa-paper-plane text-sm md:text-xl ${isLoading ? 'animate-ping' : ''}`}></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
