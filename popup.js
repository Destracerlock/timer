// popup.js - handles user interaction in the popup
if (typeof browser === 'undefined') {
  var browser = chrome;
}

const timeDisplay = document.getElementById('timeDisplay');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateDisplay() {
  browser.runtime.sendMessage({ command: 'getRemaining' }).then(res => {
    if (res && typeof res.remaining === 'number') {
      if (res.remaining > 0) {
        timeDisplay.textContent = formatTime(res.remaining);
      } else {
        timeDisplay.textContent = '--:--';
      }
    }
  });
}

startBtn.addEventListener('click', () => {
  const duration = parseInt(minutesInput.value || '0', 10) * 60 +
                   parseInt(secondsInput.value || '0', 10);
  browser.runtime.sendMessage({ command: 'start', duration });
});

resetBtn.addEventListener('click', () => {
  browser.runtime.sendMessage({ command: 'reset' });
  timeDisplay.textContent = '--:--';
});

// Poll every second to refresh displayed remaining time
updateDisplay();
setInterval(updateDisplay, 1000);

