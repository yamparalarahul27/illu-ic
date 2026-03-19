// Module-level singleton — persists across overlay mounts/unmounts

let audio: HTMLAudioElement | null = null;
let muted = false;

// Read persisted mute state on first load (client only)
if (typeof window !== "undefined") {
  muted = localStorage.getItem("graphicsLabMusicMuted") === "true";
}

export function playPreview(previewUrl: string) {
  if (audio) {
    audio.pause();
    audio = null;
  }
  if (muted) return;
  audio = new Audio(previewUrl);
  audio.volume = 0.6;
  audio.play().catch(() => {});
}

export function stopPreview() {
  audio?.pause();
  audio = null;
}

export function setMusicMuted(value: boolean) {
  muted = value;
  if (typeof window !== "undefined") {
    localStorage.setItem("graphicsLabMusicMuted", String(value));
  }
  if (value) {
    audio?.pause();
  } else {
    audio?.play().catch(() => {});
  }
}

export function getMusicMuted(): boolean {
  return muted;
}
