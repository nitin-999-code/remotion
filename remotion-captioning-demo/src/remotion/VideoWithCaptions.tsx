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
        (() => {
          const isKaraoke = preset.id === "karaoke-style";
          const start = currentCaption.startTime;
          const end = Math.max(currentCaption.endTime, start + 0.001);
          const progress = Math.max(0, Math.min(1, (currentTime - start) / (end - start)));
          const commonStyle: React.CSSProperties = {
            position: "absolute",
            [preset.style.position]: "20px",
            ...(preset.style.alignment === "left" && { left: "20px" }),
            ...(preset.style.alignment === "right" && { right: "20px" }),
            ...(preset.style.alignment === "center" && { left: "50%", transform: "translateX(-50%)" }),
            backgroundColor: isKaraoke ? "transparent" : preset.style.backgroundColor,
            color: preset.style.textColor,
            fontSize: preset.style.fontSize,
            padding: preset.style.padding,
            borderRadius: preset.style.borderRadius,
            fontFamily: preset.style.fontFamily,
            textAlign: preset.style.alignment as any,
            maxWidth: "80%",
            wordWrap: "break-word",
            lineHeight: 1.2,
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            zIndex: 10,
          };

          if (!isKaraoke) {
            return (
              <div style={commonStyle}>{currentCaption.text}</div>
            );
          }

          // Karaoke: two layers, base and highlight clipped to progress
          // Outer container (positioned), inner wrapper holds the overlayed text
          const containerStyle: React.CSSProperties = {
            ...commonStyle,
            backgroundColor: preset.style.backgroundColor,
            borderRadius: preset.style.borderRadius,
          };

          const contentWrapper: React.CSSProperties = {
            position: "relative",
            padding: preset.style.padding,
          };

          const baseStyle: React.CSSProperties = {
            position: "absolute",
            inset: 0,
            padding: preset.style.padding,
            // Dim base line so the highlight is clearly visible
            color: "rgba(255,255,255,0.35)",
            whiteSpace: "pre-wrap",
          };

          const highlightStyle: React.CSSProperties = {
            position: "absolute",
            inset: 0,
            padding: preset.style.padding,
            whiteSpace: "pre-wrap",
            color: "transparent",
            // Solid highlight up to progress, then transparent
            backgroundImage: `linear-gradient(to right, ${preset.style.textColor} ${Math.round(progress * 100)}%, rgba(0,0,0,0) ${Math.round(progress * 100)}%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text" as any,
            textShadow: "2px 2px 6px rgba(0,0,0,0.9)",
          };

          return (
            <div style={containerStyle}>
              <div style={contentWrapper}>
                <div style={baseStyle}>{currentCaption.text}</div>
                <div style={highlightStyle}>{currentCaption.text}</div>
                {/* Spacer to give the container height (matches text flow) */}
                <div style={{ visibility: "hidden", padding: preset.style.padding }}>
                  {currentCaption.text}
                </div>
              </div>
            </div>
          );
        })()
      )}
    </AbsoluteFill>
  );
};
