const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function widget(name) {
  const file = path.join(__dirname, '..', 'pages', 'Page1', 'widgets', 'RoomCheckerContainer', name + '.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const booking = widget('ExistingBookingsValue');
const button = widget('CheckAvailability');
const result = widget('CheckResult');
const cases = [
  ['T1 free', 720, 30, false, 'AVAILABLE'],
  ['T2 overlap', 630, 30, false, 'OVERLAP'],
  ['T3 blocked', 720, 30, true, 'BLOCKED'],
  ['T4 zero duration', 720, 0, false, 'DURATION'],
  ['T5 over duration limit', 720, 121, false, 'DURATION'],
  ['T6 past', 510, 30, false, 'PAST_TIME'],
  ['T7 adjacent', 660, 30, false, 'AVAILABLE'],
];

function run(binding, context) {
  return vm.runInNewContext(binding.slice(2, -2), context);
}

function session() {
  const store = {};
  return {
    StartMinutes: {}, DurationMinutes: {}, RoomBlocked: {},
    ExistingBookingsValue: structuredClone(booking),
    appsmith: { store },
    storeValue(key, value, persist) {
      assert.equal(persist, false);
      store[key] = value;
    },
  };
}

function check(ctx, start, duration, blocked) {
  ctx.StartMinutes.text = String(start);
  ctx.DurationMinutes.text = String(duration);
  ctx.RoomBlocked.isSwitchedOn = blocked;
  run(button.onClick, ctx);
  return ctx.appsmith.store.roomCheck;
}

for (const [name, start, duration, blocked, expected] of cases) {
  test(name, () => {
    const ctx = session();
    assert.equal(button.isDisabled, false);
    const outcome = check(ctx, start, duration, blocked);
    assert.equal(outcome.reasonCode, expected);
    assert.equal(outcome.available, expected === 'AVAILABLE');
    assert.ok(outcome.message.length > 0);
    assert.equal(run(result.text, ctx), outcome.message);
  });
}

test('T8 checks preserve the booking list', () => {
  const ctx = session();
  assert.equal(ctx.ExistingBookingsValue.text, '10:00–11:00');
  for (const [, start, duration, blocked] of cases) check(ctx, start, duration, blocked);
  assert.deepEqual(ctx.ExistingBookingsValue, booking);
  assert.deepEqual(Object.keys(ctx.appsmith.store), ['roomCheck']);
});

test('boundary inputs, missing fields and stale results', () => {
  const ctx = session();
  assert.equal(run(result.text, ctx), '');
  for (const [start, duration, expected] of [
    [720, 120, 'AVAILABLE'], [570, 30, 'AVAILABLE'], [540, 1, 'PAST_TIME'],
    [1439, 1, 'AVAILABLE'], [1439, 2, 'INVALID_INTERVAL'],
    ['', 30, 'INVALID_START'], [720, '', 'DURATION'], [720, 1.5, 'DURATION'],
  ]) assert.equal(check(ctx, start, duration, false).reasonCode, expected);
  ctx.RoomBlocked.isSwitchedOn = true;
  assert.equal(run(result.text, ctx), '');
});
