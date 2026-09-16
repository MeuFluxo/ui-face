"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const config = require("../config.js");
const html = fs.readFileSync(path.join(root,"index.html"),"utf8");
const css = fs.readFileSync(path.join(root,"style.css"),"utf8");
const pageJS = fs.readFileSync(path.join(root,"script.js"),"utf8");
const playerJS = fs.readFileSync(path.join(root,"player.js"),"utf8");

test("conteúdo e especialista pertencem ao funil correto", () => {
  assert.ok(html.includes(config.product));
  assert.ok(html.includes(config.expert));
  for (const file of [html, css, pageJS, playerJS, JSON.stringify(config)]) {
    assert.doesNotMatch(file, /Eduardo Claas|Dieta das 3 Fases|69f3aa5d|d3f-player|d3f-post-time/);
  }
});
test("16 comentários em três grupos de respostas, sem ids duplicados", () => {
  assert.equal((html.match(/class="comment" id=/g) || []).length, 16);
  assert.equal((html.match(/class="replies"/g) || []).length, 3);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length, new Set(ids).size);
});
test("todos os arquivos e avatares referenciados existem", () => {
  const files = [...html.matchAll(/(?:src|href)="([^"]+)"/g), ...css.matchAll(/url\("([^"]+)"\)/g)].map(m=>m[1]);
  for (const ref of files.filter(f=>!/^https?:|^#/.test(f))) {
    assert.ok(fs.existsSync(path.join(root,ref.split("?")[0])),ref);
  }
});
test("layout preserva coluna de 550 px e quadro vertical de 322 px", () => {
  assert.match(css,/--content-width: 550px/);
  assert.match(css,/--player-width: 322px/);
  assert.match(css,/aspect-ratio: 9 \/ 16/);
  assert.doesNotMatch(css,/transform:\s*scale/);
  assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length);
});
test("checkout começa oculto e sem pixels copiados", () => {
  assert.match(html,/id="offer" hidden/);
  assert.ok(html.includes(config.checkoutUrl));
  assert.doesNotMatch(html + pageJS + playerJS,/googletagmanager|connect\.facebook|fbq\(|gtag\(|clarity\(/);
  assert.ok(!/<script[^>]+src="https:/.test(html));
});
test("player A/B e tempos da oferta têm configuração consistente", () => {
  assert.match(config.player.elementId,/^ab-[0-9a-f]{24}$/);
  assert.ok(config.player.script.includes(config.player.elementId.slice(3)));
  assert.equal(new URL(config.checkoutUrl).hostname,"checkout.payt.com.br");
  for (const pitch of Object.values(config.pitches)) assert.ok(pitch.seconds > 0 && pitch.variant);
});
function playerHarness(action="continue", fail=false) {
  const listeners={}, messages=[], calls=[], nodes=[], callbacks={};
  const help = {hidden:true,addEventListener(type,fn){callbacks[type]=fn;}};
  let updater, atTime;
  const player = {
    seek: async n => {calls.push(["seek",n]);},
    unmute: async () => {calls.push(["unmute"]);},
    play: async () => {if(fail)throw Error("blocked");calls.push(["play"]);},
    injectUrlUpdater: async fn => {updater=fn;},
    onTime: (n,fn) => {atTime={n,fn};},
    addEventListener: () => {}
  };
  const context={
    SITE_CONFIG:config, URL, URLSearchParams,
    location:{search:"?action="+action,protocol:"http:",origin:"http://127.0.0.1:4174",href:"http://127.0.0.1:4174/player.html"},
    parent:{postMessage(message,origin){messages.push({message,origin});}},
    document:{
      getElementById:id=>id==="play-help"?help:{append:node=>nodes.push(node)},
      createElement:tag=>({tag,addEventListener(){}}),
      addEventListener:(type,fn)=>{listeners[type]=fn;},
      querySelector:()=>player,
      head:{append:node=>nodes.push(node)}
    }
  };
  vm.runInNewContext(playerJS,context);
  return {listeners,messages,calls,nodes,help,player,get updater(){return updater;},get atTime(){return atTime;}};
}
test("player seleciona embed correto e retoma sem zerar o vídeo", async () => {
  const h=playerHarness();
  const id=Object.keys(config.pitches)[0];
  await h.listeners["player:ready"]({detail:{player:h.player,config:{id,playerInit:{aspectRatio:133.33}}}});
  await new Promise(setImmediate);
  assert.equal(h.nodes[0].id,config.player.elementId);
  assert.equal(h.nodes[1].src,config.player.script);
  assert.ok(!h.calls.some(c=>c[0]==="seek"));
  assert.ok(h.calls.some(c=>c[0]==="play"));
  assert.equal(h.messages[0].message.channel,config.slug+"-player");
  assert.ok(Math.abs(h.messages[0].message.aspectRatio - 1.3333) < 1e-10);
});
test("começar do início zera o vídeo e revela oferta somente no tempo configurado", async () => {
  const h=playerHarness("restart");
  const id=Object.keys(config.pitches)[0];
  await h.listeners["player:ready"]({detail:{player:h.player,config:{id}}});
  await new Promise(setImmediate);
  assert.deepEqual(h.calls[0],["seek",0]);
  assert.equal(h.atTime.n,config.pitches[id].seconds);
  assert.ok(!h.messages.some(m=>m.message.state==="offer"));
  h.atTime.fn();
  assert.equal(h.messages.at(-1).message.state,"offer");
  assert.equal(h.messages.at(-1).message.playerId,id);
});
test("somente links Payt usam o checkout solicitado", async () => {
  const h=playerHarness();
  const id=Object.keys(config.pitches)[0];
  await h.listeners["player:ready"]({detail:{player:h.player,config:{id}}});
  const url=new URL(h.updater("https://checkout.payt.com.br/antigo"));
  assert.equal(url.pathname,new URL(config.checkoutUrl).pathname);
  assert.equal(url.searchParams.get("vsl_teste"),config.pitches[id].variant);
  assert.equal(h.updater("https://cdn.converteai.net/video.m3u8"),"https://cdn.converteai.net/video.m3u8");
});
test("bloqueio de autoplay oferece controle manual", async () => {
  const h=playerHarness("continue",true);
  await h.listeners["player:ready"]({detail:{player:h.player,config:{}}});
  await new Promise(setImmediate);
  assert.equal(h.help.hidden,false);
});
