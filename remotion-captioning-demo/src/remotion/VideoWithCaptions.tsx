import { useVideoConfig, useCurrentFrame, Video, AbsoluteFill } from "remotion";
import { CaptionData, CaptionPreset } from "@/app/page";

interface VideoWithCaptionsProps {
  videoUrl: string;
  captions: CaptionData[];
  preset: CaptionPreset;
}

export const VideoWithCaptions: React.FC<VideoWithCaptionsProps> = ({
  videoUrl,
  captions = [],
  preset,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const currentTime = frame / fps;

  // Find the current caption to display
  const currentCaption = captions.find(
    (caption) => currentTime >= caption.startTime && currentTime <= caption.endTime
  );

  return (
    <AbsoluteFill>
      {/* Video Background */}
      <Video
        src={videoUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Caption Overlay */}
      {currentCaption && (
        <div
          style={{
            position: "absolute",
            [preset.style.position]: "20px",
            ...(preset.style.alignment === "left" && { left: "20px" }),
            ...(preset.style.alignment === "right" && { right: "20px" }),
            ...(preset.style.alignment === "center" && { 
              left: "50%",
              transform: "translateX(-50%)"
            }),
            backgroundColor: preset.style.backgroundColor,
            color: preset.style.textColor,
            fontSize: preset.style.fontSize,
            padding: preset.style.padding,
            borderRadius: preset.style.borderRadius,
            fontFamily: preset.style.fontFamily,
            textAlign: preset.style.alignment,
            maxWidth: "80%",
            wordWrap: "break-word",
            lineHeight: 1.2,
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            zIndex: 10,
          }}
        >
          {currentCaption.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
