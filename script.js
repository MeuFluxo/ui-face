"use strict";

// Data visual do cabeçalho: ontem, no calendário local, com horário sorteado.
function createPostDate(now = new Date(), minuteOfDay = Math.floor(Math.random() * 1440)) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new TypeError("Data inválida.");
  if (!Number.isInteger(minuteOfDay) || minuteOfDay < 0 || minuteOfDay >= 1440) {
    throw new RangeError("O horário deve estar entre 0 e 1439 minutos.");
  }
  const pad = (value) => String(value).padStart(2, "0");
  const key = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const yesterday = new Date(now);
  yesterday.setHours(12, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  const time = `${pad(Math.floor(minuteOfDay / 60))}:${pad(minuteOfDay % 60)}`;
  const month = yesterday.toLocaleDateString("pt-BR", { month: "long" });
  return {
    dateKey: key(now),
    minuteOfDay,
    label: `${yesterday.getDate()} de ${month} às ${time}`,
    dateTime: `${key(yesterday)}T${time}`
  };
}

if (typeof module !== "undefined" && module.exports) module.exports = { createPostDate };


if (typeof document !== "undefined") {
(() => {
  const config = SITE_CONFIG;
  let lastCalendarDay = "";
  function updatePostDate() {
    let header = createPostDate();
    if (header.dateKey === lastCalendarDay) return;
    try {
      const key = config.slug + "-post-time:" + header.dateKey;
      const stored = sessionStorage.getItem(key);
      const minutes = stored === null ? NaN : Number(stored);
      if (stored && stored.trim() && Number.isInteger(minutes) && minutes >= 0 && minutes < 1440) {
        header = createPostDate(new Date(), minutes);
      } else sessionStorage.setItem(key, String(header.minuteOfDay));
    } catch { /* Funciona também com armazenamento bloqueado. */ }
    const date = document.getElementById("post-date");
    date.textContent = header.label;
    date.dateTime = header.dateTime;
    lastCalendarDay = header.dateKey;
  }
  updatePostDate();
  window.setInterval(updatePostDate, 60000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) updatePostDate(); });

  const mount = document.getElementById("video-mount");
  const status = document.getElementById("player-status");
  const card = mount.querySelector(".resume-card");
  const buttons = [...mount.querySelectorAll("[data-video-action]")];
  const offer = document.getElementById("offer");
  const checkout = offer.querySelector("a");
  let player, stage, timeout, loading = false;
  function setRatio(ratio) {
    if (typeof ratio === "number" && Number.isFinite(ratio) && ratio > 0 && ratio <= 4) {
      mount.style.setProperty("--embed-height", Math.min(100, ratio / (16 / 9) * 100) + "%");
    }
  }
  setRatio(config.player.aspectRatio);

  function failPlayer() {
    window.clearTimeout(timeout);
    loading = false;
    mount.removeAttribute("aria-busy");
    mount.classList.remove("is-playing");
    card.hidden = false;
    buttons.forEach(button => { button.disabled = false; });
    if (stage) stage.remove();
    player = null;
    const link = document.createElement("a");
    link.href = config.sourceUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Abrir a VSL na página original";
    status.replaceChildren("Não foi possível carregar o vídeo. Tente novamente ou ", link, ".");
    status.hidden = false;
  }

  window.addEventListener("message", event => {
    const trustedOrigin = location.protocol === "file:" ? "null" : location.origin;
    if (!player || event.source !== player.contentWindow || event.origin !== trustedOrigin) return;
    const data = event.data;
    if (!data || data.channel !== config.slug + "-player") return;
    if (data.state === "ready") {
      window.clearTimeout(timeout);
      mount.removeAttribute("aria-busy");
      setRatio(data.aspectRatio);
      mount.classList.add("is-playing");
      card.hidden = true;
      status.hidden = true;
    } else if (data.state === "error") {
      failPlayer();
    } else if (data.state === "offer") {
      const url = new URL(config.checkoutUrl);
      const pitch = config.pitches[data.playerId];
      if (pitch) url.searchParams.set("vsl_teste", pitch.variant);
      checkout.href = url.href;
      offer.hidden = false;
    }
  });

  function loadPlayer(action) {
    if (loading) return;
    loading = true;
    mount.setAttribute("aria-busy", "true");
    buttons.forEach(button => { button.disabled = true; });
    status.textContent = "Carregando o vídeo…";
    status.hidden = false;
    stage = document.createElement("div");
    stage.className = "embed-stage";
    player = document.createElement("iframe");
    const url = new URL("player.html", location.href);
    url.searchParams.set("action", action);
    player.src = url.href;
    player.title = "VSL de " + config.product + " — " + config.expert;
    player.allow = "autoplay; fullscreen; picture-in-picture";
    player.allowFullscreen = true;
    player.addEventListener("error", failPlayer, { once: true });
    stage.append(player);
    mount.prepend(stage);
    timeout = window.setTimeout(failPlayer, 30000);
  }
  buttons.forEach(button => button.addEventListener("click", () => loadPlayer(button.dataset.videoAction)));

  document.addEventListener("click", event => {
    const like = event.target.closest("[data-like], [data-post-like]");
    if (like) {
      const pressed = like.getAttribute("aria-pressed") !== "true";
      like.setAttribute("aria-pressed", String(pressed));
      if (like.hasAttribute("data-like")) like.textContent = pressed ? "Curtido" : "Curtir";
    }
    if (event.target.closest("[data-reply]")) {
      document.getElementById("action-feedback").textContent = "As respostas não estão disponíveis nesta página.";
    }
  });
  document.querySelector("[data-go-comments]").addEventListener("click", () => {
    const heading = document.getElementById("comments-title");
    heading.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    heading.focus({ preventScroll: true });
  });
  document.querySelector("[data-share]").addEventListener("click", async () => {
    const feedback = document.getElementById("action-feedback");
    if (location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(location.hostname)) {
      feedback.textContent = "O compartilhamento por link fica disponível no endereço publicado.";
      return;
    }
    try {
      await navigator.clipboard.writeText(location.href);
      feedback.textContent = "Link copiado.";
    } catch { feedback.textContent = "Copie o endereço desta página para compartilhar."; }
  });
})();
}
