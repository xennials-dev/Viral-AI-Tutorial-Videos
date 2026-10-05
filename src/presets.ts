import { Avatar, Background, VoiceConfig } from "./types";

export const PRESET_AVATARS: Avatar[] = [
  {
    id: " Sophia",
    name: "Sophia",
    gender: "female",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
    voice: "Kore"
  },
  {
    id: "marcus",
    name: "Marcus",
    gender: "male",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop",
    voice: "Zephyr"
  },
  {
    id: "elena",
    name: "Elena",
    gender: "female",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop",
    voice: "Kore"
  },
  {
    id: "david",
    name: "David",
    gender: "male",
    imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop",
    voice: "Fenrir"
  },
  {
    id: "tariq",
    name: "Tariq",
    gender: "male",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
    voice: "Charon"
  }
];

export const PRESET_BACKGROUNDS: Background[] = [
  {
    id: "bg-office",
    name: "Executive Office",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop",
    type: "image"
  },
  {
    id: "bg-studio",
    name: "Chic Loft",
    imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop",
    type: "image"
  },
  {
    id: "bg-minimal",
    name: "Bright Studio",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
    type: "image"
  },
  {
    id: "bg-gradient-blue",
    name: "Cosmic Blue",
    imageUrl: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
    type: "color"
  },
  {
    id: "bg-gradient-dark",
    name: "Slate Neutral",
    imageUrl: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
    type: "color"
  },
  {
    id: "bg-cream",
    name: "Warm Beige",
    imageUrl: "linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)",
    type: "color"
  }
];

export const PRESET_VOICES: VoiceConfig[] = [
  {
    id: "voice-kore",
    name: "Kore (Warm Female Voice)",
    gender: "female",
    lang: "en-US",
    service: "gemini"
  },
  {
    id: "voice-zephyr",
    name: "Zephyr (Clear Male Voice)",
    gender: "male",
    lang: "en-US",
    service: "gemini"
  },
  {
    id: "voice-puck",
    name: "Puck (Energetic Voice)",
    gender: "male",
    lang: "en-US",
    service: "gemini"
  },
  {
    id: "voice-fenrir",
    name: "Fenrir (Deep Male Voice)",
    gender: "male",
    lang: "en-US",
    service: "gemini"
  },
  {
    id: "voice-charon",
    name: "Charon (Soft Professional Voice)",
    gender: "male",
    lang: "en-US",
    service: "gemini"
  }
];
