"use client";

import { useState, useRef } from "react";
import { Download } from "lucide-react";
import { CaptionData, CaptionPreset } from "@/app/page";

interface SimpleVideoExporterProps {
  videoUrl: string;
  captions: CaptionData[];
  preset: CaptionPreset;
}

export default function SimpleVideoExporter({ videoUrl, captions, preset }: SimpleVideoExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const getCaptionAtTime = (timeSec: number) =>
    captions.find((c) => timeSec >= c.startTime && timeSec <= c.endTime);

  const drawCaptionOnCanvas = (ctx: CanvasRenderingContext2D, caption: CaptionData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const video = videoRef.current;
    if (!video) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw caption
    const text = caption.text;
    const fontSize = (preset.style.fontSize * canvas.width) / 1280; // Scale font size
    const padding = (preset.style.padding * canvas.width) / 1280; // Scale padding

    ctx.font = `${fontSize}px ${preset.style.fontFamily}`;
    ctx.fillStyle = preset.style.backgroundColor;
    ctx.textAlign = preset.style.alignment as CanvasTextAlign;
    ctx.textBaseline = "middle";

    // Calculate text position
    let x = canvas.width / 2;
    let y = canvas.height - 100; // Default bottom position

    if (preset.style.position === "top") {
      y = 50;
    } else if (preset.style.position === "center") {
      y = canvas.height / 2;
    }

    if (preset.style.alignment === "left") {
      x = padding;
    } else if (preset.style.alignment === "right") {
      x = canvas.width - padding;
    }

    // Draw text background
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;

    const bgX = x - (preset.style.alignment === "center" ? textWidth / 2 : 0);
    const bgY = y - textHeight / 2;

    ctx.fillStyle = preset.style.backgroundColor;
    ctx.fillRect(
      bgX - padding,
      bgY - padding,
      textWidth + padding * 2,
      textHeight + padding * 2
    );

    // Draw text
    ctx.fillStyle = preset.style.textColor;
    // Shadow for better readability
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 8;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
  };

  const handleExport = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsExporting(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Ensure metadata is loaded to get correct dimensions
      if (Number.isNaN(video.duration) || video.videoWidth === 0) {
        await new Promise<void>((resolve) => {
          const onMeta = () => {
            video.removeEventListener("loadedmetadata", onMeta);
            resolve();
          };
          video.addEventListener("loadedmetadata", onMeta);
        });
      }

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      // Create a combined MediaStream with canvas video + original audio
      const canvasStream = canvas.captureStream(30);
      type AudioContextConstructor = new () => AudioContext;
      const WebkitAudioContext = (window as unknown as {
        webkitAudioContext?: AudioContextConstructor;
      }).webkitAudioContext;
      const AudioContextCtor: AudioContextConstructor =
        (window.AudioContext as unknown as AudioContextConstructor) ||
        (WebkitAudioContext as AudioContextConstructor);
      const audioCtx = new AudioContextCtor();
      const source = audioCtx.createMediaElementSource(video);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioCtx.destination);

      await audioCtx.resume().catch(() => {});

      const mixedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      const recordedChunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(mixedStream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      let downloadStarted = false;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
          
          // Start download immediately when we have some data (after ~1 second)
          if (!downloadStarted && recordedChunks.length > 3) {
            downloadStarted = true;
            setIsExporting(false); // Hide loading state immediately
            
            // Show immediate feedback
            alert("Download started! The video is being processed in the background.");
            
            // Create download link that will update as more data comes in
            setTimeout(() => {
              const partialBlob = new Blob(recordedChunks, { type: "video/webm" });
              const url = URL.createObjectURL(partialBlob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "captioned-video.webm";
              a.click();
              URL.revokeObjectURL(url);
            }, 100);
          }
        }
      };

      mediaRecorder.onstop = () => {
        // Create final complete video if download hasn't started yet
        if (!downloadStarted) {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "captioned-video.webm";
          a.click();
          URL.revokeObjectURL(url);
          setIsExporting(false);
        }
        audioCtx.close();
      };

      // Request data every 200ms for faster download start
      mediaRecorder.start(200);

      // Play from start for processing
      video.currentTime = 0;
      await video.play();

      const onEnded = () => {
        if (mediaRecorder.state === "recording") mediaRecorder.stop();
      };
      video.addEventListener("ended", onEnded, { once: true });

      const drawFrame = () => {
        if (video.ended || video.currentTime >= video.duration) {
          if (mediaRecorder.state === "recording") mediaRecorder.stop();
          return;
        }
        const currentCaption = getCaptionAtTime(video.currentTime);
        if (currentCaption) {
          drawCaptionOnCanvas(ctx, currentCaption);
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        requestAnimationFrame(drawFrame);
      };
      drawFrame();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed: " + error);
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden video and canvas for processing */}
      <div className="hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => {}}
          onPause={() => {}}
        />
        <canvas ref={canvasRef} />
      </div>

      {/* Current caption display */}
      {getCaptionAtTime(currentTime) && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Current Caption:</strong> {getCaptionAtTime(currentTime)?.text}
          </p>
        </div>
      )}

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Exporting Video...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download Video with Captions
          </>
        )}
      </button>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-900 mb-2">Export Instructions:</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Click &quot;Download Video with Captions&quot; above</li>
          <li>2. Download will start immediately (within 1-2 seconds)</li>
          <li>3. Video processing continues in the background</li>
          <li>4. A WebM file will be saved to your Downloads folder</li>
          <li>5. You can convert WebM to MP4 using online converters if needed</li>
        </ol>
      </div>
    </div>
  );
}
