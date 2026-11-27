// Practice 11 uses half-open intervals: a booking ending at start is adjacent.
const RoomRules = (() => {
  const now = 540;
  const bookings = Object.freeze([Object.freeze([600, 660])]);

  function clock(minutes) {
    return [Math.floor(minutes / 60), minutes % 60]
      .map(part => String(part).padStart(2, "0")).join(":");
  }

  function validate(start, duration) {
    if (!Number.isInteger(start) || start < 0 || start >= 1440)
      return {reasonCode: "INVALID_START", message: "Enter a whole start minute from 0 to 1439."};
    if (!Number.isInteger(duration) || duration < 1 || duration > 120)
      return {reasonCode: "DURATION", message: "Enter a duration of 1 to 120 whole minutes."};
    if (start <= now)
      return {reasonCode: "PAST_TIME", message: "Start time must be after 09:00."};
    if (start + duration > 1440)
      return {reasonCode: "INVALID_INTERVAL", message: "The interval must end by midnight."};
  }

  function check(startInput, durationInput, blocked) {
    const minute = value => String(value ?? "").trim() === "" ? NaN : Number(value);
    const start = minute(startInput);
    const duration = minute(durationInput);
    const error = validate(start, duration);
    if (error) return {available: false, ...error};
    const end = start + duration;
    if (blocked) return {available: false, reasonCode: "BLOCKED", message: "Unavailable — Room A101 is blocked."};
    if (bookings.some(([from, to]) => start < to && end > from))
      return {available: false, reasonCode: "OVERLAP", message: "Unavailable — overlaps an existing booking."};
    return {available: true, reasonCode: "AVAILABLE", message: "Available — Room A101 is free from " + clock(start) + " to " + clock(end) + "."};
  }
  return {now, bookings, clock, check};
})();
if (typeof module !== "undefined") module.exports = RoomRules;
