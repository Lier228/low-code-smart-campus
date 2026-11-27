const form = document.querySelector("form");
const result = document.querySelector("output");
const {start, duration, blocked} = form.elements;
document.querySelector("#now").textContent = RoomRules.clock(RoomRules.now);
document.querySelector("#bookings").textContent = RoomRules.bookings
  .map(pair => pair.map(RoomRules.clock).join("–")).join(", ");
function reset() {
  document.querySelector("#status").textContent = blocked.checked ? "Blocked" : "Not blocked";
  result.textContent = "Select Check availability to see the result.";
  delete result.dataset.code;
}
form.addEventListener("input", reset);
form.addEventListener("submit", event => {
  event.preventDefault();
  const decision = RoomRules.check(start.value, duration.value, blocked.checked);
  result.textContent = decision.message;
  result.dataset.code = decision.reasonCode;
});
reset();
