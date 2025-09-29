# Remotion Captioning Project

This repository contains a Remotion-based video captioning application.

## Project Structure

```
intern/                          # Git repository root
├── vercel.json                 # Vercel deployment configuration
├── README.md                   # This file
└── remotion-captioning-demo/   # Next.js application
    ├── src/                    # Application source code
    ├── package.json           # App dependencies
    ├── next.config.ts         # Next.js configuration
    └── vercel.json           # App-specific Vercel settings
```

## Deployment

The project is configured for Vercel deployment with monorepo support:

1. The main `vercel.json` at the root handles the monorepo structure
2. The app-specific `vercel.json` in `remotion-captioning-demo/` configures function timeouts
3. Vercel will automatically detect and build the Next.js app from the subfolder

## Environment Variables

Set these in your Vercel project settings:

- `OPENAI_API_KEY` - For OpenAI Whisper transcription
- `DEEPGRAM_API_KEY` - Alternative STT service (optional)

## Local Development

```bash
cd remotion-captioning-demo
npm install
npm run dev
```
