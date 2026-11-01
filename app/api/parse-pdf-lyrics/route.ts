import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { PDFParse } = eval("require")("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const rawText = result.text;

    if (typeof parser.destroy === "function") {
      await parser.destroy();
    }

    // Process all text from the PDF to extract full meaningful lyrics
    const lines = rawText.split("\n");
    const validWords: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const lower = trimmed.toLowerCase();

      // Skip page headers, copyright notices, and pure numbers
      if (
        lower.includes("page") ||
        lower.includes("copyright") ||
        lower.includes("all rights") ||
        lower.match(/^\d+$/)
      ) {
        continue;
      }

      // Skip pure solfa notation lines or musical measure bars
      if (
        trimmed.match(/^[drmsflt\s:|\-\.\/]+$/i) ||
        trimmed.includes("|") ||
        (trimmed.includes(":") && trimmed.length < 15)
      ) {
        continue;
      }

      // Clean out solfa syllables, voice labels (S, A, T, B), slashes, and time bars
      const cleanedLine = trimmed
        .replace(/\b(soprano|alto|tenor|bass|s|a|t|b)\b\.?/gi, "") // remove voice markers
        .replace(/[\/\|\\:]+/g, " ") // remove slashes and bars
        .replace(/\b[drmsflt]\b/gi, "") // remove isolated solfa letters
        .replace(/[^a-zA-ZÀ-ÿ\s'\-\.,]/g, " ") // keep letters, punctuation, spaces
        .replace(/\s{2,}/g, " ")
        .trim();

      if (cleanedLine.length > 2) {
        validWords.push(cleanedLine);
      }
    }

    // Stitch words together and make linguistic sense of sentences
    const fullText = validWords.join(" ");

    // Split into logical phrase chunks or sentences
    const phrases = fullText
      .split(/(?<=[.?!])\s+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 2);

    // Group phrases into clean verse and chorus stanzas (~4 lines per block)
    const stanzas: string[] = [];
    let currentBlock: string[] = [];

    phrases.forEach((phrase, idx) => {
      currentBlock.push(phrase);
      if (currentBlock.length >= 4 || idx === phrases.length - 1) {
        stanzas.push(currentBlock.join("\n"));
        currentBlock = [];
      }
    });

    // Format with meaningful song labels
    const formattedSong = stanzas
      .map((stanza, idx) => {
        const label =
          idx === 1 ? "Chorus:" : `Verse ${Math.floor(idx / 2) + 1}:`;
        return `${label}\n${stanza}`;
      })
      .join("\n\n");

    return NextResponse.json({
      success: true,
      sopranoText: formattedSong || rawText,
    });
  } catch (err: any) {
    console.error("PDF Parse Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse PDF lyrics." },
      { status: 500 },
    );
  }
}
