import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Wand2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Tv,
  Search,
  Bell,
  Trash2,
  Plus,
  Download,
  ExternalLink,
  Database,
  CheckCircle,
  Sliders,
  Cpu,
  Video,
  RefreshCw,
  FolderOpen,
  Layout,
  User,
  Image as ImageIcon,
  Flame,
  Check
} from "lucide-react";

import ScriptEditor from "./components/ScriptEditor";
import AvatarGallery from "./components/AvatarGallery";
import BackgroundGallery from "./components/BackgroundGallery";

import { PRESET_AVATARS, PRESET_BACKGROUNDS, PRESET_VOICES } from "./presets";
import { VideoScript, Avatar, Background, VoiceConfig, SavedVideo, ScriptSegment } from "./types";

export default function App() {
  // Navigation tabs: 'studio' | 'stage' | 'library'
  const [activeTab, setActiveTab] = useState<"studio" | "stage" | "library">("studio");

  // State managers
  const [script, setScript] = useState<VideoScript>({
    title: "Xennials Product Announcement",
    estimatedDuration: "60 seconds",
    segments: [
      {
        id: "intro",
        text: "Welcome to Xennials! The ultimate AI spokesperson generator that transforms raw script into high-fidelity talking presenter videos instantly.",
        visualDescription: "Executive Office background. Sophia smiles warmly and makes an opening welcoming hand gesture.",
        caption: "Welcome to Xennials - AI Spokesperson Video Creator!",
        emotion: "friendly",
        voiceSpeed: 1.0,
      },
      {
        id: "body_1",
        text: "With Xennials, you don't need expensive camera gear, studio lighting, or complex video editors. Our models generate flawless virtual spokesperson faces with synchronous voice speech in seconds.",
        visualDescription: "Switching to minimalist bright loft workspace. Sophia speaks confidently with detailed expressions.",
        caption: "Eliminate expensive cameras, lights, and studios.",
        emotion: "confident",
        voiceSpeed: 1.0,
      },
      {
        id: "body_2",
        text: "Customize everything! Generate bespoke avatars using simple AI text descriptions, render gorgeous dynamic backgrounds, and select premium warm voices tailored to your company brand.",
        visualDescription: "Backdrop showing a cosmic amber gradient. Sophia points slightly to direct visual focus.",
        caption: "Customize unique AI presenter faces, backdrops, and speech rates.",
        emotion: "enthusiastic",
        voiceSpeed: 1.15,
      },
      {
        id: "cta",
        text: "Sign up at our portal today to access premium templates and elevate your corporate communication. Let Xennials produce your next masterpiece!",
        visualDescription: "Back to executive office backdrop. Sophia waves and smiles elegantly for the outro card.",
        caption: "Convert scripts to presentations now. Visit xennials.com!",
        emotion: "friendly",
        voiceSpeed: 1.0,
      },
    ],
  });

  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(PRESET_AVATARS[0]);
  const [selectedBackground, setSelectedBackground] = useState<Background>(PRESET_BACKGROUNDS[0]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceConfig>(PRESET_VOICES[0]);
  const [customAvatars, setCustomAvatars] = useState<Avatar[]>([]);
  const [customBackgrounds, setCustomBackgrounds] = useState<Background[]>([]);

  // Subtitle/Caption customization options
  const [captionStyle, setCaptionStyle] = useState<"neon" | "retro" | "minimal" | "block">("block");
  const [captionColor, setCaptionColor] = useState<string>("text-orange-400");

  // Simulated player control states
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({}); // cached base64 audio per segment id
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Video render state
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderLogs, setRenderLogs] = useState<string[]>([]);

  // Project library state
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Refs for audio playback & intervals
  const audioObjRef = useRef<HTMLAudioElement | null>(null);
  const playProgressInterval = useRef<any>(null);
  const [playProgressPercent, setPlayProgressPercent] = useState<number>(0);

  // Load saved projects on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("xennials_videos");
      if (stored) {
        setSavedVideos(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error reading from localstorage:", e);
    }
  }, []);

  // Save layout logic
  const handleSaveVideo = () => {
    const newVideo: SavedVideo = {
      id: `vid_${Date.now()}`,
      title: script.title || "Untitled Masterpiece",
      script,
      avatar: selectedAvatar,
      background: selectedBackground,
      voice: selectedVoice,
      captionColor,
      captionStyle,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updated = [newVideo, ...savedVideos];
    setSavedVideos(updated);
    localStorage.setItem("xennials_videos", JSON.stringify(updated));
    alert("Project saved successfully to your Local Masterpieces Library!");
  };

  const handleDeleteVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedVideos.filter((v) => v.id !== id);
    setSavedVideos(filtered);
    localStorage.setItem("xennials_videos", JSON.stringify(filtered));
  };

  const handleExportVideo = (vid: SavedVideo, format: "mp4" | "gif", e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Generating ${format.toUpperCase()} export package for "${vid.title}"... Download will start automatically.`);
    setTimeout(() => {
      const exportData = {
        title: vid.title,
        format: format.toUpperCase(),
        avatar: vid.avatar.name,
        background: vid.background.name,
        duration: vid.script.estimatedDuration,
        segmentsCount: vid.script.segments.length,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${vid.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 600);
  };

  const handleLoadVideo = (video: SavedVideo) => {
    setScript(video.script);
    setSelectedAvatar(video.avatar);
    setSelectedBackground(video.background);
    setSelectedVoice(video.voice);
    setCaptionColor(video.captionColor);
    setCaptionStyle(video.captionStyle as any);
    setActiveTab("studio");
  };

  // Audio Playback Engine
  const activeSegment = script.segments[currentSegmentIndex] || null;

  // Cleanup audio on unmount or segment switch
  const stopAudioPlayback = () => {
    if (audioObjRef.current) {
      audioObjRef.current.pause();
      audioObjRef.current = null;
    }
    if (playProgressInterval.current) {
      clearInterval(playProgressInterval.current);
    }
    setIsPlaying(false);
    setPlayProgressPercent(0);
  };

  useEffect(() => {
    stopAudioPlayback();
  }, [currentSegmentIndex, selectedVoice]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      stopAudioPlayback();
      return;
    }

    if (!activeSegment) return;

    setIsAudioLoading(true);
    setAudioError(null);

    try {
      let base64Audio = audioCache[activeSegment.id];

      // If audio is not cached, fetch it from our backend Gemini TTS endpoint
      if (!base64Audio) {
        const response = await fetch("/api/generate-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: activeSegment.text,
            voice: selectedAvatar.voice || "Kore", // use designated presenter voice
          }),
        });

        if (!response.ok) {
          throw new Error("Speech synthesis request failed. Ensure your server is active and Gemini API key is configured.");
        }

        const data = await response.json();
        if (data && data.audioData) {
          base64Audio = data.audioData;
          // Cache it
          setAudioCache((prev) => ({ ...prev, [activeSegment.id]: data.audioData }));
        } else {
          throw new Error("No speech output received.");
        }
      }

      // Play the audio
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      audioObjRef.current = audio;
      audio.muted = isMuted;

      audio.onended = () => {
        stopAudioPlayback();
        // Auto-advance to next segment if available
        if (currentSegmentIndex < script.segments.length - 1) {
          setCurrentSegmentIndex((prev) => prev + 1);
          // Auto-play the next segment!
          setTimeout(() => {
            setIsPlaying(true);
            handlePlayPause();
          }, 300);
        }
      };

      await audio.play();
      setIsPlaying(true);
      setIsAudioLoading(false);

      // Simulate a responsive progress line based on duration
      let durationMs = audio.duration ? audio.duration * 1000 : 8000;
      if (isNaN(durationMs) || durationMs === Infinity) durationMs = 8000; // fallback

      const step = 50;
      let elapsed = 0;
      playProgressInterval.current = setInterval(() => {
        elapsed += step;
        const progress = Math.min((elapsed / durationMs) * 100, 100);
        setPlayProgressPercent(progress);
        if (progress >= 100) {
          clearInterval(playProgressInterval.current);
        }
      }, step);

    } catch (err: any) {
      console.error("Audio generation failed:", err);
      setAudioError(err.message || "Failed to generate synthetic spokesperson audio.");
      setIsAudioLoading(false);
      setIsPlaying(false);
    }
  };

  const handleNextSegment = () => {
    if (currentSegmentIndex < script.segments.length - 1) {
      setCurrentSegmentIndex((prev) => prev + 1);
    }
  };

  const handlePrevSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex((prev) => prev - 1);
    }
  };

  const toggleMute = () => {
    if (audioObjRef.current) {
      audioObjRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  // Rendering Simulator
  const triggerSimulateRender = () => {
    if (script.segments.length === 0) {
      alert("Please add at least one script segment to render.");
      return;
    }
    setIsRendering(true);
    setRenderProgress(0);
    setRenderLogs(["Initializing Xennials render pipelines...", "Loading assets and environment parameters..."]);

    const logsList = [
      "Muxing backdrop layers with camera filters...",
      "Synthesizing high fidelity speech audio sequences...",
      "Aligning spokesperson facial geometry and expressions...",
      "Generating subpixel overlay tracking matrices...",
      "Assembling video track layout (1080p, 60fps)...",
      "Injecting caption subtitle streams...",
      "Rendering final video compression layers (H.264)...",
      "Validating output audio-visual alignments...",
      "Masterpiece rendered successfully!"
    ];

    let currentLogIdx = 0;
    const progressInterval = setInterval(() => {
      setRenderProgress((prev) => {
        const nextProgress = prev + 5;
        
        // Push realistic logs dynamically
        if (nextProgress % 15 === 0 && currentLogIdx < logsList.length) {
          setRenderLogs((logs) => [...logs, logsList[currentLogIdx]]);
          currentLogIdx++;
        }

        if (nextProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsRendering(false);
            handleSaveVideo(); // Auto save to library
          }, 800);
          return 100;
        }
        return nextProgress;
      });
    }, 250);
  };

  // Filter masterpieces based on search
  const filteredVideos = savedVideos.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-zinc-900/50 border-r border-zinc-800 flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3">
            {/* Glowing Orange Logo */}
            <div className="relative flex items-center justify-center w-9 h-9 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.45)]">
              <Video className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-zinc-900 animate-ping" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">Xennials</h1>
              <p className="text-[9px] uppercase tracking-widest font-extrabold text-orange-400">AI Spokesperson</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mb-2">Editorial Studio</div>
          
          <button
            onClick={() => setActiveTab("studio")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              activeTab === "studio"
                ? "bg-zinc-800/60 text-white border-zinc-700 shadow-sm"
                : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/40"
            }`}
          >
            <Wand2 className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold">Script & Design</span>
          </button>

          <button
            onClick={() => setActiveTab("stage")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              activeTab === "stage"
                ? "bg-zinc-800/60 text-white border-zinc-700 shadow-sm"
                : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/40"
            }`}
          >
            <Tv className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold">Interactive Player</span>
          </button>

          <button
            onClick={() => setActiveTab("library")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              activeTab === "library"
                ? "bg-zinc-800/60 text-white border-zinc-700 shadow-sm"
                : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/40"
            }`}
          >
            <FolderOpen className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold">Masterpieces ({savedVideos.length})</span>
          </button>

          <div className="pt-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mb-2">System Metrics</div>
          
          <div className="px-4 py-3 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500 font-medium">Presenter Engine</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500 font-medium">Render Quality</span>
              <span className="text-white font-semibold">1080p FHD</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500 font-medium">Saved Video Budget</span>
              <span className="text-orange-400 font-bold">$140 / min</span>
            </div>
          </div>
        </nav>

        {/* User Badge Footer */}
        <div className="mt-auto p-4 border-t border-zinc-900 bg-zinc-950/20">
          <div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded-2xl border border-zinc-800/60">
            <div className="w-9 h-9 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center text-zinc-950 font-bold text-sm border border-orange-400/40 shadow-inner">
              TF
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">teefisher314@gmail.com</div>
              <div className="text-[10px] text-orange-400 font-bold tracking-wider uppercase">Executive Producer</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-zinc-900/60 bg-zinc-950/40">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search resources, custom assets, scripts..."
                className="bg-zinc-900 border-none rounded-full py-2 pl-10 pr-4 text-xs w-80 focus:ring-1 focus:ring-orange-500 text-zinc-300 placeholder:text-zinc-550"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-white">{script.title || "Untitled Video Project"}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{script.segments.length} segment tracks • {script.estimatedDuration}</div>
            </div>

            <button
              onClick={handleSaveVideo}
              className="text-xs text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-4 py-2 rounded-full font-bold transition-all"
            >
              Save Project
            </button>

            <button
              onClick={triggerSimulateRender}
              className="px-5 py-2.5 bg-white text-zinc-950 font-extrabold text-xs rounded-full hover:bg-zinc-200 transition-all shadow-[0_4px_12px_rgba(255,255,255,0.1)] flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Simulate Render & Save</span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-10">
          
          {/* Rendering Overlay Dialog */}
          {isRendering && (
            <div className="fixed inset-0 bg-zinc-950/90 flex items-center justify-center z-50 p-6 animate-fade-in">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-xl w-full space-y-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-orange-400 animate-spin" />
                    <h3 className="text-lg font-bold text-white">Rendering Xennials Presentation</h3>
                  </div>
                  <span className="text-sm font-mono text-orange-400 font-bold">{renderProgress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850">
                  <div
                    style={{ width: `${renderProgress}%` }}
                    className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-300"
                  />
                </div>

                {/* Console Logs */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 h-40 overflow-y-auto font-mono text-xs text-zinc-400 space-y-1.5 scrollbar-thin">
                  {renderLogs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-orange-500">❯</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                  Xennials cloud servers are working on your video
                </div>
              </div>
            </div>
          )}

          {/* STUDIO CREATOR TAB */}
          {activeTab === "studio" && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Highlight Dashboard Info */}
              <div className="relative bg-zinc-900/50 rounded-[2rem] border border-zinc-800 p-8 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="absolute -top-10 -right-10 p-8 opacity-5">
                  <Wand2 className="w-72 h-72 text-orange-500" />
                </div>
                <div className="relative z-10 space-y-2">
                  <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-[10px] font-bold rounded-full border border-orange-500/20 mb-2 inline-block tracking-widest uppercase">
                    Interactive Design Lab
                  </span>
                  <h2 className="text-3xl font-black text-white tracking-tight">
                    Script & Design Studio
                  </h2>
                  <p className="text-zinc-400 max-w-xl text-sm leading-relaxed">
                    Convert raw topics into powerful spokesperson videos. Create scripts, customize your presenter, choose beautiful set backgrounds, and preview instantly.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("stage")}
                  className="relative z-10 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl border border-zinc-700 transition-all flex items-center gap-1.5 self-start md:self-center"
                >
                  <Tv className="w-4 h-4 text-orange-400" />
                  <span>Go to Interactive Stage</span>
                </button>
              </div>

              {/* Grid of Customizer Elements */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Script Editor */}
                <div className="lg:col-span-8 space-y-6">
                  <ScriptEditor script={script} onScriptChange={setScript} />
                </div>

                {/* Right Side: Assets and Designs */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Selected Voice Config Card */}
                  <div className="bg-zinc-900/50 rounded-[2rem] border border-zinc-800 p-6 space-y-4">
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-orange-400" />
                      <span>Speech Synthesis Voice</span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Select your preferred prebuilt speaking pattern model for rendering:
                    </p>
                    <div className="space-y-2">
                      {PRESET_VOICES.map((vc) => {
                        const isSel = selectedVoice.id === vc.id;
                        return (
                          <button
                            key={vc.id}
                            onClick={() => {
                              setSelectedVoice(vc);
                              // Sync speaker model to active presenter custom details if needed
                              setSelectedAvatar((prev) => ({ ...prev, voice: vc.id.replace("voice-", "") }));
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                              isSel
                                ? "border-orange-500 bg-orange-500/5 font-semibold text-white"
                                : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:text-white"
                            }`}
                          >
                            <span>{vc.name}</span>
                            {isSel && <Check className="w-3.5 h-3.5 text-orange-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Presenter Profile Overview */}
                  <div className="bg-zinc-900/50 rounded-[2rem] border border-zinc-800 p-6 text-center space-y-4">
                    <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                      <img
                        src={selectedAvatar.imageUrl}
                        alt={selectedAvatar.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{selectedAvatar.name}</h4>
                      <p className="text-xs text-zinc-400 capitalize mt-0.5">{selectedAvatar.gender} Presenter Model</p>
                    </div>
                    <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800 text-left text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Background:</span>
                        <span className="text-zinc-300 font-medium truncate max-w-[120px]">{selectedBackground.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Synthesizer:</span>
                        <span className="text-zinc-300 font-medium">{selectedVoice.name.split(" ")[0]}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Avatar Gallery */}
              <AvatarGallery
                selectedAvatar={selectedAvatar}
                onSelectAvatar={setSelectedAvatar}
                customAvatars={customAvatars}
                onAddCustomAvatar={(newAv) => setCustomAvatars((prev) => [...prev, newAv])}
              />

              {/* Background Gallery */}
              <BackgroundGallery
                selectedBackground={selectedBackground}
                onSelectBackground={setSelectedBackground}
                customBackgrounds={customBackgrounds}
                onAddCustomBackground={(newBg) => setCustomBackgrounds((prev) => [...prev, newBg])}
              />

            </div>
          )}

          {/* INTERACTIVE STAGE / PREVIEW PLAYER TAB */}
          {activeTab === "stage" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col xl:flex-row gap-8 items-start">
                
                {/* Left Column: Big Screen Player stage */}
                <div className="flex-1 w-full space-y-4">
                  
                  {/* Stage Border Box */}
                  <div className="relative aspect-video rounded-[2rem] border border-zinc-800 overflow-hidden shadow-2xl bg-zinc-950">
                    
                    {/* Background representation */}
                    <div className="absolute inset-0 z-0">
                      {selectedBackground.type === "color" ? (
                        <div
                          style={{ background: selectedBackground.imageUrl }}
                          className="w-full h-full relative"
                        >
                          {/* Animated floating particles inside the gradient canvas */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.15)_0%,_transparent_60%)] animate-pulse" />
                        </div>
                      ) : (
                        <img
                          src={selectedBackground.imageUrl}
                          alt={selectedBackground.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Stage Ambient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/20 z-10" />

                    {/* Spokesperson Avatar container */}
                    <div className="absolute inset-x-0 bottom-12 flex flex-col items-center justify-center z-20">
                      
                      {/* Interactive Avatar Face Circle */}
                      <div className="relative">
                        
                        {/* Audio equalizer rings pulsing during playback */}
                        {isPlaying && (
                          <div className="absolute -inset-4 rounded-full border border-orange-500/30 animate-ping" />
                        )}
                        
                        <div className={`w-44 h-44 rounded-full overflow-hidden border-4 transition-all duration-300 shadow-2xl ${
                          isPlaying ? "border-orange-500 scale-105 shadow-[0_0_25px_rgba(249,115,22,0.4)]" : "border-zinc-700"
                        }`}>
                          <img
                            src={selectedAvatar.imageUrl}
                            alt={selectedAvatar.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />

                          {/* Blinking overlay/talking effect when playing */}
                          {isPlaying && (
                            <div className="absolute inset-0 bg-orange-500/5 mix-blend-color-dodge flex flex-col items-center justify-end pb-3">
                              <span className="text-[10px] uppercase font-black bg-orange-500 text-zinc-950 px-2 py-0.5 rounded shadow">
                                SPEAKING
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Interactive Voice wave dots floating */}
                        {isPlaying && (
                          <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                            <span className="w-1.5 h-6 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-1.5 h-10 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                            <span className="w-1.5 h-4 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                          </div>
                        )}
                      </div>

                    </div>

                    {/* SUBTITLES / CAPTIONS OVERLAY */}
                    {activeSegment && (
                      <div className="absolute inset-x-10 bottom-6 z-30 text-center">
                        <div className="inline-block max-w-2xl mx-auto">
                          
                          {captionStyle === "block" && (
                            <div className="bg-zinc-950/85 text-white font-extrabold text-sm md:text-base py-2 px-5 rounded-xl border border-zinc-800 shadow-xl leading-relaxed">
                              {activeSegment.caption}
                            </div>
                          )}

                          {captionStyle === "retro" && (
                            <div className="text-yellow-400 font-mono text-base md:text-lg font-black tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                              [ {activeSegment.caption} ]
                            </div>
                          )}

                          {captionStyle === "neon" && (
                            <div className="text-orange-400 font-sans text-base md:text-lg font-extrabold tracking-tight drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">
                              {activeSegment.caption}
                            </div>
                          )}

                          {captionStyle === "minimal" && (
                            <div className="text-zinc-100 font-medium text-xs md:text-sm tracking-wide drop-shadow-md">
                              {activeSegment.caption}
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                    {/* Top status info */}
                    <div className="absolute top-6 left-6 z-30 flex items-center gap-2 bg-zinc-950/60 py-1.5 px-3 rounded-full border border-zinc-800/40 text-[10px] font-bold text-zinc-300">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span>XENNIALS STAGE SIMULATION</span>
                    </div>

                    {/* Top Right Track Position */}
                    <div className="absolute top-6 right-6 z-30 bg-zinc-950/60 py-1.5 px-3 rounded-full border border-zinc-800/40 text-[10px] font-bold text-orange-400">
                      TRACK {currentSegmentIndex + 1} OF {script.segments.length}
                    </div>

                  </div>

                  {/* Audio Error Alert */}
                  {audioError && (
                    <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-xs">
                      {audioError}
                    </div>
                  )}

                  {/* Player controls */}
                  <div className="bg-zinc-900/50 rounded-[2rem] border border-zinc-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* Timeline line */}
                    <div className="w-full md:flex-1 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-zinc-400">
                        <span>Current: Segment {currentSegmentIndex + 1} ({activeSegment?.id})</span>
                        <span>{isPlaying ? `${Math.round(playProgressPercent)}%` : "Ready"}</span>
                      </div>
                      
                      <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          style={{ width: `${playProgressPercent}%` }}
                          className="bg-orange-500 h-full rounded-full transition-all duration-100"
                        />
                      </div>
                    </div>

                    {/* Media Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePrevSegment}
                        disabled={currentSegmentIndex === 0}
                        className="p-3 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 rounded-xl border border-zinc-700 transition-all"
                        title="Previous Segment"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handlePlayPause}
                        disabled={isAudioLoading}
                        className="p-4 bg-orange-500 text-zinc-950 rounded-full hover:bg-orange-600 transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] disabled:opacity-50"
                        title={isPlaying ? "Pause Dialogue" : "Play Spokesperson Speech"}
                      >
                        {isAudioLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      <button
                        onClick={handleNextSegment}
                        disabled={currentSegmentIndex === script.segments.length - 1}
                        className="p-3 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 rounded-xl border border-zinc-700 transition-all"
                        title="Next Segment"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>

                      <button
                        onClick={toggleMute}
                        className="p-3 bg-zinc-855 text-zinc-300 hover:text-white rounded-xl"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-orange-400" />}
                      </button>
                    </div>

                  </div>

                </div>

                {/* Right Column: Customizer sidebar for subtitles/voices */}
                <div className="w-full xl:w-80 space-y-6">
                  
                  {/* Caption customizer */}
                  <div className="bg-zinc-900/50 rounded-[2rem] border border-zinc-800 p-6 space-y-4">
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-orange-400" />
                      <span>Subtitle Typography</span>
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-2">Caption Presets</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setCaptionStyle("block")}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                              captionStyle === "block" ? "border-orange-500 bg-orange-500/5 text-white" : "border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            Cinematic Block
                          </button>
                          <button
                            onClick={() => setCaptionStyle("retro")}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                              captionStyle === "retro" ? "border-orange-500 bg-orange-500/5 text-white" : "border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            Retro Amber
                          </button>
                          <button
                            onClick={() => setCaptionStyle("neon")}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                              captionStyle === "neon" ? "border-orange-500 bg-orange-500/5 text-white" : "border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            Cyber Glow
                          </button>
                          <button
                            onClick={() => setCaptionStyle("minimal")}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                              captionStyle === "minimal" ? "border-orange-500 bg-orange-500/5 text-white" : "border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            Invisible Light
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Segment breakdown script details */}
                  <div className="bg-zinc-900/50 rounded-[2rem] border border-zinc-800 p-6 space-y-4">
                    <h3 className="text-white font-semibold text-sm">Active Dialogue</h3>
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                      <p className="text-xs text-orange-400 font-bold mb-1.5 uppercase tracking-widest">Presenter Instructions</p>
                      <p className="text-xs text-zinc-400 leading-relaxed italic">
                        "{activeSegment?.visualDescription || "No explicit gestures configured."}"
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Emotion Styling</span>
                      <div className="text-xs text-white capitalize bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-800">
                        {activeSegment?.emotion || "Friendly"}
                      </div>
                    </div>
                  </div>

                  {/* Export Options */}
                  <button
                    onClick={triggerSimulateRender}
                    className="w-full py-4 bg-white text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all shadow-[0_4px_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>Mux & Render Presentation</span>
                  </button>

                </div>

              </div>
            </div>
          )}

          {/* PROJECT LIBRARY / ARCHIVES TAB */}
          {activeTab === "library" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-2xl font-black text-white">Your Xennials Masterpieces</h2>
                  <p className="text-xs text-zinc-400 mt-1">Saved drafts, rendered video packages, and prompt designs</p>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter saved projects..."
                    className="bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-9 pr-4 text-xs w-60 focus:ring-1 focus:ring-orange-500 text-zinc-300"
                  />
                </div>
              </div>

              {filteredVideos.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/10 rounded-[2rem] border border-dashed border-zinc-800">
                  <Database className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-sm font-semibold text-zinc-300">No saved projects found</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    Any successfully compiled scripts or rendered videos will be archived securely right here.
                  </p>
                  <button
                    onClick={() => setActiveTab("studio")}
                    className="mt-6 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold text-xs py-2.5 px-4 rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Start Creating Draft</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => handleLoadVideo(vid)}
                      className="group cursor-pointer bg-zinc-900/50 rounded-[2rem] border border-zinc-800 overflow-hidden hover:border-zinc-700 hover:shadow-lg transition-all flex flex-col h-full"
                    >
                      {/* Video Card Preview */}
                      <div className="relative aspect-video bg-zinc-950 overflow-hidden flex items-center justify-center">
                        {/* Backdrop style */}
                        <div className="absolute inset-0 z-0">
                          {vid.background.type === "color" ? (
                            <div style={{ background: vid.background.imageUrl }} className="w-full h-full" />
                          ) : (
                            <img
                              src={vid.background.imageUrl}
                              alt={vid.background.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover opacity-60"
                            />
                          )}
                        </div>

                        {/* Superimposed avatar image */}
                        <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 shadow-md">
                          <img
                            src={vid.avatar.imageUrl}
                            alt={vid.avatar.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Title overlay */}
                        <span className="absolute bottom-3 left-3 bg-zinc-950/80 border border-zinc-800 text-[9px] font-bold text-orange-400 px-2 py-0.5 rounded uppercase tracking-wider">
                          Ready to play
                        </span>
                      </div>

                      <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white truncate max-w-[200px] group-hover:text-orange-400 transition-colors">
                              {vid.title}
                            </h4>
                            <button
                              onClick={(e) => handleDeleteVideo(vid.id, e)}
                              className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400 transition-colors"
                              title="Delete Archive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                            "{vid.script.segments[0]?.text || "No script dialog."}"
                          </p>
                        </div>

                        <div className="pt-3 border-t border-zinc-850 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => handleExportVideo(vid, 'mp4', e)}
                              className="flex-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                              title="Export project as MP4 Video"
                            >
                              <Download className="w-3 h-3 text-orange-400" />
                              <span>Export MP4</span>
                            </button>
                            <button
                              onClick={(e) => handleExportVideo(vid, 'gif', e)}
                              className="flex-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                              title="Export project as Animated GIF"
                            >
                              <Download className="w-3 h-3 text-purple-400" />
                              <span>Export GIF</span>
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                            <span>{vid.createdAt}</span>
                            <span className="text-zinc-400 font-semibold">{vid.script.segments.length} tracks</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
