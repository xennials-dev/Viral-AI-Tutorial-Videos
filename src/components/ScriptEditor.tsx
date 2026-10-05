import React, { useState } from "react";
import { VideoScript, ScriptSegment } from "../types";
import { Wand2, Plus, Trash2, Edit3, Save, Sparkles, Clock, RefreshCw } from "lucide-react";

interface ScriptEditorProps {
  script: VideoScript;
  onScriptChange: (newScript: VideoScript) => void;
}

export default function ScriptEditor({ script, onScriptChange }: ScriptEditorProps) {
  // Generation parameters
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional and Engaging");
  const [duration, setDuration] = useState("60s");
  const [keyPoints, setKeyPoints] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Segment editing state
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ScriptSegment | null>(null);

  const tones = [
    "Professional and Engaging",
    "Enthusiastic and Energetic",
    "Empathetic and Warm",
    "Casual and Friendly",
    "Serious and Educational",
    "Corporate and Confident"
  ];

  const durations = [
    { label: "Short (30s)", value: "30s" },
    { label: "Medium (60s)", value: "60s" },
    { label: "Long (90s)", value: "90s" }
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please specify a topic or concept for your video.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, audience, tone, duration, keyPoints }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate script. Please check your network and Gemini API keys.");
      }

      const data = await res.json();
      if (data && data.segments) {
        onScriptChange(data);
        if (data.isFallback) {
          setNotice("Our AI script generation limit was reached. We dynamically generated a professional, structured script matching your topic so you can continue!");
        }
      } else {
        throw new Error("Invalid script format returned.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during AI script generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const startEditSegment = (segment: ScriptSegment) => {
    setEditingSegmentId(segment.id);
    setEditForm({ ...segment });
  };

  const handleSaveSegment = () => {
    if (!editForm) return;

    const updatedSegments = script.segments.map((seg) =>
      seg.id === editForm.id ? editForm : seg
    );

    onScriptChange({
      ...script,
      segments: updatedSegments,
    });

    setEditingSegmentId(null);
    setEditForm(null);
  };

  const handleAddSegment = () => {
    const newId = `seg_${Date.now()}`;
    const newSegment: ScriptSegment = {
      id: newId,
      text: "Write your new spokesperson dialogue here.",
      visualDescription: "Describe the avatar gesture or slide background here.",
      caption: "Add subtitles/captions here.",
      emotion: "friendly",
    };

    onScriptChange({
      ...script,
      segments: [...script.segments, newSegment],
    });

    startEditSegment(newSegment);
  };

  const handleDeleteSegment = (id: string) => {
    const filtered = script.segments.filter((seg) => seg.id !== id);
    onScriptChange({
      ...script,
      segments: filtered,
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Section */}
      <div className="bg-zinc-900/50 rounded-[2rem] border border-zinc-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Script Director</h3>
              <p className="text-xs text-zinc-400">Draft full scripts tailored to your brand in seconds</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                What is your video about? *
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Explaining Zineols AI, our advanced text-to-speech avatar generator that lets you build human-like presentations."
                className="w-full text-sm rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200 p-3 h-20 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Key Points / Product Details (Optional)
              </label>
              <input
                type="text"
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="e.g. Save 90% production costs, supports 50 languages, instant exports."
                className="w-full text-sm rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200 p-3 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-zinc-650"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Target Audience (Optional)
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Content Creators, Marketing Executives, Teachers"
                className="w-full text-sm rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200 p-3 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-zinc-650"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Video Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full text-sm rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200 p-3 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  {tones.map((t) => (
                    <option key={t} value={t} className="bg-zinc-905">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Duration Goal
                </label>
                <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  {durations.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`flex-1 text-xs py-2 px-1 rounded-lg text-center font-medium transition-all ${
                        duration === d.value
                          ? "bg-orange-500 text-zinc-950 shadow-sm font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {d.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-900/50 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {notice && (
          <div className="mt-4 p-3 rounded-xl bg-orange-950/40 border border-orange-500/40 text-orange-400 text-xs font-medium leading-relaxed">
            {notice}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-extrabold py-3.5 px-4 rounded-xl hover:opacity-95 shadow-[0_0_15px_rgba(249,115,22,0.2)] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Zineols AI is writing your script...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Generate AI Script Draft</span>
            </>
          )}
        </button>
      </div>

      {/* Script Breakdown & Manual Editor */}
      <div className="bg-zinc-900/50 rounded-[2rem] border border-zinc-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span>Script Timeline</span>
              {script.title && (
                <span className="text-xs font-normal text-orange-400 bg-orange-500/10 border border-orange-500/20 py-1 px-2.5 rounded-full">
                  {script.title}
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Arrange and fine-tune each talking point segment</p>
          </div>
          <button
            onClick={handleAddSegment}
            className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2 px-3 rounded-lg transition-all border border-zinc-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slide/Segment</span>
          </button>
        </div>

        {script.segments.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-300">No script segments yet</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Use the AI script director above to auto-generate a presentation draft, or click "Add Slide/Segment" to write custom script.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {script.segments.map((seg, index) => {
              const isEditing = editingSegmentId === seg.id;

              return (
                <div
                  key={seg.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isEditing
                      ? "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500/30 shadow-sm"
                      : "border-zinc-800 hover:border-zinc-750 bg-zinc-900/10"
                  }`}
                >
                  {isEditing && editForm ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-orange-400">
                          Editing Segment {index + 1}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingSegmentId(null);
                              setEditForm(null);
                            }}
                            className="text-xs font-medium text-zinc-400 hover:text-white py-1 px-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveSegment}
                            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                          Spoken Script (Spokesperson Dialogue)
                        </label>
                        <textarea
                          value={editForm.text}
                          onChange={(e) =>
                            setEditForm({ ...editForm, text: e.target.value })
                          }
                          className="w-full text-sm rounded-lg border border-zinc-850 p-3 h-20 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-zinc-950 text-zinc-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">
                            Screen Subtitles / Captions
                          </label>
                          <input
                            type="text"
                            value={editForm.caption}
                            onChange={(e) =>
                              setEditForm({ ...editForm, caption: e.target.value })
                            }
                            className="w-full text-sm rounded-lg border border-zinc-850 p-2 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-zinc-950 text-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">
                            Visual / Slide Directives
                          </label>
                          <input
                            type="text"
                            value={editForm.visualDescription || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                visualDescription: e.target.value,
                              })
                            }
                            placeholder="e.g. Background slides showing cost statistics..."
                            className="w-full text-sm rounded-lg border border-zinc-850 p-2 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-zinc-950 text-zinc-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">
                            Avatar Emotion Style
                          </label>
                          <select
                            value={editForm.emotion || "friendly"}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                emotion: e.target.value as any,
                              })
                            }
                            className="w-full text-sm rounded-lg border border-zinc-850 p-2 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-zinc-950 text-zinc-200"
                          >
                            <option value="friendly">Friendly & Warm</option>
                            <option value="confident">Confident & Decisive</option>
                            <option value="enthusiastic">Enthusiastic & Bright</option>
                            <option value="empathetic">Empathetic & Soft</option>
                            <option value="serious">Serious & Authoritative</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">
                            Speech Rate
                          </label>
                          <select
                            value={editForm.voiceSpeed || 1.0}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                voiceSpeed: parseFloat(e.target.value),
                              })
                            }
                            className="w-full text-sm rounded-lg border border-zinc-850 p-2 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-zinc-950 text-zinc-200"
                          >
                            <option value="0.8">Slow (0.8x)</option>
                            <option value="1.0">Normal (1.0x)</option>
                            <option value="1.15">Brisk (1.15x)</option>
                            <option value="1.25">Fast (1.25x)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-200 text-xs font-semibold">
                            {index + 1}
                          </span>
                          {seg.emotion && (
                            <span className="text-[10px] uppercase tracking-wider font-semibold bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-md">
                              {seg.emotion}
                            </span>
                          )}
                          {seg.voiceSpeed && seg.voiceSpeed !== 1.0 && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-semibold">
                              {seg.voiceSpeed}x Speed
                            </span>
                          )}
                        </div>

                        <p className="text-zinc-200 text-sm leading-relaxed font-semibold">
                          "{seg.text}"
                        </p>

                        <div className="text-xs space-y-1 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/40">
                          <div>
                            <span className="font-semibold text-zinc-400">Subtitles:</span>{" "}
                            <span className="text-zinc-300">{seg.caption}</span>
                          </div>
                          {seg.visualDescription && (
                            <div>
                              <span className="font-semibold text-zinc-400">Visuals:</span>{" "}
                              <span className="text-zinc-300">{seg.visualDescription}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEditSegment(seg)}
                          className="p-1.5 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-all"
                          title="Edit Segment"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSegment(seg.id)}
                          className="p-1.5 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 rounded-lg transition-all"
                          title="Delete Segment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
