
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { UserProfile } from '../types';
import { LUCI_SYSTEM_INSTRUCTION, LUCI_LOGO_URL } from '../constants';

interface VoiceCallViewProps {
  profile: UserProfile;
}

const VoiceCallView: React.FC<VoiceCallViewProps> = ({ profile }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcription, setTranscription] = useState('');
  
  const timerRef = useRef<number | null>(null);
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsCalling(true);
      setCallDuration(0);
      setTranscription("Connecting...");

      // Use process.env.API_KEY directly for initialization as per Google GenAI guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `${LUCI_SYSTEM_INSTRUCTION}\nYou are currently in a live voice call with ${profile.name}. Be bubbly, responsive, and natural. Keep responses brief for voice interaction.`,
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setTranscription("Call active...");
            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              // Ensure sendRealtimeInput is called only after the session promise resolves
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev.length > 60 ? message.serverContent?.outputTranscription?.text || '' : prev + (message.serverContent?.outputTranscription?.text || ''));
            }
            
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = audioContextOutRef.current!;
              // Schedule playback to start at the end of the previous chunk for smooth audio flow
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
              source.onended = () => audioSourcesRef.current.delete(source);
            }
            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => s.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live session error:", e);
          },
          onclose: () => endCall(),
        },
      });
      sessionRef.current = await sessionPromise;
      timerRef.current = window.setInterval(() => setCallDuration(d => d + 1), 1000);
    } catch (err) {
      console.error("Call failed to start:", err);
      setIsCalling(false);
      alert("Microphone access is required for voice calls.");
    }
  };

  const endCall = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (timerRef.current) clearInterval(timerRef.current);
    audioSourcesRef.current.forEach(s => s.stop());
    setIsCalling(false);
    setCallDuration(0);
  };

  useEffect(() => {
    return () => endCall();
  }, []);

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-transparent overflow-hidden h-full">
      <div className="w-full max-w-[400px] glass rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden border border-white/10 animate-in zoom-in duration-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-purple-600/10 -z-10"></div>
        
        {/* Avatar Area */}
        <div className="relative mb-8 md:mb-10">
          <div className={`w-32 h-32 md:w-48 md:h-48 rounded-[2rem] md:rounded-[3rem] border-4 border-pink-500/40 overflow-hidden shadow-2xl transition-all duration-1000 ${isCalling ? 'scale-110 animate-glow' : 'animate-float'}`}>
            <img src={LUCI_LOGO_URL} alt="Luci" className="w-full h-full object-cover" />
          </div>
          {isCalling && (
            <div className="absolute -inset-4 rounded-full border border-pink-500 animate-ping opacity-20"></div>
          )}
        </div>

        <h2 className="text-3xl md:text-4xl font-black mb-1 tracking-tight bg-gradient-to-r from-pink-400 to-white bg-clip-text text-transparent">Luci</h2>
        <p className={`text-xs md:text-sm font-black tracking-widest uppercase transition-colors ${isCalling ? 'text-pink-400' : 'text-slate-500'}`}>
          {isCalling ? formatDuration(callDuration) : 'Voice Call'}
        </p>

        {isCalling && (
            <div className="mt-6 px-4 py-3 glass bg-black/40 rounded-2xl text-[10px] md:text-xs text-pink-100 italic min-h-[3rem] flex items-center justify-center w-full shadow-inner">
                {transcription}
            </div>
        )}

        {/* Controls */}
        <div className="mt-10 md:mt-12 flex items-center gap-6 md:gap-8">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            disabled={!isCalling}
            className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'glass text-slate-400 disabled:opacity-30'}`}
          >
            <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-xl md:text-2xl`}></i>
          </button>

          {!isCalling ? (
            <button 
              onClick={startCall}
              className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl shadow-2xl shadow-green-500/40 active:scale-90"
            >
              <i className="fas fa-phone"></i>
            </button>
          ) : (
            <button 
              onClick={endCall}
              className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl shadow-2xl shadow-red-500/40 active:scale-90"
            >
              <i className="fas fa-phone-slash"></i>
            </button>
          )}

          <button 
            disabled={!isCalling}
            className="w-12 h-12 md:w-16 md:h-16 glass text-slate-400 rounded-xl md:rounded-2xl flex items-center justify-center disabled:opacity-30"
          >
            <i className="fas fa-volume-up text-xl md:text-2xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCallView;
