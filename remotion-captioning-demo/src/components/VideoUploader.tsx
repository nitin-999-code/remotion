"use client";

import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";

interface VideoUploaderProps {
  onVideoUpload: (file: File) => void;
}

export default function VideoUploader({ onVideoUpload }: VideoUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFile = useCallback((file: File) => {
    if (file.type !== "video/mp4") {
      setError("Please upload an MP4 file only.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError("File size must be less than 100MB.");
      return;
    }

    setError("");
    onVideoUpload(file);
  }, [onVideoUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop your MP4 video here
        </p>
        <p className="text-sm text-gray-500 mb-4">
          or click to browse files
        </p>
        <input
          type="file"
          accept=".mp4,video/mp4"
          onChange={handleFileInput}
          className="hidden"
          id="video-upload"
        />
        <label
          htmlFor="video-upload"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Choose File
        </label>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <X className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

