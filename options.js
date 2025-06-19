// options.js - manage extension options
if (typeof browser === 'undefined') {
  var browser = chrome;
}

const soundCheckbox = document.getElementById('sound');

browser.storage.local.get({ soundOn: true }).then(({ soundOn }) => {
  soundCheckbox.checked = soundOn;
});

soundCheckbox.addEventListener('change', () => {
  browser.storage.local.set({ soundOn: soundCheckbox.checked });
});

