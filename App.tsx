
import React, { useState, useEffect } from 'react';
import { AppViews, UserProfile, Message } from './types';
import { db } from './db';
import ChatView from './components/ChatView';
import VoiceCallView from './components/VoiceCallView';
import ProfileView from './components/ProfileView';
import Sidebar from './components/Sidebar';
import { CREATOR_CREDIT } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppViews>(AppViews.CHAT);
  const [messages, setMessages] = useState<Message[]>(db.getMessages());
  const [profile, setProfile] = useState<UserProfile>(
    db.getProfile() || {
      name: 'User',
      personalityPreference: 'Friendly',
      interests: [],
      avatarUrl: 'https://picsum.photos/200/200?random=1'
    }
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    db.saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    db.saveProfile(profile);
  }, [profile]);

  const handleClearChat = () => {
    setMessages([]);
    db.saveMessages([]);
  };

  const renderView = () => {
    switch (activeView) {
      case AppViews.CHAT:
        return <ChatView 
          messages={messages} 
          setMessages={setMessages} 
          profile={profile}
        />;
      case AppViews.VOICE:
        return <VoiceCallView 
          profile={profile}
        />;
      case AppViews.PROFILE:
        return <ProfileView 
          profile={profile} 
          setProfile={setProfile} 
          onClearChat={handleClearChat}
        />;
      default:
        return <ChatView 
          messages={messages} 
          setMessages={setMessages} 
          profile={profile}
        />;
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-transparent text-slate-100 overflow-hidden relative">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block w-72 h-full z-20">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          profile={profile} 
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden transition-opacity duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-[80%] max-w-[300px] z-50 transition-transform duration-500 ease-in-out transform md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Fix: onClose correctly handles () => void which is now expected by Sidebar */}
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          profile={profile} 
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {/* Header (Mobile Only) */}
        <header className="md:hidden flex items-center justify-between p-3 glass sticky top-0 z-30 border-b border-white/10">
          <button onClick={() => setIsSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-transform active:scale-90">
            <i className="fas fa-bars text-lg text-pink-400"></i>
          </button>
          <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            LUCI
          </h1>
          <div className="w-10"></div>
        </header>

        <div className="flex-1 relative overflow-hidden">
           {renderView()}
        </div>

        {/* Footer Credit */}
        <footer className="absolute bottom-1 left-0 right-0 text-center pointer-events-none opacity-40 text-[8px] md:text-xs font-black tracking-[0.2em] uppercase">
          Creator: {CREATOR_CREDIT}
        </footer>
      </main>
    </div>
  );
};

export default App;
