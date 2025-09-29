# Video Export Instructions

## How to Export Your Video with Captions

The export functionality has been fixed! Here's how to use it:

### Method 1: Using the Web Interface (Recommended)

1. **Upload your MP4 video** using the drag-and-drop interface
2. **Generate captions** by clicking "Auto-generate Captions" (or add them manually)
3. **Select a caption style** from the 3 available presets
4. **Click "Export Video with Captions"** - this will prepare your export data
5. **Follow the instructions** that appear on screen

### Method 2: Using Remotion Preview

1. After clicking "Export Video with Captions", the data is saved to your browser
2. **Open a new terminal** and run:
   ```bash
   npm run remotion
   ```
3. **Open the Remotion preview** at http://localhost:3001
4. **Select the "VideoWithCaptions" composition**
5. **Your video, captions, and preset will be automatically loaded**
6. **Click the "Render" button** in the Remotion interface
7. **Choose your output settings** (format, quality, etc.)
8. **The rendered video will be saved** to the `out` directory

### What's Fixed

- ✅ **Export button now works** - no more placeholder
- ✅ **Data persistence** - export data is saved to localStorage
- ✅ **Automatic data loading** - Remotion preview loads your data automatically
- ✅ **Clear instructions** - step-by-step guidance provided
- ✅ **Multiple export methods** - web interface + Remotion preview

### Troubleshooting

**If the export button doesn't work:**
1. Make sure you have uploaded a video
2. Make sure you have generated captions
3. Check the browser console for any errors

**If Remotion preview doesn't load your data:**
1. Make sure you clicked "Export Video with Captions" first
2. Clear your browser's localStorage and try again
3. Check that the Remotion preview is running on port 3001

**If you get build errors:**
1. Run `npm install` to ensure all dependencies are installed
2. Run `npm run build` to check for any compilation errors

### Export Data Format

The export data includes:
- `videoUrl`: Your uploaded video file URL
- `captions`: Array of caption objects with text and timing
- `preset`: Selected caption style configuration
- `timestamp`: When the export was prepared

This data is automatically loaded into the Remotion composition for rendering.

### Next Steps

Once you have your exported video:
1. Check the `out` directory for your rendered video
2. The video will have your captions overlaid according to the selected preset
3. You can share or use the video as needed

The export functionality is now fully working! 🎉

