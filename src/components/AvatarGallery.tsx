import React, { useState } from "react";
import { Avatar } from "../types";
import { PRESET_AVATARS } from "../presets";
import { User, Sparkles, Wand2, RefreshCw, Check, Upload } from "lucide-react";

interface AvatarGalleryProps {
  selectedAvatar: Avatar;
  onSelectAvatar: (avatar: Avatar) => void;
  customAvatars: Avatar[];
  onAddCustomAvatar: (avatar: Avatar) => void;
}

export default function AvatarGallery({
  selectedAvatar,
  onSelectAvatar,
  customAvatars,
  onAddCustomAvatar,
}: AvatarGalleryProps) {
  const [prompt, setPrompt] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "nonbinary">("female");
  const [style, setStyle] = useState("photorealistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Custom Upload States
  const [uploadedName, setUploadedName] = useState("");
  const [uploadedGender, setUploadedGender] = useState<"female" | "male" | "nonbinary">("female");
  const [isDragging, setIsDragging] = useState(false);

  const allAvatars = [...PRESET_AVATARS, ...customAvatars];

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        const customAvatarId = `uploaded-avatar-${Date.now()}`;
        const newAvatar: Avatar = {
          id: customAvatarId,
          name: uploadedName.trim() || file.name.split(".")[0] || "Uploaded Presenter",
          gender: uploadedGender,
          imageUrl: result,
          voice: uploadedGender === "female" ? "Kore" : "Zephyr",
          isCustom: true,
        };
        onAddCustomAvatar(newAvatar);
        onSelectAvatar(newAvatar);
        setUploadedName("");
        setNotice(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateCustomAvatar = async () => {
    if (!prompt.trim()) {
      setError("Please describe the avatar you want to generate.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/generate-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, gender, style }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate avatar. Check network or server configuration.");
      }

      const data = await response.json();
      if (data && data.imageUrl) {
        const customAvatarId = `custom-avatar-${Date.now()}`;
        const newAvatar: Avatar = {
          id: customAvatarId,
          name: prompt.substring(0, 15) || "AI Custom",
          gender,
          imageUrl: data.imageUrl,
          voice: gender === "female" ? "Kore" : "Zephyr",
          isCustom: true,
        };

        onAddCustomAvatar(newAvatar);
        onSelectAvatar(newAvatar);
        setPrompt("");

        if (data.isFallback) {
          setNotice("Our AI image generation limit was reached. We dynamically selected a high-quality, professional presenter matching your description so you can continue!");
        }
      } else {
        throw new Error("Invalid image format returned from server.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not generate avatar.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 rounded-[2rem] border border-zinc-800 p-6 shadow-sm space-y-6">
      <div>
        <h3 className="font-semibold text-white flex items-center gap-2 text-base">
          <User className="w-5 h-5 text-orange-400" />
          <span>Presenter Avatars</span>
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Select a hyper-realistic AI spokesperson or generate a custom presenter
        </p>
      </div>

      {/* Grid of Avatars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {allAvatars.map((av) => {
          const isSelected = selectedAvatar.id === av.id;

          return (
            <button
              key={av.id}
              onClick={() => onSelectAvatar(av)}
              className={`group relative flex flex-col items-center p-2.5 rounded-2xl border transition-all ${
                isSelected
                  ? "border-orange-500 ring-2 ring-orange-500/20 bg-orange-500/5"
                  : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/30"
              }`}
            >
              {/* Image Circle */}
              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-2 border border-zinc-800 bg-zinc-950">
                <img
                  src={av.imageUrl}
                  alt={av.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center animate-fade-in">
                    <Check className="w-6 h-6 text-orange-400" />
                  </div>
                )}
              </div>

              {/* Presenter Name */}
              <span className="text-xs font-semibold text-zinc-200 truncate w-full text-center">
                {av.name}
              </span>
              <span className="text-[10px] text-zinc-500 capitalize">
                {av.gender} {av.isCustom && "• AI"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Customizer Section: Generation & Uploading */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Custom Avatar Generator */}
        <div className="bg-zinc-900/40 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
              <h4 className="text-sm font-semibold text-white">Generate Custom AI Presenter</h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Describe the spokesperson appearance & attire
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A friendly Asian businesswoman wearing a smart grey blazer and glasses"
                  className="w-full text-sm bg-zinc-950 text-zinc-200 rounded-xl border border-zinc-800 p-3 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-zinc-650"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Gender Look
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full text-xs bg-zinc-950 text-zinc-200 rounded-xl border border-zinc-800 p-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="female">Female Presenter</option>
                    <option value="male">Male Presenter</option>
                    <option value="nonbinary">Non-binary Presenter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Artistic Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full text-xs bg-zinc-950 text-zinc-200 rounded-xl border border-zinc-800 p-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="photorealistic">Photorealistic Studio Portrait</option>
                    <option value="3D Pixar animated">3D Pixar-Style character</option>
                    <option value="anime styled portrait">Anime Cartoon portrait</option>
                    <option value="watercolor minimalist painting">Watercolor Minimalist painting</option>
                  </select>
                </div>
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
              onClick={handleGenerateCustomAvatar}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Xennials is creating your custom face...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Presenter Face</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Upload Custom Presenter */}
        <div className="bg-zinc-900/40 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-orange-400" />
              <h4 className="text-sm font-semibold text-white">Upload Custom Presenter</h4>
            </div>
            <p className="text-[11px] text-zinc-400">
              Upload your own portrait photo from your hard drive, USB, or local drive to use as a personalized talking host.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Presenter Name
                </label>
                <input
                  type="text"
                  value={uploadedName}
                  onChange={(e) => setUploadedName(e.target.value)}
                  placeholder="e.g. My Custom Avatar"
                  className="w-full text-xs bg-zinc-950 text-zinc-200 rounded-xl border border-zinc-800 p-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder:text-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Voice Gender Style
                </label>
                <select
                  value={uploadedGender}
                  onChange={(e) => setUploadedGender(e.target.value as any)}
                  className="w-full text-xs bg-zinc-950 text-zinc-200 rounded-xl border border-zinc-800 p-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="female">Female Voice</option>
                  <option value="male">Male Voice</option>
                  <option value="nonbinary">Non-binary Voice</option>
                </select>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => document.getElementById("avatar-file-input")?.click()}
              className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5 ${
                isDragging
                  ? "border-orange-500 bg-orange-500/5"
                  : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40"
              }`}
            >
              <Upload className={`w-7 h-7 ${isDragging ? "text-orange-400 animate-bounce" : "text-zinc-500 group-hover:text-zinc-400"}`} />
              <div className="text-xs font-semibold text-zinc-300">
                Drag & drop or <span className="text-orange-400 underline">browse</span>
              </div>
              <p className="text-[10px] text-zinc-500">Supports JPG, PNG, WEBP (Max 5MB)</p>
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
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
