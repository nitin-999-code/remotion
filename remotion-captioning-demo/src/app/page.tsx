"use client";

import { useState } from "react";
import { Upload, Play, Download, Settings, FileVideo } from "lucide-react";
import VideoUploader from "@/components/VideoUploader";
import CaptionEditor from "@/components/CaptionEditor";
import VideoPreview from "@/components/VideoPreview";
import CaptionPresets from "@/components/CaptionPresets";
import VideoExporter from "@/components/VideoExporter";
import SimpleVideoExporter from "@/components/SimpleVideoExporter";

export interface CaptionData {
  text: string;
  startTime: number;
  endTime: number;
}

export interface CaptionPreset {
  id: string;
  name: string;
  style: {
    position: "bottom" | "top" | "center";
    alignment: "left" | "center" | "right";
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    padding: number;
    borderRadius: number;
    fontFamily: string;
  };
}

const presets: Record<string, CaptionPreset> = {
  "bottom-centered": {
    id: "bottom-centered",
    name: "Bottom Centered",
    style: {
      position: "bottom",
      alignment: "center",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      textColor: "white",
      fontSize: 24,
      padding: 16,
      borderRadius: 8,
      fontFamily: "Noto Sans, Noto Sans Devanagari, sans-serif",
    },
  },
  "top-bar": {
    id: "top-bar",
    name: "Top Bar",
    style: {
      position: "top",
      alignment: "center",
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      textColor: "white",
      fontSize: 20,
      padding: 12,
      borderRadius: 0,
      fontFamily: "Noto Sans, Noto Sans Devanagari, sans-serif",
    },
  },
  "karaoke-style": {
    id: "karaoke-style",
    name: "Karaoke Style",
    style: {
      position: "center",
      alignment: "center",
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      textColor: "#FFD700",
      fontSize: 32,
      padding: 24,
      borderRadius: 16,
      fontFamily: "Noto Sans, Noto Sans Devanagari, sans-serif",
    },
  },
};

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [captions, setCaptions] = useState<CaptionData[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("bottom-centered");
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [useSimpleExport, setUseSimpleExport] = useState(true);
  const [captionError, setCaptionError] = useState<string>("");

  const handleVideoUpload = (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleGenerateCaptions = async () => {
    if (!videoFile) return;
    
    setIsGeneratingCaptions(true);
    try {
      const form = new FormData();
      form.append("file", videoFile);

      const response = await fetch("/api/generate-captions", {
        method: "POST",
        body: form,
      });
      
      const data = await response.json();
      if (response.ok && Array.isArray(data?.captions) && data.captions.length > 0) {
        setCaptions(data.captions);
        setCaptionError("");
      } else {
        // If OpenAI quota exceeded, fall back to local transcription
        const message: string = data?.error || "";
        if (message.includes("insufficient_quota") || message.includes("quota")) {
          try {
            // Lazy-load transformers to keep initial bundle small
            const { pipeline } = await import("@xenova/transformers");
            const transcriber = (await pipeline(
              "automatic-speech-recognition",
              // Tiny multilingual model keeps download smaller; can be swapped to small/base
              "Xenova/whisper-tiny"
            )) as unknown as (file: Blob, opts: { chunk_length_s: number; return_timestamps: boolean }) => Promise<{ chunks?: { text?: string; timestamp?: [number, number] }[] }>;
            const result = await transcriber(videoFile, {
              chunk_length_s: 30,
              return_timestamps: true,
            });
            const segments = (result?.chunks || []).map((s) => ({
              text: String(s.text || "").trim(),
              startTime: typeof s.timestamp?.[0] === "number" ? s.timestamp[0] : 0,
              endTime: typeof s.timestamp?.[1] === "number" ? s.timestamp[1] : 0,
            }));
            if (segments.length > 0) {
              setCaptions(segments);
              setCaptionError("Using local STT (no API) — model download may take time.");
            } else {
              setCaptions([]);
              setCaptionError("Local STT returned no captions.");
            }
          } catch (localErr) {
            console.error("Local STT failed:", localErr);
            setCaptions([]);
            setCaptionError("STT quota exceeded and local STT failed. Please add API credit or try again.");
          }
        } else {
          setCaptions([]);
          setCaptionError(data?.error || "No captions returned by STT.");
        }
      }
    } catch (error) {
      console.error("Error generating captions:", error);
      setCaptions([]);
      setCaptionError("Caption API failed. Check server logs and API key.");
    } finally {
      setIsGeneratingCaptions(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Remotion Captioning Demo
          </h1>
          <p className="text-lg text-gray-600">
            Upload an MP4 video and generate captions with multiple style presets
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Video Upload */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileVideo className="w-5 h-5" />
                Video Upload
              </h2>
              <VideoUploader onVideoUpload={handleVideoUpload} />
              {videoFile && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ {videoFile.name} uploaded successfully
                  </p>
                </div>
              )}
            </div>

            {/* Caption Generation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Caption Generation
              </h2>
              {captionError && (
                <div className="mb-3 p-3 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-900 text-sm">
                  {captionError}
                </div>
              )}
              <button
                onClick={handleGenerateCaptions}
                disabled={!videoFile || isGeneratingCaptions}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGeneratingCaptions ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Auto-generate Captions
                  </>
                )}
              </button>
            </div>

            {/* Caption Presets */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Caption Styles</h2>
              <CaptionPresets
                selectedPreset={selectedPreset}
                onPresetChange={setSelectedPreset}
              />
            </div>

            {/* Caption Editor */}
            {captions.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Edit Captions</h2>
                <CaptionEditor
                  captions={captions}
                  onCaptionsChange={setCaptions}
                />
              </div>
            )}

            {/* Export */}
            {videoFile && captions.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Video
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Export Method:</span>
                    <button
                      onClick={() => setUseSimpleExport(true)}
                      className={`px-3 py-1 text-xs rounded ${
                        useSimpleExport
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Direct Download
                    </button>
                    <button
                      onClick={() => setUseSimpleExport(false)}
                      className={`px-3 py-1 text-xs rounded ${
                        !useSimpleExport
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Remotion Preview
                    </button>
                  </div>
                </div>
                
                {useSimpleExport ? (
                  <SimpleVideoExporter
                    videoUrl={videoUrl}
                    captions={captions}
                    preset={presets[selectedPreset] || presets["bottom-centered"]}
                  />
                ) : (
                  <VideoExporter
                    videoUrl={videoUrl}
                    captions={captions}
                    preset={presets[selectedPreset] || presets["bottom-centered"]}
                  />
                )}
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Preview
            </h2>
            <VideoPreview
              videoUrl={videoUrl}
              captions={captions}
              preset={selectedPreset}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
