
import React from 'react';
import { UserProfile } from '../types';
import { CREATOR_CREDIT, LUCI_LOGO_URL } from '../constants';

interface ProfileViewProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onClearChat: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, setProfile, onClearChat }) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, name: e.target.value }));
  };

  const handleInterestToggle = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const interests = ['Gaming', 'Anime', 'Programming', 'Cooking', 'Fitness', 'Music', 'Travel', 'Art'];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-[#0f172a]/50">
      <div className="max-w-2xl mx-auto space-y-12 pb-20">
        <header>
          <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">Profile Settings</h2>
          <p className="text-slate-400 font-medium">Customize how Luci interacts with you.</p>
        </header>

        <section className="space-y-6">
          <div className="flex items-center gap-6 p-6 glass rounded-3xl border border-white/5">
            <div className="relative">
              <img src={profile.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-pink-500/20 shadow-2xl" />
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-[#0f172a] hover:scale-110 transition-transform">
                <i className="fas fa-camera"></i>
              </button>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Display Name</label>
              <input 
                type="text" 
                value={profile.name} 
                onChange={handleNameChange}
                className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-bold"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-widest text-pink-400">
            <i className="fas fa-star"></i>
            My Interests
          </h3>
          <p className="text-xs text-slate-500 font-medium italic">Luci will tailor her conversations based on what you like.</p>
          <div className="flex flex-wrap gap-2">
            {interests.map(interest => (
              <button
                key={interest}
                onClick={() => handleInterestToggle(interest)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${profile.interests.includes(interest) ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'}`}
              >
                {interest}
              </button>
            ))}
          </div>
        </section>

        {/* Creator Info Section */}
        <section className="space-y-4 p-8 glass rounded-[2.5rem] border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <i className="fas fa-certificate text-6xl text-pink-500"></i>
          </div>
          <h3 className="text-xl font-black flex items-center gap-3 bg-gradient-to-r from-pink-400 to-white bg-clip-text text-transparent">
            <i className="fas fa-info-circle text-pink-500"></i>
            About Luci
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                    <img src={LUCI_LOGO_URL} alt="Luci" className="w-full h-full object-cover" />
                </div>
                <div>
                    <p className="text-sm font-black text-white">Luci AI Version 1.0.0</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Stable Desktop Release</p>
                </div>
            </div>
            <div className="pt-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Created By</p>
                <p className="text-lg font-black tracking-tighter text-pink-400 drop-shadow-sm">
                    {CREATOR_CREDIT}
                </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-6 border-t border-white/5">
          <h3 className="text-lg font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i>
            Danger Zone
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
                onClick={() => {
                    if(confirm("Are you sure you want to clear your chat history with Luci?")) onClearChat();
                }}
                className="glass border-red-500/20 hover:bg-red-500/10 text-red-400 p-4 rounded-2xl flex items-center justify-center gap-2 transition-colors font-black uppercase text-xs tracking-widest"
            >
              <i className="fas fa-trash-alt"></i>
              Clear Chat
            </button>
            <button 
                onClick={() => {
                    if(confirm("This will log you out and require a new API key. Continue?")) {
                        localStorage.clear();
                        window.location.reload();
                    }
                }}
                className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-2xl flex items-center justify-center gap-2 transition-colors font-black uppercase text-xs tracking-widest shadow-xl shadow-red-500/20"
            >
              <i className="fas fa-sign-out-alt"></i>
              Reset App
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileView;
