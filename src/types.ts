export interface ScriptSegment {
  id: string;
  text: string;
  visualDescription?: string;
  caption: string;
  emotion?: 'friendly' | 'confident' | 'enthusiastic' | 'empathetic' | 'serious';
  voiceSpeed?: number;
}

export interface VideoScript {
  title: string;
  estimatedDuration: string;
  segments: ScriptSegment[];
}

export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  gender: 'male' | 'female' | 'nonbinary';
  voice: string;
  isCustom?: boolean;
}

export interface Background {
  id: string;
  name: string;
  imageUrl: string;
  type: 'color' | 'image' | 'video';
  isCustom?: boolean;
}

export interface VoiceConfig {
  id: string;
  name: string;
  gender: 'male' | 'female';
  lang: string;
  service: 'gemini' | 'browser';
  nativeVoiceName?: string; // Standard Web Speech Voice Name
}

export interface SavedVideo {
  id: string;
  title: string;
  script: VideoScript;
  avatar: Avatar;
  background: Background;
  voice: VoiceConfig;
  captionColor: string;
  captionStyle: string;
  createdAt: string;
}
