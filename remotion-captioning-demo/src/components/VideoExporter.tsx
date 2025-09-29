"use client";

import { useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { CaptionData, CaptionPreset } from "@/app/page";

interface VideoExporterProps {
  videoUrl: string;
  captions: CaptionData[];
  preset: CaptionPreset;
}

export default function VideoExporter({ videoUrl, captions, preset }: VideoExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportInstructions, setExportInstructions] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Create export data
      const exportData = {
        videoUrl,
        captions,
        preset,
        timestamp: new Date().toISOString(),
      };

      // Save export data to localStorage for Remotion to use
      localStorage.setItem('remotion-export-data', JSON.stringify(exportData));

      // Generate instructions
      const instructions = [
        "1. Export data has been saved to your browser's local storage",
        "2. Open a new terminal and run: npm run remotion",
        "3. In the Remotion preview, select the 'VideoWithCaptions' composition",
        "4. The video URL, captions, and preset will be automatically loaded",
        "5. Click the 'Render' button in the Remotion interface",
        "6. Choose your output format and quality settings",
        "7. The rendered video will be saved to the 'out' directory"
      ];

      setExportInstructions(instructions);
      setShowSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Error preparing export:", error);
      alert("Export preparation failed: " + error);
    } finally {
      setIsExporting(false);
    }
  };

  const openRemotionPreview = () => {
    // Open Remotion preview in a new tab
    window.open("http://localhost:3001", "_blank");
  };

  return (
    <div className="space-y-4">
      {showSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-green-800 text-sm font-medium">
            Export data prepared successfully! Follow the instructions below.
          </span>
        </div>
      )}
      
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Preparing Export...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Export Video with Captions
          </>
        )}
      </button>

      {exportInstructions.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-900 mb-2">Export Instructions:</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            {exportInstructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={openRemotionPreview}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Open Remotion Preview
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText("npm run remotion");
                alert("Command copied to clipboard!");
              }}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              Copy Command
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
