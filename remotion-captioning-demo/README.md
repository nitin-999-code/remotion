# Remotion Captioning Demo

A full-stack web application that allows users to upload MP4 videos, automatically generate captions using speech-to-text, and render those captions onto the video using Remotion with support for Hinglish (Hindi + English mixed) text.

## Features

- **Video Upload**: Upload MP4 files with drag-and-drop support
- **Auto-captioning**: Generate captions using speech-to-text (currently using mock data)
 - **Auto-captioning**: Generate captions via Deepgram or OpenAI Whisper (configurable)
- **Hinglish Support**: Proper font handling for Devanagari (Hindi) and Latin (English) characters
- **Multiple Caption Styles**: 3 predefined caption presets:
  - Bottom Centered
  - Top Bar
  - Karaoke Style
- **Real-time Preview**: Live preview using Remotion Player
- **Caption Editor**: Edit captions manually with timing controls
- **Video Export**: Guided export via Remotion preview (manual render)

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Video Processing**: Remotion
- **Speech-to-Text**: Deepgram API or OpenAI Whisper API (configurable)
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
Generates captions from an uploaded MP4 using multipart FormData. Requires either `DEEPGRAM_API_KEY` or `OPENAI_API_KEY` in `.env.local`. If neither is set, returns an error.

Request (multipart/form-data):
```
file: <MP4 binary>
```

Example using curl:
```bash
curl -X POST \
  -F "file=@/path/to/video.mp4" \
  http://localhost:3000/api/generate-captions
```

### POST /api/export-video
Prepares export metadata for manual rendering in Remotion preview
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

# Open Remotion preview (manual render)
npx remotion preview --port=3001

# Optional: Render with Remotion CLI
npx remotion render
```

## Implementation Notes

### Speech-to-Text
Configured to prefer Deepgram and fall back to OpenAI Whisper:

1. If `DEEPGRAM_API_KEY` is set, MP4 audio is sent to Deepgram; paragraphs/utterances are mapped to timed captions
2. Else if `OPENAI_API_KEY` is set, the file is sent to OpenAI Whisper (`whisper-1`) and segments are mapped to captions
3. If neither key is present, the endpoint returns an error instructing you to add one of the keys

Add to `.env.local`:
```
DEEPGRAM_API_KEY=your_key_here    # preferred
# or
OPENAI_API_KEY=your_key_here      # fallback
```

### Video Export
Export prepares data and guides manual rendering in Remotion preview:

1. Click "Export Video with Captions" to prepare export data
2. Data is saved to browser localStorage for the Remotion preview to read
3. Run `npx remotion preview --port=3001` and open the preview
4. The `VideoWithCaptions` composition will load your video, captions, and preset automatically
5. Use the Remotion UI to render the final video (output saved to `out/`)

### Hinglish Support
- Uses Noto Sans font with Devanagari subset
- Properly configured in layout.tsx and globals.css
- All caption components support mixed script rendering

## Future Enhancements

- On-device or offline STT option (e.g., @xenova/transformers)
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
 
## Deploying to Vercel
 
This app runs on Vercel using Next.js App Router.
 
- API routes run on serverless functions. The `export-video` endpoint avoids persistent writes and uses `/tmp` when running on Vercel.
- Configure environment variables in Vercel Project Settings → Environment Variables:
  - `DEEPGRAM_API_KEY` (recommended) or `OPENAI_API_KEY` (fallback)
- Build settings:
  - Framework Preset: Next.js
  - Install Command: `npm install`
  - Build Command: `npm run build`
  - Output: handled by Next.js
- Remotion preview/rendering is a local workflow. Use `npx remotion preview --port=3001` locally to render videos.
