import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

export const wordCounterProcessor: ToolProcessor = {
  inputLabel: 'Text',
  inputPlaceholder: 'Paste or type your text here…',
  autoProcess: true,
  exampleInput: `The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.

This is a third paragraph. It has two sentences.`,

  process(input: ToolInput): ToolResult {
    const text = input.value;
    if (!text) return { error: 'Paste or type text to analyse.' };

    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;

    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

    const lines = text.split(/\n/).length;
    const nonEmptyLines = text.split(/\n/).filter((l) => l.trim().length > 0).length;

    // Sentence detection: split on . ! ? followed by whitespace or end of string
    const sentences = text
      .split(/[.!?]+(?:\s|$)/)
      .filter((s) => s.trim().length > 0).length;

    const paragraphs = text
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0).length;

    // Average reading speed: 200 wpm
    const readingSeconds = Math.ceil((words / 200) * 60);
    const readingTime =
      readingSeconds < 60
        ? `${readingSeconds} sec`
        : `${Math.floor(readingSeconds / 60)} min ${readingSeconds % 60} sec`;

    const summary = [
      `Words:             ${words}`,
      `Characters:        ${chars}`,
      `Chars (no spaces): ${charsNoSpaces}`,
      `Lines:             ${lines}`,
      `Non-empty lines:   ${nonEmptyLines}`,
      `Sentences:         ${sentences}`,
      `Paragraphs:        ${paragraphs}`,
      `Reading time:      ${readingTime}`,
    ].join('\n');

    return {
      output: {
        value: summary,
        type: 'text',
        label: 'Statistics',
        copyable: true,
      },
      meta: {
        words,
        characters: chars,
        lines,
        sentences,
        paragraphs,
        'reading time': readingTime,
      },
    };
  },
};
