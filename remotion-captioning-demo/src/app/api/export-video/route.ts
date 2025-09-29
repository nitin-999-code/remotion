import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, captions, preset } = await request.json();

    if (!videoUrl || !captions || !preset) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // For this demo, we'll create a simple video export by:
    // 1. Creating a temporary HTML file with the video and captions
    // 2. Providing instructions for manual export
    
    const exportData = {
      videoUrl,
      captions,
      preset,
      timestamp: new Date().toISOString(),
    };

    // Create a temporary export file
    const exportDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const exportFile = path.join(exportDir, `export-${Date.now()}.json`);
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));

    // For now, return the export data and instructions
    return NextResponse.json({
      success: true,
      message: "Export data prepared successfully",
      instructions: [
        "1. The video export data has been saved",
        "2. To render the video with captions, run: npm run remotion",
        "3. In the Remotion preview, load the composition 'VideoWithCaptions'",
        "4. Set the input props to include your video URL, captions, and preset",
        "5. Use the render button to export the final video",
        "6. The exported video will be saved to the 'out' directory"
      ],
      exportFile: exportFile,
      data: exportData
    });

  } catch (error) {
    console.error("Error exporting video:", error);
    return NextResponse.json(
      { error: "Failed to export video" },
      { status: 500 }
    );
  }
}
