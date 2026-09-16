"use strict";
// API pública: https://smartplayer.vturb.com/en/api/ e /en/events/
const config = SITE_CONFIG;
const mount = document.getElementById("player-root");
const element = document.createElement("vturb-smartplayer");
element.id = config.player.elementId;
mount.append(element);
const help = document.getElementById("play-help");
const restart = new URLSearchParams(location.search).get("action") === "restart";
const parentOrigin = location.protocol === "file:" ? "*" : location.origin;
const notify = (state, payload = {}) => parent.postMessage({ channel: config.slug + "-player", state, ...payload }, parentOrigin);
let activePlayer;
let restartPending = restart;
async function startVideo() {
  if (!activePlayer) return;
  try {
    if (restartPending) {
      await activePlayer.seek(0);
      restartPending = false;
    }
    await activePlayer.unmute();
    await activePlayer.play();
    help.hidden = true;
  } catch { help.hidden = false; }
}
document.addEventListener("player:ready", async event => {
  if (activePlayer) return;
  const detail = event.detail || {};
  const settings = detail.config || {};
  activePlayer = detail.player || document.querySelector("vturb-smartplayer");
  const pitch = config.pitches[settings.id];
  notify("ready", { aspectRatio: Number(settings.playerInit?.aspectRatio) / 100 || config.player.aspectRatio });
  // Os botões de pagamento deste funil usam o checkout informado pelo proprietário.
  // Nenhum pixel adicional é inserido. Somente links Payt são ajustados.
  if (typeof activePlayer.injectUrlUpdater === "function") {
    try {
      await activePlayer.injectUrlUpdater(url => {
        const original = new URL(url, location.href);
        if (original.hostname !== "checkout.payt.com.br") return url;
        const checkout = new URL(config.checkoutUrl);
        if (pitch) checkout.searchParams.set("vsl_teste", pitch.variant);
        return checkout.href;
      });
    } catch { /* O botão externo continua apontando para o checkout configurado. */ }
  }
  if (pitch && typeof activePlayer.onTime === "function") {
    activePlayer.onTime(pitch.seconds, () => notify("offer", { playerId: settings.id }));
  }
  activePlayer.addEventListener("video:play", () => { help.hidden = true; });
  startVideo();
}, { once: true });
help.addEventListener("click", startVideo);
const script = document.createElement("script");
script.src = config.player.script;
script.async = true;
script.addEventListener("error", () => notify("error"), { once: true });
document.head.append(script);
