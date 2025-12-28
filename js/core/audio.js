let audio = {
  click: null, rare: null, mythic: null, ultra: null,
  ambienceTaipei: null, ambienceJiufen: null,
};

export function audioInit(){
  // You can add real audio files later.
  // For now we keep it safe: no 404s by default.
}

export function playSfx(name){
  const s = getState();
  if (!s.meta.sfxOn) return;
  // If you add actual <audio> objects later, play them here.
  // Example:
  // audio[name]?.currentTime = 0; audio[name]?.play();
}

export function setAmbience(regionOrScene){
  const s = getState();
  if (!s.meta.musicOn) return;
  // Later: stop old ambience and play scene ambience.
}
