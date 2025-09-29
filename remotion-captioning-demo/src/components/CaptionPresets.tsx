"use client";

import { CaptionPreset } from "@/app/page";

interface CaptionPresetsProps {
  selectedPreset: string;
  onPresetChange: (presetId: string) => void;
}

const presets: CaptionPreset[] = [
  {
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
  {
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
  {
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
];

export default function CaptionPresets({ selectedPreset, onPresetChange }: CaptionPresetsProps) {
  return (
    <div className="space-y-3">
      {presets.map((preset) => (
        <div
          key={preset.id}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedPreset === preset.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => onPresetChange(preset.id)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{preset.name}</h3>
              <p className="text-sm text-gray-500">
                {preset.style.position} • {preset.style.alignment} • {preset.style.fontSize}px
              </p>
            </div>
            <div
              className="w-8 h-8 rounded border-2"
              style={{
                backgroundColor: preset.style.backgroundColor,
                borderColor: preset.style.textColor,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

