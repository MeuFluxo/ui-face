"use strict";
// Configuração independente deste funil. O player externo é carregado somente após o clique.
const SITE_CONFIG = {
  "slug": "ui",
  "expert": "Dr. Marcelo Roxo",
  "product": "Ultra Inteligência",
  "sourceUrl": "https://ultrainteligencia.com/marcelo-roxo-vsl7-h4/",
  "checkoutUrl": "https://checkout.payt.com.br/3a27459800c64556fb068cb82eee1d27",
  "player": {
    "elementId": "ab-6a053d1b5ecd720a09cfd574",
    "script": "https://scripts.converteai.net/1be97c3f-f8ce-4815-bb89-6a73aac005ce/ab-test/6a053d1b5ecd720a09cfd574/player.js",
    "aspectRatio": 1.7777777777777777
  },
  "pitches": {
    "69d9387fc568b750d1965ae0": {
      "seconds": 1440,
      "variant": "ui-vsl7-lead1"
    },
    "6a4856e06de26bef6e23d01d": {
      "seconds": 1525,
      "variant": "ui-vsl7-microlead12"
    },
    "6a48567512467ad3e495191d": {
      "seconds": 1515,
      "variant": "ui-vsl7-microlead13"
    },
    "6a4857135c6fa5c4e23badef": {
      "seconds": 1536,
      "variant": "ui-vsl7-microlead15"
    }
  }
};
if (typeof module !== "undefined" && module.exports) module.exports = SITE_CONFIG;
