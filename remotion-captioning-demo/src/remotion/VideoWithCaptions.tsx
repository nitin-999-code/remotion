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
            textAlign: preset.style.alignment as React.CSSProperties["textAlign"],
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

          // Karaoke: word-by-word highlighting
          const containerStyle: React.CSSProperties = {
            ...commonStyle,
            backgroundColor: preset.style.backgroundColor,
            borderRadius: preset.style.borderRadius,
          };

          const contentWrapper: React.CSSProperties = {
            padding: preset.style.padding,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: preset.style.alignment === "center" ? "center" : 
                           preset.style.alignment === "right" ? "flex-end" : "flex-start",
            gap: "0.3em",
            lineHeight: 1.2,
            alignItems: "baseline",
          };

          // Split text into words for word-by-word highlighting
          const words = currentCaption.text.trim().split(/\s+/);
          const totalWords = words.length;
          
          // Calculate which words should be highlighted based on progress
          const wordsToHighlight = Math.floor(progress * totalWords);
          
          // For smoother animation, calculate partial progress for current word
          const wordProgress = (progress * totalWords) % 1;

          return (
            <div style={containerStyle}>
              <div style={contentWrapper}>
                {words.map((word, index) => {
                  // Determine the state of this word
                  const isFullyHighlighted = index < wordsToHighlight;
                  const isCurrentWord = index === wordsToHighlight;
                  const isPartiallyHighlighted = isCurrentWord && wordProgress > 0;

                  let wordStyle: React.CSSProperties = {
                    display: "inline-block",
                    transition: "all 0.2s ease-in-out",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                    position: "relative",
                  };

                  // Fully highlighted words (already sung)
                  if (isFullyHighlighted) {
                    wordStyle = {
                      ...wordStyle,
                      color: "#FFD700",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(255,215,0,0.5)",
                      transform: "scale(1.05)",
                    };
                  }
                  // Currently singing word (partial or about to be sung)
                  else if (isCurrentWord) {
                    // Simple approach: just change color when word starts, no partial highlighting
                    if (wordProgress > 0.5) {
                      // Word is more than halfway through, highlight it fully
                      wordStyle = {
                        ...wordStyle,
                        color: "#FFD700",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(255,215,0,0.5)",
                        transform: "scale(1.05)",
                      };
                    } else {
                      // Word hasn't started yet or just starting, keep it dim
                      wordStyle = {
                        ...wordStyle,
                        color: "rgba(255,255,255,0.4)",
                      };
                    }
                  }
                  // Unsung words
                  else {
                    wordStyle = {
                      ...wordStyle,
                      color: "rgba(255,255,255,0.4)",
                    };
                  }

                  return (
                    <span key={index} style={wordStyle}>
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })()
      )}
    </AbsoluteFill>
  );
};
