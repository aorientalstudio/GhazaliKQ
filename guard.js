/* Loaded first. Default state = "public": only the bare clock is visible (auth.js lifts it after login).
   Also: frame-busting and light deterrents (right-click / save / view-source / devtools shortcuts).
   Note: browser-side blocking is a deterrent only — real protection is that no schedule data exists in these
   files and the database refuses anyone who is not logged in (see SECURITY.md). */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('pub');
  if (window.top !== window.self) {            // clickjacking: refuse to run inside someone else's frame
    root.style.display = 'none';
    try { window.top.location = window.self.location; } catch (e) {}
    return;
  }
  function field(t) { return t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName); }
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); }, true);
  ['dragstart', 'selectstart', 'copy', 'cut'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (!field(e.target)) e.preventDefault(); }, true);
  });
  document.addEventListener('keydown', function (e) {
    var k = String(e.key || '').toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (k === 'f12' ||
        (mod && ['u', 's', 'p'].indexOf(k) > -1) ||
        (mod && e.shiftKey && ['i', 'j', 'c', 'k'].indexOf(k) > -1) ||
        (e.metaKey && e.altKey && ['i', 'j', 'u', 'c'].indexOf(k) > -1)) {
      e.preventDefault(); e.stopPropagation();
    }
  }, true);
})();
