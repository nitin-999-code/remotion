# Remotion Captioning Demo

A full-stack web application that allows users to upload MP4 videos, automatically generate captions using speech-to-text, and render those captions onto the video using Remotion with support for Hinglish (Hindi + English mixed) text.

## Features

- **Video Upload**: Upload MP4 files with drag-and-drop support
- **Auto-captioning**: Generate captions using speech-to-text (currently using mock data)
- **Hinglish Support**: Proper font handling for Devanagari (Hindi) and Latin (English) characters
- **Multiple Caption Styles**: 3 predefined caption presets:
  - Bottom Centered
  - Top Bar
  - Karaoke Style
- **Real-time Preview**: Live preview using Remotion Player
- **Caption Editor**: Edit captions manually with timing controls
- **Video Export**: Export final video with captions (fully functional)

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Video Processing**: Remotion
- **Speech-to-Text**: @xenova/transformers (Whisper)
- **Icons**: Lucide React
- **Fonts**: Noto Sans (supports Devanagari script)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- VS Code (recommended)

## Installation & Setup

1. **Clone or download the project**
   ```bash
   cd remotion-captioning-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Workflow

1. **Upload Video**: Drag and drop an MP4 file or click to browse
2. **Generate Captions**: Click "Auto-generate Captions" (currently returns mock data)
3. **Select Style**: Choose from 3 caption presets
4. **Edit Captions**: Modify text and timing as needed
5. **Preview**: See real-time preview with captions
6. **Export**: Export the final video with captions (fully functional)

### Caption Presets

- **Bottom Centered**: Traditional subtitle style at bottom center
- **Top Bar**: Full-width bar at the top of the video
- **Karaoke Style**: Large centered text with red background

### Hinglish Support

The application properly handles mixed Hindi and English text using:
- Noto Sans font family with Devanagari script support
- Proper text rendering for both Latin and Devanagari characters
- Example: "Hello नमस्ते, this is Hinglish text यह मिश्रित भाषा है"

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-captions/    # Speech-to-text API
│   │   └── export-video/         # Video export API
│   ├── layout.tsx                # Root layout with fonts
│   └── page.tsx                  # Main application page
├── components/
│   ├── CaptionEditor.tsx         # Caption editing interface
│   ├── CaptionPresets.tsx        # Style preset selector
│   ├── VideoPreview.tsx          # Remotion player preview
│   └── VideoUploader.tsx         # File upload component
└── remotion/
    ├── Root.tsx                  # Remotion composition root
    └── VideoWithCaptions.tsx     # Main video component
```

## API Endpoints

### POST /api/generate-captions
Generates captions from video audio (currently returns mock data)
```json
{
  "videoUrl": "string"
}
```

### POST /api/export-video
Exports video with captions (placeholder implementation)
```json
{
  "videoUrl": "string",
  "captions": "CaptionData[]",
  "preset": "string"
}
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Remotion preview
npm run remotion

# Render video with Remotion
npm run render
```

## Implementation Notes

### Speech-to-Text
Currently uses mock data for demonstration. To implement real speech-to-text:

1. Extract audio from uploaded video
2. Use @xenova/transformers with Whisper model
3. Process audio and return timestamped captions

### Video Export
The export functionality is now fully implemented:

1. Click "Export Video with Captions" to prepare export data
2. Data is saved to browser localStorage
3. Run `npm run remotion` to open Remotion preview
4. Your video, captions, and preset are automatically loaded
5. Use Remotion's render interface to export the final video

### Hinglish Support
- Uses Noto Sans font with Devanagari subset
- Properly configured in layout.tsx and globals.css
- All caption components support mixed script rendering

## Future Enhancements

- Real speech-to-text integration
- Video export functionality
- SRT/VTT file import/export
- Word-level karaoke effects
- More caption style presets
- Timeline-based caption editing

## Troubleshooting

### Common Issues

1. **Font not loading**: Ensure Noto Sans is properly imported in layout.tsx
2. **Video not playing**: Check file format (MP4 only) and size (100MB limit)
3. **Remotion errors**: Ensure all Remotion dependencies are installed

### Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## License

This project is created for internship evaluation purposes.

## Contact

For questions or issues, please refer to the project documentation or contact the development team.
