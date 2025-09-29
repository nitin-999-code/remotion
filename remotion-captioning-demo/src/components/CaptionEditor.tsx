"use client";

import { useState } from "react";
import { CaptionData } from "@/app/page";
import { Edit3, Trash2, Plus } from "lucide-react";

interface CaptionEditorProps {
  captions: CaptionData[];
  onCaptionsChange: (captions: CaptionData[]) => void;
}

export default function CaptionEditor({ captions, onCaptionsChange }: CaptionEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(captions[index].text);
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      const newCaptions = [...captions];
      newCaptions[editingIndex].text = editText;
      onCaptionsChange(newCaptions);
      setEditingIndex(null);
      setEditText("");
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditText("");
  };

  const handleDelete = (index: number) => {
    const newCaptions = captions.filter((_, i) => i !== index);
    onCaptionsChange(newCaptions);
  };

  const handleAdd = () => {
    const newCaption: CaptionData = {
      text: "New caption",
      startTime: captions.length > 0 ? captions[captions.length - 1].endTime : 0,
      endTime: captions.length > 0 ? captions[captions.length - 1].endTime + 3 : 3,
    };
    onCaptionsChange([...captions, newCaption]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Captions ({captions.length})</h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Caption
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2">
        {captions.map((caption, index) => (
          <div
            key={index}
            className="p-3 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">
                  {formatTime(caption.startTime)} - {formatTime(caption.endTime)}
                </div>
                {editingIndex === index ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      rows={2}
                      placeholder="Enter caption text..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-900 font-mono">
                    {caption.text}
                  </div>
                )}
              </div>
              {editingIndex !== index && (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {captions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No captions yet. Generate captions or add them manually.</p>
        </div>
      )}
    </div>
  );
}

