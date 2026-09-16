"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createPostDate } = require("../script.js");

test("mostra o dia anterior ao acesso com o horário recebido", () => {
  const result = createPostDate(new Date(2026, 8, 16, 16, 5), 959);
  assert.equal(result.dateKey, "2026-09-16");
  assert.equal(result.label, "15 de setembro às 15:59");
  assert.equal(result.dateTime, "2026-09-15T15:59");
});

test("respeita a virada de mês e ano", () => {
  assert.equal(createPostDate(new Date(2026, 9, 1), 0).label, "30 de setembro às 00:00");
  assert.equal(createPostDate(new Date(2027, 0, 1), 1439).dateTime, "2026-12-31T23:59");
});

test("respeita anos bissextos", () => {
  assert.equal(createPostDate(new Date(2028, 2, 1), 60).label, "29 de fevereiro às 01:00");
  assert.equal(createPostDate(new Date(2026, 2, 1), 60).label, "28 de fevereiro às 01:00");
});

test("ontem é um dia de calendário, inclusive no horário de verão", () => {
  assert.match(createPostDate(new Date(2026, 2, 9, 0, 5), 30).label, /^8 de março/);
  assert.match(createPostDate(new Date(2026, 10, 2, 0, 5), 30).label, /^1 de novembro/);
});

test("os 1440 horários possíveis são válidos", () => {
  for (let minutes = 0; minutes < 1440; minutes++) {
    const result = createPostDate(new Date(2026, 8, 16), minutes);
    assert.match(result.label, /às (?:[01]\d|2[0-3]):[0-5]\d$/);
    assert.equal(result.minuteOfDay, minutes);
  }
});

test("sorteia um horário válido quando ele não é fornecido", () => {
  const result = createPostDate(new Date(2026, 8, 16));
  assert.ok(Number.isInteger(result.minuteOfDay));
  assert.ok(result.minuteOfDay >= 0 && result.minuteOfDay < 1440);
});

test("não altera a data de entrada e rejeita valores inválidos", () => {
  const input = new Date(2026, 8, 16, 23, 59);
  const original = input.getTime();
  createPostDate(input, 720);
  assert.equal(input.getTime(), original);
  assert.throws(() => createPostDate(new Date("invalid")), TypeError);
  for (const minutes of [-1, 1440, 1.5, NaN, "12"]) {
    assert.throws(() => createPostDate(input, minutes), RangeError);
  }
});
