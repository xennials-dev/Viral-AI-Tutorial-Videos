import React, { useState } from "react";
import { Background } from "../types";
import { PRESET_BACKGROUNDS } from "../presets";
import { Image, Sparkles, Wand2, RefreshCw, Check, Upload } from "lucide-react";

interface BackgroundGalleryProps {
  selectedBackground: Background;
  onSelectBackground: (background: Background) => void;
  customBackgrounds: Background[];
  onAddCustomBackground: (background: Background) => void;
}

export default function BackgroundGallery({
  selectedBackground,
  onSelectBackground,
  customBackgrounds,
  onAddCustomBackground,
}: BackgroundGalleryProps) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern office");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Custom Upload States
  const [uploadedBgName, setUploadedBgName] = useState("");
  const [isDraggingBg, setIsDraggingBg] = useState(false);

  const allBackgrounds = [...PRESET_BACKGROUNDS, ...customBackgrounds];

  const handleBgFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        const customBgId = `uploaded-bg-${Date.now()}`;
        const newBg: Background = {
          id: customBgId,
          name: uploadedBgName.trim() || file.name.split(".")[0] || "Uploaded Backdrop",
          imageUrl: result,
          type: "image",
          isCustom: true,
        };
        onAddCustomBackground(newBg);
        onSelectBackground(newBg);
        setUploadedBgName("");
        setNotice(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateBackground = async () => {
    if (!prompt.trim()) {
      setError("Please describe the background environment you want to generate.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/generate-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate background. Check server or network.");
      }

      const data = await response.json();
      if (data && data.imageUrl) {
        const customBgId = `custom-bg-${Date.now()}`;
        const newBg: Background = {
          id: customBgId,
          name: prompt.substring(0, 15) || "AI Custom Space",
          imageUrl: data.imageUrl,
          type: "image",
          isCustom: true,
        };

        onAddCustomBackground(newBg);
        onSelectBackground(newBg);
        setPrompt("");

        if (data.isFallback) {
          setNotice("Our AI image generation limit was reached. We dynamically rendered a beautiful backdrop scene matching your aesthetic description!");
        }
      } else {
        throw new Error("No background image returned.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not generate custom background.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 rounded-[2rem] border border-zinc-800 p-6 shadow-sm space-y-6">
      <div>
        <h3 className="font-semibold text-white flex items-center gap-2 text-base">
          <Image className="w-5 h-5 text-orange-400" />
          <span>Video Backdrop Studio</span>
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Pick stock backdrops, ambient gradients, or generate professional studio environments
        </p>
      </div>

      {/* List of backgrounds */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {allBackgrounds.map((bg) => {
          const isSelected = selectedBackground.id === bg.id;
          const isColor = bg.type === "color";

          return (
            <button
              key={bg.id}
              onClick={() => onSelectBackground(bg)}
              className={`group relative aspect-video rounded-xl border overflow-hidden flex flex-col justify-end transition-all p-2 ${
                isSelected
                  ? "border-orange-500 ring-2 ring-orange-500/20"
                  : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/30"
              }`}
            >
              {/* Actual Background visualization */}
              <div className="absolute inset-0 z-0">
                {isColor ? (
                  <div
                    style={{ background: bg.imageUrl }}
                    className="w-full h-full"
                  />
                ) : (
                  <img
                    src={bg.imageUrl}
                    alt={bg.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all"
                  />
                )}
              </div>

              {/* Tint for contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-transparent z-10" />

              {/* Checkmark indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-orange-500 rounded-full p-0.5 z-20 shadow-sm animate-fade-in">
                  <Check className="w-3 h-3 text-zinc-950" />
                </div>
              )}

              {/* Name */}
              <span className="relative z-10 text-[10px] font-bold text-white truncate w-full text-left">
                {bg.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Customizer Section: Generation & Uploading */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Backdrop Creator */}
        <div className="bg-zinc-900/40 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <h4 className="text-sm font-semibold text-white">Generate Custom AI Backdrop</h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Describe the background layout & ambiance
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A modern clean high-tech server control room with floating blue holographic dashboards"
                  className="w-full text-sm bg-zinc-950 text-zinc-200 rounded-xl border border-zinc-800 p-3 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-zinc-650"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Core Ambiance
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full text-xs bg-zinc-950 text-zinc-200 rounded-xl border border-zinc-800 p-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="modern clean office">Minimalist Modern Office Workspace</option>
                  <option value="futuristic tech studio">Futuristic High-Tech Studio</option>
                  <option value="cozy bookshelf library">Cozy Library with Bookshelves</option>
                  <option value="luxury creative designer loft">Luxury High-End Creative Loft</option>
                  <option value="abstract solid color backdrop">Abstract Studio Soft Lights Backdrop</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            {error && (
              <div className="p-2 mb-3 bg-red-950/50 border border-red-900/50 text-red-400 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}

            {notice && (
              <div className="p-2 mb-3 bg-orange-950/40 border border-orange-500/40 text-orange-400 text-[10px] rounded-lg font-medium leading-relaxed">
                {notice}
              </div>
            )}

            <button
              onClick={handleGenerateBackground}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Xennials is rendering your custom background...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Backdrop Scene</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Upload Custom Background */}
        <div className="bg-zinc-900/40 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-orange-400" />
              <h4 className="text-sm font-semibold text-white">Upload Custom Backdrop</h4>
            </div>
            <p className="text-[11px] text-zinc-400">
              Upload your own scenic images from your hard drive, USB, or local drive to use as customized set backdrops.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                Backdrop Name
              </label>
              <input
                type="text"
                value={uploadedBgName}
                onChange={(e) => setUploadedBgName(e.target.value)}
                placeholder="e.g. My Workspace Layout"
                className="w-full text-xs bg-zinc-950 text-zinc-200 rounded-xl border border-zinc-800 p-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder:text-zinc-700"
              />
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingBg(true);
              }}
              onDragLeave={() => setIsDraggingBg(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingBg(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleBgFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => document.getElementById("bg-file-input")?.click()}
              className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5 ${
                isDraggingBg
                  ? "border-orange-500 bg-orange-500/5"
                  : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40"
              }`}
            >
              <Upload className={`w-7 h-7 ${isDraggingBg ? "text-orange-400 animate-bounce" : "text-zinc-500 group-hover:text-zinc-400"}`} />
              <div className="text-xs font-semibold text-zinc-300">
                Drag & drop or <span className="text-orange-400 underline">browse</span>
              </div>
              <p className="text-[10px] text-zinc-500">Supports JPG, PNG, WEBP (Max 10MB)</p>
              <input
                id="bg-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleBgFileUpload(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
