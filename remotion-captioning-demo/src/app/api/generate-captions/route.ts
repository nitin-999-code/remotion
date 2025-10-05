import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing file. Send FormData with field 'file' as the MP4." },
        { status: 400 }
      );
    }

    // Prefer Deepgram if configured; otherwise fallback to OpenAI
    const deepgramKey = process.env.DEEPGRAM_API_KEY;
    let captions: { text: string; startTime: number; endTime: number }[] = [];

    console.log("Deepgram key exists:", !!deepgramKey);
    console.log("Loaded Deepgram key:", deepgramKey?.slice(0, 8) + "...");
    console.log("Environment keys:", Object.keys(process.env).filter(k => k.includes('DEEPGRAM')));

    if (deepgramKey) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const dgUrl =
        "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&utterances=true&paragraphs=true&detect_language=true&punctuate=true";

      const dgRes = await fetch(dgUrl, {
        method: "POST",
        headers: {
          Authorization: `Token ${deepgramKey}`,
          // Deepgram recommends audio/* even when sending an MP4 container
          // to ensure correct handling of the media stream
          "Content-Type": "audio/mp4",
        },
        body: buffer,
        // Add timeout and signal for better error handling
        signal: AbortSignal.timeout(60000), // 60 second timeout
      });

      if (!dgRes.ok) {
        const errText = await dgRes.text();
        return NextResponse.json(
          { error: `Deepgram transcription failed: ${errText}` },
          { status: 500 }
        );
      }

      type DGParagraph = { start?: number; end?: number; text?: string };
      type DGWord = { start?: number; end?: number; word?: string };
      type DGAlt = {
        paragraphs?: { paragraphs?: DGParagraph[] };
        words?: DGWord[];
      };
      type DGChannel = { alternatives?: DGAlt[] };
      type DGResponse = {
        results?: {
          channels?: DGChannel[];
          utterances?: { start?: number; end?: number; transcript?: string }[];
        };
      };
      const dgJson = (await dgRes.json()) as DGResponse;
      const paragraphs: DGParagraph[] =
        dgJson?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.paragraphs || [];

      // 1) Prefer paragraphs
      const paraCaptions = paragraphs
        .map((p) => ({
          text: String(p.text ?? "").trim(),
          startTime: typeof p.start === "number" ? p.start : 0,
          endTime: typeof p.end === "number" ? p.end : 0,
        }))
        .filter((c) => c.text.length > 0 && c.endTime > c.startTime);

      if (paraCaptions.length > 0) {
        captions = paraCaptions;
      } else {
        // 2) Fallback to utterances if paragraphs are unavailable
        type DGUtterance = { start?: number; end?: number; transcript?: string };
        const utterances: DGUtterance[] = dgJson?.results?.utterances || [];
        const uttCaptions = utterances
          .map((u) => ({
            text: String(u.transcript ?? "").trim(),
            startTime: typeof u.start === "number" ? u.start : 0,
            endTime: typeof u.end === "number" ? u.end : 0,
          }))
          .filter((c) => c.text.length > 0 && c.endTime > c.startTime);

        if (uttCaptions.length > 0) {
          captions = uttCaptions;
        } else {
          // 3) Last fallback: group words into 3s chunks
          const words: DGWord[] =
            dgJson?.results?.channels?.[0]?.alternatives?.[0]?.words || [];
          const grouped: { text: string; startTime: number; endTime: number }[] = [];
          let current: { text: string; startTime: number; endTime: number } | null = null;
          for (const w of words) {
            const wtext = (w.word ?? "").trim();
            const wstart = typeof w.start === "number" ? w.start : 0;
            const wend = typeof w.end === "number" ? w.end : wstart + 0.5;
            if (!current) {
              current = { text: wtext, startTime: wstart, endTime: wend };
            } else {
              // If the chunk exceeds 3 seconds, start a new one
              if (wend - current.startTime > 3) {
                grouped.push(current);
                current = { text: wtext, startTime: wstart, endTime: wend };
              } else {
                current.text += (current.text ? " " : "") + wtext;
                current.endTime = wend;
              }
            }
          }
          if (current && current.text) grouped.push(current);
          captions = grouped.filter((c) => c.text.length > 0 && c.endTime > c.startTime);
        }
      }
    } else {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "No STT configured. Add DEEPGRAM_API_KEY or OPENAI_API_KEY to .env.local" },
          { status: 500 }
        );
      }

      // Send to OpenAI as fallback
      const fd = new FormData();
      fd.append("file", file);
      fd.append("model", "whisper-1");
      fd.append("response_format", "verbose_json");
      fd.append("temperature", "0");

      const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: fd,
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json(
          { error: `Transcription failed: ${errText}` },
          { status: 500 }
        );
      }

      const transcription = (await res.json()) as { segments?: { text?: string; start?: number; end?: number }[] };
      type WhisperSegment = { text?: string; start?: number; end?: number };
      const segments: WhisperSegment[] = transcription?.segments ?? [];
      captions = segments
        .map((s) => ({
          text: String(s.text ?? "").trim(),
          startTime: typeof s.start === "number" ? s.start : 0,
          endTime:
            typeof s.end === "number"
              ? s.end
              : typeof s.start === "number"
              ? s.start + 2
              : 2,
        }))
        .filter((c) => c.text.length > 0);
    }

    if (captions.length === 0) {
      return NextResponse.json(
        { captions: [], note: "Transcription returned no segments." },
        { status: 200 }
      );
    }

    return NextResponse.json({ captions });
  } catch (error) {
    console.error("Error generating captions:", error);
    return NextResponse.json(
      { error: "Failed to generate captions" },
      { status: 500 }
    );
  }
}
