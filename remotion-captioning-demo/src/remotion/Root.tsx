import { Composition } from "remotion";
import { VideoWithCaptions } from "./VideoWithCaptions";

// Function to get export data from localStorage
const getExportData = () => {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem('remotion-export-data');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading export data:", error);
    }
  }
  return null;
};

export const RemotionRoot: React.FC = () => {
  const exportData = getExportData();
  
  return (
    <>
      <Composition
        id="VideoWithCaptions"
        component={VideoWithCaptions as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={(() => {
          const fps = 30;
          if (exportData && Array.isArray(exportData.captions) && exportData.captions.length > 0) {
            const lastEnd = exportData.captions[exportData.captions.length - 1].endTime || 10;
            return Math.max(1, Math.ceil(lastEnd * fps));
          }
          return 300; // default 10s at 30fps
        })()}
        fps={30}
        width={1280}
        height={720}
        defaultProps={exportData || {
          videoUrl: "",
          captions: [],
          preset: {
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
        }}
      />
    </>
  );
};
