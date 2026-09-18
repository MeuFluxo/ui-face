"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const css = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8");

test("headline e vídeo têm respiro curto no desktop e no celular", () => {
  const rules = [...css.matchAll(/\.video-section\s*\{\s*padding-top:\s*(\d+)px;\s*\}/g)];
  assert.deepEqual(rules.map(rule => Number(rule[1])), [20, 16]);
  const mobile = css.slice(css.indexOf("@media (max-width: 600px)"));
  assert.match(mobile, /\.video-section\s*\{\s*padding-top:\s*16px;/);
});
