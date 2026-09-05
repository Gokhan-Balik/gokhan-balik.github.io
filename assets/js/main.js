/* ═══════════════════════════════════════════════
   GB://CONSOLE — interactions
   boot sequence · theme toggle · matrix rain · count-up
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────
     1. THEME TOGGLE (dark default)
     ───────────────────────────── */
  var toggle = document.getElementById('theme-toggle');
  var root = document.documentElement;

  function syncToggleLabel() {
    var t = root.getAttribute('data-theme') === 'light' ? 'LIGHT' : 'DARK';
    toggle.textContent = '[ THEME: ' + t + ' ]';
  }
  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('gb-theme', next); } catch (e) {}
    syncToggleLabel();
  });
  syncToggleLabel();

  /* ─────────────────────────────
     2. BOOT SEQUENCE (once per session)
     ───────────────────────────── */
  var boot = document.getElementById('boot');
  var bootLog = document.getElementById('boot-log');

  var BOOT_LINES = [
    '> initializing gb_console v2.6 .........',
    '> verifying identity ................... OK',
    '> load publications.module ............. 30 records',
    '> load platforms.module ................ 4 systems',
    '> load citations.index ................. 90 entries',
    '> load funding.records ................. 6 projects',
    '> access granted — welcome, visitor',
    '> launching interface _'
  ];

  function endBoot() {
    if (!boot || boot.classList.contains('done')) return;
    boot.classList.add('done');
    try { sessionStorage.setItem('gb-booted', '1'); } catch (e) {}
    document.removeEventListener('keydown', endBoot);
    boot.removeEventListener('click', endBoot);
  }

  var seen = false;
  try { seen = sessionStorage.getItem('gb-booted') === '1'; } catch (e) {}

  if (!boot || seen || REDUCED) {
    if (boot) boot.classList.add('done');
  } else {
    document.addEventListener('keydown', endBoot);
    boot.addEventListener('click', endBoot);

    var li = 0;
    function typeLine() {
      if (li >= BOOT_LINES.length) { setTimeout(endBoot, 650); return; }
      var line = BOOT_LINES[li++];
      var ci = 0;
      var iv = setInterval(function () {
        ci += 2;
        bootLog.textContent = BOOT_LINES.slice(0, li - 1).join('\n') +
          (li > 1 ? '\n' : '') + line.slice(0, ci);
        if (ci >= line.length) {
          clearInterval(iv);
          bootLog.textContent = BOOT_LINES.slice(0, li).join('\n');
          setTimeout(typeLine, 90);
        }
      }, 14);
    }
    typeLine();
  }

  /* ─────────────────────────────
     3. HERO FOCUS CYCLER (type/erase)
     ───────────────────────────── */
  var focusEl = document.getElementById('focus-line');
  var FOCUS_ITEMS = [
    '> geospatial cyber risk intelligence',
    '> critical infrastructure resilience',
    '> cascading failure & interdependency analysis',
    '> trustworthy, explainable AI decision support',
    '> NIST-aligned risk assessment'
  ];

  if (focusEl && !REDUCED) {
    var fi = 0;
    setInterval(function () {
      fi = (fi + 1) % FOCUS_ITEMS.length;
      var target = FOCUS_ITEMS[fi];
      var cur = focusEl.textContent;
      var erase = setInterval(function () {
        cur = cur.slice(0, -2);
        focusEl.textContent = cur;
        if (cur.length <= 2) {
          clearInterval(erase);
          var ci = 2;
          var type = setInterval(function () {
            ci += 2;
            focusEl.textContent = target.slice(0, ci);
            if (ci >= target.length) clearInterval(type);
          }, 30);
        }
      }, 16);
    }, 4200);
  }

  /* ─────────────────────────────
     4. MATRIX RAIN (hero canvas)
     ───────────────────────────── */
  var canvas = document.getElementById('matrix-canvas');
  if (canvas && !REDUCED) {
    var ctx = canvas.getContext('2d');
    var CHARS = '01アイウエオカキクケコ<>/\\{}[]#$%&*+=?;:!ABCDEF0123456789';
    var fontSize = 14;
    var cols, drops;

    function sizeCanvas() {
      var hero = document.getElementById('hero');
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
      cols = Math.floor(canvas.width / fontSize);
      drops = [];
      for (var i = 0; i < cols; i++) drops[i] = Math.floor(Math.random() * -60);
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

    function rainColor() {
      return root.getAttribute('data-theme') === 'light' ? '#a16207' : '#facc15';
    }

    setInterval(function () {
      ctx.fillStyle = root.getAttribute('data-theme') === 'light'
        ? 'rgba(242,242,234,0.16)' : 'rgba(0,0,0,0.14)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + 'px "JetBrains Mono", monospace';
      ctx.fillStyle = rainColor();
      for (var i = 0; i < cols; i++) {
        var ch = CHARS.charAt(Math.floor(Math.random() * CHARS.length));
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.976) drops[i] = 0;
        drops[i]++;
      }
    }, 66);
  }

  /* ─────────────────────────────
     5. METRIC COUNT-UP ON SCROLL
     ───────────────────────────── */
  var nums = document.querySelectorAll('.metric-num');

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (REDUCED) { el.textContent = target + suffix; return; }
    var start = null;
    var DURATION = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / DURATION, 1);
      var eased = 1 - Math.pow(1 - p, 3); /* ease-out cubic */
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  } else {
    nums.forEach(countUp);
  }

})();
