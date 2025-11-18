
export enum AppMode {
  CHAT = 'CHAT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  isLoading?: boolean;
  imageAttachment?: string; // base64
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  createdAt: number;
}

export interface GeneratedVideo {
  url: string;
  prompt: string;
  createdAt: number;
  asset?: any; // Stores the Veo asset for extension
}

export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Fenrir = 'Fenrir',
  Charon = 'Charon',
  Zephyr = 'Zephyr'
}
