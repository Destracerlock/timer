// background.js - service worker managing the countdown timer

// Cross-browser API (chrome for Chrome, browser for Firefox)
if (typeof browser === 'undefined') {
  var browser = chrome;
}

const DEFAULT_DURATION = 120; // default 2 minutes in seconds
let remainingSeconds = 0;
let timerInterval = null;
let playSound = true; // user preference

// Retrieve user preferences on startup
browser.storage.local.get({ soundOn: true }).then(({ soundOn }) => {
  playSound = soundOn;
});

// Keep playSound in sync if user changes the option while the
// service worker is running
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.soundOn) {
    playSound = changes.soundOn.newValue;
  }
});

// When extension starts up, check if a countdown alarm already exists
browser.alarms.get('countdown').then(alarm => {
  if (alarm) {
    const now = Date.now();
    remainingSeconds = Math.ceil((alarm.scheduledTime - now) / 1000);
    startTicking();
  } else {
    clearBadge();
  }
});

// Listen for messages from popup to start or reset the timer
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === 'start') {
    startCountdown(message.duration || DEFAULT_DURATION);
  } else if (message.command === 'reset') {
    resetCountdown();
  } else if (message.command === 'getRemaining') {
    sendResponse({ remaining: remainingSeconds });
  }
});

// Handle alarm firing when countdown finishes
browser.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'countdown') {
    finishCountdown();
  }
});

function startCountdown(seconds) {
  remainingSeconds = seconds;
  // create a one-time alarm
  browser.alarms.create('countdown', { delayInMinutes: seconds / 60 });
  startTicking();
}

// Begin interval that updates badge every second
function startTicking() {
  clearInterval(timerInterval);
  updateBadge();
  timerInterval = setInterval(() => {
    remainingSeconds--;
    if (remainingSeconds <= 0) {
      finishCountdown();
    } else {
      updateBadge();
    }
  }, 1000);
}

function resetCountdown() {
  browser.alarms.clear('countdown');
  clearInterval(timerInterval);
  remainingSeconds = 0;
  clearBadge();
}

function finishCountdown() {
  clearInterval(timerInterval);
  remainingSeconds = 0;
  clearBadge();
  if (playSound) {
    const audio = new Audio(browser.runtime.getURL('alarm.mp3'));
    audio.play().catch(() => {});
  }
}

function updateBadge() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const text = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  browser.action.setBadgeText({ text });
}

function clearBadge() {
  browser.action.setBadgeText({ text: '' });
}