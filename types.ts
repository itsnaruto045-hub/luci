
export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  personalityPreference: string;
  interests: string[];
  avatarUrl: string;
}

export interface AppState {
  activeView: 'chat' | 'voice' | 'profile';
  messages: Message[];
  profile: UserProfile;
}

export enum AppViews {
  CHAT = 'chat',
  VOICE = 'voice',
  PROFILE = 'profile'
}
