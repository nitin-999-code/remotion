"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Player } from "@remotion/player";
import { CaptionData, CaptionPreset } from "@/app/page";
import { VideoWithCaptions } from "@/remotion/VideoWithCaptions";

interface VideoPreviewProps {
  videoUrl: string;
  captions: CaptionData[];
  preset: string;
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
      backgroundColor: "rgba(255, 0, 0, 0.8)",
      textColor: "white",
      fontSize: 28,
      padding: 20,
      borderRadius: 12,
      fontFamily: "Noto Sans, Noto Sans Devanagari, sans-serif",
    },
  },
};

export default function VideoPreview({ videoUrl, captions, preset }: VideoPreviewProps) {
  const selectedPreset = presets[preset] || presets["bottom-centered"];
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const fps = 30;

  // Load actual duration from the uploaded video metadata
  useEffect(() => {
    if (!videoUrl) {
      setDurationSec(null);
      return;
    }

    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.src = videoUrl;
    const onLoaded = () => {
      if (!Number.isNaN(videoEl.duration) && videoEl.duration !== Infinity) {
        setDurationSec(videoEl.duration);
      }
    };
    videoEl.addEventListener("loadedmetadata", onLoaded);
    // Trigger load
    videoEl.load();
    return () => {
      videoEl.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [videoUrl]);

  const videoProps = useMemo(() => ({
    videoUrl,
    captions,
    preset: selectedPreset,
  }), [videoUrl, captions, selectedPreset]);

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p>Upload a video to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <Player
          component={VideoWithCaptions}
          durationInFrames={(() => {
            const fallbackDuration = captions.length > 0
              ? captions[captions.length - 1].endTime
              : 10;
            const seconds = durationSec ?? fallbackDuration;
            return Math.max(1, Math.ceil(seconds * fps));
          })()}
          compositionWidth={1280}
          compositionHeight={720}
          fps={fps}
          inputProps={videoProps}
          controls
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>
      {/* Hidden video only to ensure metadata is loaded by the browser */}
      <video ref={hiddenVideoRef} src={videoUrl} preload="metadata" className="hidden" />
      
      {captions.length > 0 && (
        <div className="text-sm text-gray-600">
          <p>Showing {captions.length} captions with {selectedPreset.name} style</p>
        </div>
      )}
    </div>
  );
}
