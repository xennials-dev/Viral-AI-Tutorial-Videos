import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const PORT = 3000;

  // Initialize Gemini client on the server
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route: Script Writer Assistant
  app.post("/api/generate-script", async (req, res) => {
    try {
      const { topic, audience, tone, duration = "60s", keyPoints = "" } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const prompt = `Write a professional spokesperson video script.
Topic: ${topic}
Target Audience: ${audience || "General"}
Tone: ${tone || "Professional and Engaging"}
Estimated Duration: ${duration}
Key Points to cover: ${keyPoints || "None specified, please expand naturally"}

Generate a highly structured JSON response with the following format:
{
  "title": "A catchy title for the video",
  "estimatedDuration": "60 seconds",
  "segments": [
    {
      "id": "intro",
      "text": "The spoken words that the spokesperson will say. Keep it natural, punchy, and captivating. Do not use placeholders.",
      "visualDescription": "Instructions for background, overlay or presenter movement (e.g. 'A modern brightly lit office backdrop. Presenter smiles and gestures warmly.')",
      "caption": "Text that should appear on screen as subtitles/captions during this segment.",
      "emotion": "friendly"
    },
    {
      "id": "body_1",
      "text": "The main point being explained. Fully written out words.",
      "visualDescription": "Instructions for backdrop, charts or text overlays.",
      "caption": "Subtitles on screen.",
      "emotion": "confident"
    },
    {
      "id": "body_2",
      "text": "Supporting details or another key point explained beautifully.",
      "visualDescription": "Instructions for visuals.",
      "caption": "Subtitles on screen.",
      "emotion": "enthusiastic"
    },
    {
      "id": "cta",
      "text": "The final call to action. Summarize and guide the viewer on what to do next.",
      "visualDescription": "Visual transitions and final slide cues.",
      "caption": "Subtitles on screen.",
      "emotion": "friendly"
    }
  ]
}

Ensure the text is fully written out (no placeholders like [Insert Name]). Return ONLY raw JSON matching this schema, without any markdown formatting.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const scriptJson = JSON.parse(responseText);
      res.json({ ...scriptJson, isFallback: false });
    } catch (error: any) {
      console.error("Error generating script, serving curated professional fallback script:", error);
      const topicStr = req.body.topic || "Innovative Presentation";
      const fallbackScript = {
        title: `${topicStr} - Professional Overview`,
        estimatedDuration: req.body.duration || "60s",
        isFallback: true,
        segments: [
          {
            id: "intro",
            text: `Welcome everyone. Today we are exploring ${topicStr}. This is designed specifically for ${req.body.audience || "our valued audience"} with a ${req.body.tone || "professional"} approach.`,
            visualDescription: "Modern corporate backdrop. Presenter smiles and gestures warmly.",
            caption: `Welcome to our overview on ${topicStr}`,
            emotion: "friendly"
          },
          {
            id: "body_1",
            text: `Let's dive into the core details. ${req.body.keyPoints ? `Key highlights include: ${req.body.keyPoints}.` : "We examine the foundational pillars that drive success, efficiency, and clarity in this domain."}`,
            visualDescription: "Switching to high-tech minimalist studio with data charts.",
            caption: "Core Pillars & Strategic Insights",
            emotion: "confident"
          },
          {
            id: "body_2",
            text: "By implementing these strategies, teams and individuals can dramatically improve workflows, elevate engagement, and achieve remarkable long-term outcomes.",
            visualDescription: "Presenter speaks with enthusiastic hand gestures.",
            caption: "Driving Measurable Results",
            emotion: "enthusiastic"
          },
          {
            id: "cta",
            text: `Thank you for watching this introduction to ${topicStr}. Be sure to connect with us, explore our resources, and take the next step today!`,
            visualDescription: "Warm closing smile and outro branding.",
            caption: "Get Started Today",
            emotion: "friendly"
          }
        ]
      };
      res.json(fallbackScript);
    }
  });

  // API Route: Generate Avatar (Image generation using gemini-2.5-flash-image)
  app.post("/api/generate-avatar", async (req, res) => {
    try {
      const { prompt, gender, style = "photorealistic" } = req.body;
      
      const promptModifier = `High-quality close-up studio portrait of a friendly professional spokesperson, ${gender || "person"}, ${style} style, clean corporate attire, neutral studio background, realistic lighting, looking at the camera, smiling warmly. Detailed features, 8k resolution. Prompt details: ${prompt || "professional presenter"}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: promptModifier,
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      let base64Image = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }

      if (base64Image) {
        res.json({ imageUrl: `data:image/png;base64,${base64Image}`, isFallback: false });
      } else {
        res.status(500).json({ error: "No image data returned from Gemini" });
      }
    } catch (error: any) {
      console.error("Error generating avatar, serving curated fallback portrait:", error);
      const genderStr = req.body.gender || "person";
      const fallbackUrl = `https://images.unsplash.com/featured/600x600/?portrait,professional,${encodeURIComponent(genderStr)}`;
      res.json({
        imageUrl: fallbackUrl,
        isFallback: true,
        fallbackReason: error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 ? "quota" : "error"
      });
    }
  });

  // API Route: Generate Background Scene (Image generation using gemini-2.5-flash-image)
  app.post("/api/generate-background", async (req, res) => {
    try {
      const { prompt, style = "modern office" } = req.body;
      
      const promptModifier = `Cinematic wide shot of an empty ${style} studio background, clean aesthetic, depth of field, professional lighting, perfect for overlaying a presenter. Details: ${prompt || "bright minimalist workspace, plants, soft ambient lighting"}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: promptModifier,
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          },
        },
      });

      let base64Image = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }

      if (base64Image) {
        res.json({ imageUrl: `data:image/png;base64,${base64Image}`, isFallback: false });
      } else {
        res.status(500).json({ error: "No image data returned from Gemini" });
      }
    } catch (error: any) {
      console.error("Error generating background, serving curated fallback backdrop:", error);
      const styleStr = req.body.style || "office";
      const fallbackUrl = `https://images.unsplash.com/featured/1600x900/?workspace,studio,${encodeURIComponent(styleStr)}`;
      res.json({
        imageUrl: fallbackUrl,
        isFallback: true,
        fallbackReason: error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 ? "quota" : "error"
      });
    }
  });

  // API Route: Generate Audio TTS (using gemini-3.1-flash-tts-preview)
  app.post("/api/generate-audio", async (req, res) => {
    try {
      const { text, voice = "Kore" } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      // Voice choices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audioData: base64Audio });
      } else {
        res.status(500).json({ error: "Failed to generate TTS audio data" });
      }
    } catch (error: any) {
      console.error("Error generating speech:", error);
      res.status(500).json({ error: error.message || "Failed to generate speech" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
