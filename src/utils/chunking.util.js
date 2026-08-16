export function chunkTranscript(captions) {
  const chunks = [];
  let current = null;

  for (const caption of captions) {
    if (current && current.speaker === caption.speaker) {
      current.text += " " + caption.text;
      current.endTimestamp = caption.timestamp;
    } else {
      if (current) chunks.push(current);
      current = {
        speaker: caption.speaker,
        text: caption.text,
        startTimestamp: caption.timestamp,
        endTimestamp: caption.timestamp,
      };
    }
  }
  if (current) chunks.push(current);

  return chunks.map((c) => ({
    text: `${c.speaker}: ${c.text}`,
    startTimestamp: c.startTimestamp,
    endTimestamp: c.endTimestamp,
  }));
}
