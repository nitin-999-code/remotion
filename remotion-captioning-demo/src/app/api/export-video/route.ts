import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

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

    // Create a temporary export file when possible
    // Note: On Vercel, only /tmp is writable in serverless functions
    const isVercel = !!process.env.VERCEL;
    let exportFile: string | null = null;
    try {
      const baseDir = isVercel ? "/tmp/exports" : path.join(process.cwd(), "exports");
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }
      exportFile = path.join(baseDir, `export-${Date.now()}.json`);
      fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
    } catch {
      // Ignore filesystem errors in serverless environments
      exportFile = null;
    }

    // For now, return the export data and instructions
    return NextResponse.json({
      success: true,
      message: "Export data prepared successfully",
      instructions: [
        "1. The video export data has been prepared",
        "2. To render the video with captions, run: npx remotion preview --port=3001",
        "3. In the Remotion preview, load the composition 'VideoWithCaptions'",
        "4. The input props can be set to include your video URL, captions, and preset",
        "5. Use the render button to export the final video",
        "6. The exported video will be saved to the 'out' directory"
      ],
      exportFile,
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
