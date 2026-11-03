/* Cloud layer: Supabase login, per-class schedules, principal board, offline cache.
   If config.js has no Supabase keys the page simply runs in local (single-class) mode. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var cfg = window.APP_CONFIG || {};
  var CLOCK = window.__clock;
  var root = document.documentElement;

  /* ---- PWA service worker (works only over https / localhost) ---- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  /* ---------- install prompt (any visitor, any browser that allows installing) ---------- */
  (function () {
    var el = $('install'); if (!el) return;
    var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    if (standalone) return;
    var last = 0; try { last = +localStorage.getItem('ccx:install') || 0; } catch (e) {}
    if (Date.now() - last < 7 * 86400000) return;             // dismissed: ask again after a week
    var ua = navigator.userAgent || '';
    var ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var safariMac = !ios && /safari/i.test(ua) && !/chrome|chromium|crios|fxios|edg/i.test(ua);
    var ffAndroid = /android/i.test(ua) && /firefox/i.test(ua);
    var dp = null, shown = false;
    function steps(list) {
      var ol = $('installSteps'); ol.innerHTML = list.map(function (t) { return '<li>' + t + '</li>'; }).join(''); ol.hidden = false;
      $('installP').textContent = 'ثبّته على جهازك في خطوتين:'; $('installYes').textContent = 'فهمت';
    }
    function open() { if (shown) return; shown = true; el.classList.add('show'); }
    function close(remember) {
      el.classList.remove('show'); shown = false;
      if (remember) { try { localStorage.setItem('ccx:install', String(Date.now())); } catch (e) {} }
    }
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); dp = e; setTimeout(open, 1200); });
    window.addEventListener('appinstalled', function () { close(true); });
    if (ios) { steps(['اضغط زر المشاركة <b>⬆</b> في أسفل Safari', 'اختر <b>«إضافة إلى الشاشة الرئيسية»</b>']); setTimeout(open, 1800); }
    else if (safariMac) { steps(['من قائمة <b>ملف</b> في Safari', 'اختر <b>«إضافة إلى Dock»</b>']); setTimeout(open, 1800); }
    else if (ffAndroid) { steps(['اضغط قائمة المتصفح <b>⋮</b>', 'اختر <b>«تثبيت»</b>']); setTimeout(open, 1800); }
    $('installYes').addEventListener('click', function () {
      if (dp) { dp.prompt(); dp.userChoice.then(function () { dp = null; close(true); }); }
      else close(true);
    });
    $('installNo').addEventListener('click', function () { close(true); });
  })();

  var configured = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase && CLOCK);
  function show(id) { ['splash', 'gate', 'board'].forEach(function (s) { $(s).classList.toggle('show', s === id); }); }
  function toast(msg) {
    var el = $('toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('show'); }, 4200);
  }
  $('loginOpen').addEventListener('click', function () {
    if (!configured) { toast('التطبيق غير مُعدّ بعد'); return; }
    show('gate'); setTimeout(function () { $('loginUser').focus(); }, 50);
  });
  $('loginCancel').addEventListener('click', function () { show(''); });
  if (!configured) return;   // stays in public mode: bare clock only

  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });
  var DOMAIN = cfg.EMAIL_DOMAIN || 'classclock.app';

  var st = { user: null, profile: null, cid: null, chan: null, timer: null, retry: null, dirty: false, last: '', boardTimer: null, poll: null };

  /* ---------- helpers ---------- */
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hideScreens() { show(''); root.classList.remove('pub'); root.classList.add('ready'); }
  function plain(d) { return JSON.stringify({ start: d && d.start, week: d && d.week }); }
  function setSave(msg, warn) {
    var el = $('saveState'); if (!el) return;
    el.hidden = !msg; el.textContent = msg || ''; el.classList.toggle('warn', !!warn);
  }
  var logoSrc = (document.querySelector('.logo') || {}).src || '';
  $('gateLogo').src = logoSrc; $('boardLogo').src = logoSrc;

  /* ---------- profile / class loading (with offline fallback) ---------- */
  async function loadProfile(user) {
    try {
      var r = await sb.from('profiles').select('username,role,class_id,display_name').eq('user_id', user.id).single();
      if (r.error) throw r.error;
      lsSet('cc:profile', Object.assign({ uid: user.id }, r.data));
      return r.data;
    } catch (e) {
      var c = lsGet('cc:profile');
      if (c && c.uid === user.id) return c;
      throw e;
    }
  }
  async function fetchClass(id) {
    try {
      var r = await sb.from('classes').select('id,name,data,updated_at').eq('id', id).single();
      if (r.error) throw r.error;
      lsSet('cc:class:' + id, r.data);
      return r.data;
    } catch (e) {
      var c = lsGet('cc:class:' + id);
      if (c) return c;
      throw e;
    }
  }
  async function fetchAll() {
    try {
      var r = await sb.from('classes').select('id,name,data').order('id');
      if (r.error) throw r.error;
      lsSet('cc:all', r.data);
      return r.data;
    } catch (e) { return lsGet('cc:all') || []; }
  }

  /* ---------- saving ---------- */
  async function push() {
    if (!st.cid) return;
    var d = CLOCK.getData(), s = plain(d);
    if (s === st.last) { setSave('تم الحفظ ✓'); return; }
    lsSet('cc:class:' + st.cid, { id: st.cid, name: d.name, data: { start: d.start, week: d.week }, local: true });
    if (!navigator.onLine) { st.dirty = true; setSave('لا يوجد اتصال — سيُحفظ تلقائيًا عند عودته', true); return; }
    try {
      var r = await sb.from('classes').update({ data: { start: d.start, week: d.week } }).eq('id', st.cid);
      if (r.error) throw r.error;
      st.last = s; st.dirty = false; setSave('تم الحفظ ✓');
    } catch (e) {
      st.dirty = true; setSave('تعذّر الحفظ — سنعيد المحاولة', true);
      clearTimeout(st.retry); st.retry = setTimeout(push, 20000);
    }
  }
  CLOCK.hook.onSave = function () {
    if (!st.cid) return;
    var d = CLOCK.getData();
    if (plain(d) === st.last) return;
    st.dirty = true; setSave('جارٍ الحفظ…');
    clearTimeout(st.timer); st.timer = setTimeout(push, 900);
  };
  window.addEventListener('online', function () { if (st.dirty) push(); });
  window.addEventListener('pagehide', function () { if (st.dirty) push(); });

  /* ---------- live updates (principal edits show up on the class screen) ---------- */
  function applyRemote(row) {
    if (!row || !row.data || st.dirty) return;
    if (plain(row.data) === st.last) return;
    st.last = plain(row.data);
    CLOCK.setData({ name: row.name, start: row.data.start, week: row.data.week });
    lsSet('cc:class:' + row.id, row);
    toast('تم تحديث البرنامج');
  }
  function subscribe(id) {
    unsubscribe();
    try {
      st.chan = sb.channel('cls-' + id)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'classes', filter: 'id=eq.' + id }, function (p) { applyRemote(p.new); })
        .subscribe();
    } catch (e) {}
    clearInterval(st.poll);
    st.poll = setInterval(refetch, 5 * 60 * 1000);
  }
  function unsubscribe() {
    if (st.chan) { try { sb.removeChannel(st.chan); } catch (e) {} st.chan = null; }
    clearInterval(st.poll);
  }
  async function refetch() {
    if (!st.cid || !navigator.onLine || st.dirty) return;
    try {
      var r = await sb.from('classes').select('id,name,data').eq('id', st.cid).single();
      if (!r.error) applyRemote(r.data);
    } catch (e) {}
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refetch(); });

  /* ---------- screens ---------- */
  function setChrome() {
    var p = st.profile, principal = p.role === 'principal';
    $('userChip').hidden = false; $('userChip').textContent = p.display_name || p.username;
    $('outBtn').hidden = false;
    $('allBtn').hidden = !principal;
    CLOCK.lockName(true);
  }

  async function openClass(id) {
    st.cid = null; unsubscribe();
    $('splashMsg').textContent = 'جارٍ تحميل البرنامج…'; show('splash');
    var row;
    try { row = await fetchClass(id); }
    catch (e) { $('splashMsg').textContent = 'تعذّر تحميل البرنامج. تأكّدي من الاتصال.'; setTimeout(function () { st.profile && st.profile.role === 'principal' ? showBoard() : show('gate'); }, 2500); return; }
    var data = row.data && row.data.week ? row.data : { start: 480, week: {} };
    CLOCK.setData({ name: row.name, start: data.start, week: data.week });
    st.cid = id; st.last = plain(data); st.dirty = false;
    setChrome(); setSave('تم الحفظ ✓');
    hideScreens();
    subscribe(id);
    if (row.local) { st.last = ''; st.dirty = true; push(); }   // unsent offline edits
  }

  function statusText(s) {
    if (s.state === 'weekend') return { t: 'اليوم عطلة', sub: '', icon: 'school' };
    if (s.state === 'before') return { t: 'لم يبدأ الدوام', sub: 'يبدأ الساعة ' + s.at, icon: 'school' };
    if (s.state === 'after') return { t: 'انتهى الدوام', sub: 'إلى اللقاء', icon: 'bag' };
    return { t: s.name, sub: 'باقي ' + s.rem + ' دقيقة' + (s.next ? ' · بعدها: ' + s.next : ''), icon: s.icon };
  }
  async function renderBoard() {
    var rows = await fetchAll(), h = '';
    rows.forEach(function (c) {
      var d = c.data && c.data.week ? c.data : { start: 480, week: {} };
      var s = statusText(CLOCK.statusOf(d)), th = CLOCK.theme(s.icon);
      h += '<button class="cls-card" type="button" data-id="' + esc(c.id) + '" style="--ct:' + th[0] + ';--cb:' + th[1] + ';--cd:' + th[2] + '">' +
        '<div class="cls-name">' + esc(c.name) + '</div><div class="cls-ico">' + CLOCK.icon(s.icon) + '</div>' +
        '<div class="cls-now">' + esc(s.t) + '</div><div class="cls-sub">' + esc(s.sub) + '</div><div class="cls-open">فتح البرنامج وتعديله ←</div></button>';
    });
    $('boardGrid').innerHTML = h || '<p>لا توجد صفوف.</p>';
  }
  function showBoard() {
    st.cid = null; unsubscribe();
    if (st.dirty) push();
    $('boardUser').textContent = st.profile.display_name || st.profile.username;
    renderBoard(); root.classList.remove('pub'); show('board');
    clearInterval(st.boardTimer); st.boardTimer = setInterval(function () { if ($('board').classList.contains('show')) renderBoard(); }, 30000);
  }
  $('boardGrid').addEventListener('click', function (e) {
    var b = e.target.closest('.cls-card'); if (b) openClass(b.getAttribute('data-id'));
  });
  $('allBtn').addEventListener('click', function () { showBoard(); });

  function armed(btn, label, fn) {
    var t = null, orig = btn.textContent;
    btn.addEventListener('click', function () {
      if (btn.dataset.armed) { clearTimeout(t); delete btn.dataset.armed; btn.textContent = orig; fn(); return; }
      btn.dataset.armed = '1'; btn.textContent = label;
      t = setTimeout(function () { delete btn.dataset.armed; btn.textContent = orig; }, 3000);
    });
  }
  function wipeCaches() {
    try { Object.keys(localStorage).forEach(function (k) { if (/^cc:/.test(k)) localStorage.removeItem(k); }); } catch (e) {}
  }
  async function logout() {
    if (st.dirty) { try { await push(); } catch (e) {} }
    unsubscribe(); st.cid = null;
    try { await sb.auth.signOut(); } catch (e) {}
    wipeCaches();
    location.reload();
  }
  armed($('outBtn'), 'تأكيد الخروج؟', function () { guard(logout); });
  armed($('boardOut'), 'تأكيد الخروج؟', function () { guard(logout); });

  /* ---------- protected actions (settings / logout ask for the password again) ---------- */
  var enc = new TextEncoder();
  function b64(buf) { return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))); }
  function unb64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  async function derive(pass, salt) {
    var key = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
    return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 150000, hash: 'SHA-256' }, key, 256));
  }
  async function storeLock(uid, pass) {      // salted PBKDF2 hash, only to re-check the password while offline
    try {
      var salt = crypto.getRandomValues(new Uint8Array(16));
      lsSet('cc:lock', { u: uid, s: b64(salt), h: await derive(pass, salt) });
    } catch (e) {}
  }
  var unlockedUntil = 0, lockFails = 0, lockBlock = 0, pending = null;
  async function checkPass(pass) {
    if (navigator.onLine && st.user) {
      var email = st.user.email || '';
      try {
        var r = await sb.auth.signInWithPassword({ email: email, password: pass });
        if (!r.error) { await storeLock(st.user.id, pass); return true; }
        if (!/fetch|network/i.test(r.error.message)) return false;
      } catch (e) {}
    }
    var l = lsGet('cc:lock');
    if (l && st.user && l.u === st.user.id) {
      try { return (await derive(pass, unb64(l.s))) === l.h; } catch (e) {}
    }
    return null;                                // cannot verify (offline and no local record)
  }
  function guard(next) {
    if (Date.now() < unlockedUntil) { unlockedUntil = Date.now() + 5 * 60 * 1000; next(); return; }
    pending = next; $('lockErr').textContent = ''; $('lockPass').value = '';
    $('lock').classList.add('show'); setTimeout(function () { $('lockPass').focus(); }, 50);
  }
  CLOCK.hook.guard = guard;
  $('lockCancel').addEventListener('click', function () { pending = null; $('lock').classList.remove('show'); });
  $('lockForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var go = $('lockGo'), err = $('lockErr');
    if (Date.now() < lockBlock) return;
    go.disabled = true;
    var ok = await checkPass($('lockPass').value);
    go.disabled = false;
    if (ok === true) {
      lockFails = 0; unlockedUntil = Date.now() + 5 * 60 * 1000;
      $('lock').classList.remove('show'); $('lockPass').value = '';
      var f = pending; pending = null; if (f) f();
    } else if (ok === null) {
      err.textContent = 'لا يمكن التحقق دون إنترنت. حاولي عند عودة الاتصال.';
    } else {
      lockFails++; err.textContent = 'كلمة المرور غير صحيحة';
      if (lockFails >= 3) { lockBlock = Date.now() + Math.min(300, 5 * Math.pow(2, lockFails - 2)) * 1000; err.textContent += ' — انتظري قليلًا'; }
    }
  });

  /* ---------- login ---------- */
  function emailOf(u) { return String(u).trim().toLowerCase().replace(/\s+/g, '') + '@' + DOMAIN; }
  var fails = 0, until = 0;
  function backoff(btn, label) {
    var n = fails - 2;                       // 3 wrong tries -> 10s, 20s, 40s ... max 5 min
    if (n < 1) return;
    until = Date.now() + Math.min(300, 5 * Math.pow(2, n)) * 1000;
    (function tick() {
      var left = Math.ceil((until - Date.now()) / 1000);
      if (left <= 0) { btn.disabled = false; btn.textContent = label; return; }
      btn.disabled = true; btn.textContent = 'انتظري ' + left + ' ثانية';
      setTimeout(tick, 500);
    })();
  }
  $('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var go = $('loginGo'), err = $('loginErr');
    if (Date.now() < until) return;
    err.textContent = ''; go.disabled = true; go.textContent = 'جارٍ الدخول…';
    try {
      var r = await sb.auth.signInWithPassword({ email: emailOf($('loginUser').value), password: $('loginPass').value });
      if (r.error) {
        var net = /fetch|network/i.test(r.error.message);
        if (!net) fails++;
        err.textContent = net ? 'لا يوجد اتصال بالإنترنت' : 'اسم المستخدم أو كلمة المرور غير صحيحة';
      } else {
        fails = 0;
        await storeLock(r.data.user.id, $('loginPass').value);
        $('loginPass').value = '';
        await enter(r.data.user);
      }
    } catch (x) { err.textContent = 'تعذّر الدخول. حاولي مرة أخرى.'; }
    go.disabled = false; go.textContent = 'دخول'; backoff(go, 'دخول');
  });

  async function enter(user) {
    st.user = user;
    try { st.profile = await loadProfile(user); }
    catch (e) { await sb.auth.signOut(); $('loginErr').textContent = 'هذا الحساب غير مفعّل. تواصلي مع الإدارة.'; show('gate'); return; }
    if (st.profile.role === 'principal') { setChrome(); showBoard(); }
    else if (st.profile.class_id) await openClass(st.profile.class_id);
    else { $('loginErr').textContent = 'لم يُربط الحساب بصف.'; show('gate'); }
  }

  sb.auth.onAuthStateChange(function (ev) { if (ev === 'SIGNED_OUT' && st.user) location.reload(); });

  /* ---------- boot ---------- */
  (async function boot() {
    var saved = false;
    try { saved = Object.keys(localStorage).some(function (k) { return /^sb-.*-auth-token$/.test(k); }); } catch (e) {}
    if (!saved) return;                   // not logged in on this device: public clock only
    $('splashMsg').textContent = 'جارٍ التحميل…'; show('splash');
    try {
      var s = await sb.auth.getSession();
      if (s.data && s.data.session) { await enter(s.data.session.user); return; }
    } catch (e) {}
    show('');                               // session invalid: back to the public clock
  })();
})();
