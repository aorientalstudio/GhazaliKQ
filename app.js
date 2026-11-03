(function(){
'use strict';
var $=function(id){return document.getElementById(id);};
var VERSION='v1.0';
var KEY='classclock:prefs1';
try{localStorage.removeItem('classclock:v4');localStorage.removeItem('classclock:v3');}catch(e){}
var DAY_KEYS=['sun','mon','tue','wed','thu'];
var DAY_NAMES={sun:'الأحد',mon:'الإثنين',tue:'الثلاثاء',wed:'الأربعاء',thu:'الخميس'};
var WEEKDAY_IDX=['sun','mon','tue','wed','thu','fri','sat'];
function todayKey(){var d=new Date().getDay();return d<=4?WEEKDAY_IDX[d]:null;}

/* ---------- illustrations (inline SVG: identical on any screen, fully offline) ---------- */
var ICONS={
arabic:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><path d="M6 30 V80 Q28 70 50 85 Q72 70 94 80 V30 Q72 20 50 30 Q28 20 6 30Z" fill="url(#gbkffd36b)" stroke="#b9692a" stroke-width="2.5" stroke-linejoin="round"/><path d="M10 28 Q30 21 49 31 V77 Q30 68 10 74Z" fill="url(#gpg)"/><path d="M90 28 Q70 21 51 31 V77 Q70 68 90 74Z" fill="url(#gpg2)"/><path d="M10 74 Q30 68 49 77 M10 71 Q30 65 49 74 M90 74 Q70 68 51 77 M90 71 Q70 65 51 74" stroke="#d9c79c" stroke-width="1.4" fill="none"/><path d="M50 31 V78" stroke="#c9b585" stroke-width="2.4"/><text x="31.6" y="51.2" text-anchor="middle" dominant-baseline="central" font-size="31" font-weight="800" fill="#a8330f" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">أ</text><text x="30" y="49" text-anchor="middle" dominant-baseline="central" font-size="31" font-weight="800" fill="#e8552d" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">أ</text><text x="71.6" y="51.2" text-anchor="middle" dominant-baseline="central" font-size="31" font-weight="800" fill="#16569c" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">ب</text><text x="70" y="49" text-anchor="middle" dominant-baseline="central" font-size="31" font-weight="800" fill="#2c86d8" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">ب</text></svg>`,
math:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><path d="M40 53.9 L49.9 44 L49.9 77 L40 86.9 Z" fill="#2370b8" stroke="#2370b8" stroke-width="2.4" stroke-linejoin="round"/><path d="M7 53.9 L16.9 44 L49.9 44 L40 53.9 Z" fill="#b4e1ff" stroke="#b4e1ff" stroke-width="2.4" stroke-linejoin="round"/><rect x="7" y="53.9" width="33" height="33" rx="3" fill="url(#gcfblue)" stroke="#2f86d6" stroke-width="2.4" stroke-linejoin="round"/><path d="M11 57.4 H35" stroke="#fff" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/><text x="23.5" y="71.80000000000001" text-anchor="middle" dominant-baseline="central" font-size="23.759999999999998" font-weight="800" fill="#2370b8" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">1</text><text x="23.5" y="70.4" text-anchor="middle" dominant-baseline="central" font-size="23.759999999999998" font-weight="800" fill="#fff" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">1</text><path d="M87 53.9 L96.9 44 L96.9 77 L87 86.9 Z" fill="#c75a10" stroke="#c75a10" stroke-width="2.4" stroke-linejoin="round"/><path d="M54 53.9 L63.9 44 L96.9 44 L87 53.9 Z" fill="#ffdca8" stroke="#ffdca8" stroke-width="2.4" stroke-linejoin="round"/><rect x="54" y="53.9" width="33" height="33" rx="3" fill="url(#gcforange)" stroke="#f2761e" stroke-width="2.4" stroke-linejoin="round"/><path d="M58 57.4 H82" stroke="#fff" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/><text x="70.5" y="71.80000000000001" text-anchor="middle" dominant-baseline="central" font-size="23.759999999999998" font-weight="800" fill="#c75a10" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">2</text><text x="70.5" y="70.4" text-anchor="middle" dominant-baseline="central" font-size="23.759999999999998" font-weight="800" fill="#fff" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">2</text><circle cx="50" cy="30" r="13" fill="url(#gPlus)" stroke="#1f8a2e" stroke-width="2"/><path d="M50 23v14M43 30h14" stroke="#fff" stroke-width="5" stroke-linecap="round"/><ellipse cx="45" cy="23.5" rx="4" ry="2.2" fill="#fff" opacity=".6" transform="rotate(-35 45 23.5)"/></svg>`,
english:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><path d="M39 59.3 L48.3 50 L48.3 81 L39 90.3 Z" fill="#bd3470" stroke="#bd3470" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 59.3 L17.299999999999997 50 L48.3 50 L39 59.3 Z" fill="#ffcde0" stroke="#ffcde0" stroke-width="2.4" stroke-linejoin="round"/><rect x="8" y="59.3" width="31" height="31" rx="3" fill="url(#gcfpink)" stroke="#e84c8b" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 62.8 H34" stroke="#fff" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/><text x="23.5" y="76.2" text-anchor="middle" dominant-baseline="central" font-size="22.32" font-weight="800" fill="#bd3470" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">A</text><text x="23.5" y="74.8" text-anchor="middle" dominant-baseline="central" font-size="22.32" font-weight="800" fill="#fff" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">A</text><path d="M86 59.3 L95.3 50 L95.3 81 L86 90.3 Z" fill="#5f3bb8" stroke="#5f3bb8" stroke-width="2.4" stroke-linejoin="round"/><path d="M55 59.3 L64.3 50 L95.3 50 L86 59.3 Z" fill="#e0d0ff" stroke="#e0d0ff" stroke-width="2.4" stroke-linejoin="round"/><rect x="55" y="59.3" width="31" height="31" rx="3" fill="url(#gcfpurple)" stroke="#7d52e0" stroke-width="2.4" stroke-linejoin="round"/><path d="M59 62.8 H81" stroke="#fff" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/><text x="70.5" y="76.2" text-anchor="middle" dominant-baseline="central" font-size="22.32" font-weight="800" fill="#5f3bb8" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">B</text><text x="70.5" y="74.8" text-anchor="middle" dominant-baseline="central" font-size="22.32" font-weight="800" fill="#fff" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">B</text><path d="M63 26.1 L71.1 18 L71.1 45 L63 53.1 Z" fill="#c47a0c" stroke="#c47a0c" stroke-width="2.4" stroke-linejoin="round"/><path d="M36 26.1 L44.1 18 L71.1 18 L63 26.1 Z" fill="#fff0b0" stroke="#fff0b0" stroke-width="2.4" stroke-linejoin="round"/><rect x="36" y="26.1" width="27" height="27" rx="3" fill="url(#gcfyellow)" stroke="#f0a11d" stroke-width="2.4" stroke-linejoin="round"/><path d="M40 29.6 H58" stroke="#fff" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/><text x="49.5" y="41.0" text-anchor="middle" dominant-baseline="central" font-size="19.439999999999998" font-weight="800" fill="#c47a0c" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">C</text><text x="49.5" y="39.6" text-anchor="middle" dominant-baseline="central" font-size="19.439999999999998" font-weight="800" fill="#fff" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">C</text></svg>`,
science:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><path d="M40 34 L21 74 Q17 87 32 87 H68 Q83 87 79 74 L60 34Z" fill="url(#gGlass)" stroke="#7cc3e6" stroke-width="2.5" stroke-linejoin="round"/><path d="M28 60 Q50 54 72 60 L79 74 Q83 87 68 87 H32 Q17 87 21 74Z" fill="url(#gLiq)"/><path d="M28 60 Q50 66 72 60" stroke="#e6ffd8" stroke-width="2.5" fill="none" opacity=".8"/><rect x="39" y="10" width="22" height="28" rx="5" fill="url(#gGlass)" stroke="#7cc3e6" stroke-width="2.5"/><ellipse cx="50" cy="10.5" rx="13" ry="3.8" fill="#eaf8ff" stroke="#7cc3e6" stroke-width="2"/><circle cx="42" cy="72" r="5" fill="#fff" opacity=".85"/><circle cx="58" cy="68" r="3.5" fill="#fff" opacity=".85"/><circle cx="52" cy="78" r="3" fill="#fff" opacity=".85"/><circle cx="55" cy="46" r="3" fill="#7ee09a" opacity=".9"/><circle cx="47" cy="40" r="2.2" fill="#7ee09a" opacity=".9"/><path d="M35 42 L26 68" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/></svg>`,
art:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><path d="M52 14C28 14 12 30 12 50s18 34 38 34c11 0 17-10 11-18-3-6 0-10 9-9 13 1 17-7 13-18C78 25 70 14 52 14Z" fill="#c27a35" transform="translate(0,5)"/><path d="M52 14C28 14 12 30 12 50s18 34 38 34c11 0 17-10 11-18-3-6 0-10 9-9 13 1 17-7 13-18C78 25 70 14 52 14Z" fill="url(#gWood)" stroke="#d99048" stroke-width="2" stroke-linejoin="round"/><ellipse cx="62" cy="68" rx="7.5" ry="6" fill="#c98544"/><ellipse cx="62" cy="67" rx="6.5" ry="5" fill="#f4c383" opacity=".7"/><circle cx="32" cy="37.2" r="7.5" fill="#b81d1d"/><circle cx="32" cy="36" r="7.5" fill="url(#gdotr)"/><ellipse cx="29.375" cy="33.0" rx="2.4" ry="1.3499999999999999" fill="#fff" opacity=".75" transform="rotate(-35 29.375 33.0)"/><circle cx="51" cy="29.2" r="7.5" fill="#1a5ba8"/><circle cx="51" cy="28" r="7.5" fill="url(#gdotb)"/><ellipse cx="48.375" cy="25.0" rx="2.4" ry="1.3499999999999999" fill="#fff" opacity=".75" transform="rotate(-35 48.375 25.0)"/><circle cx="69" cy="37.2" r="7.5" fill="#c98a05"/><circle cx="69" cy="36" r="7.5" fill="url(#gdoty)"/><ellipse cx="66.375" cy="33.0" rx="2.4" ry="1.3499999999999999" fill="#fff" opacity=".75" transform="rotate(-35 66.375 33.0)"/><circle cx="30" cy="59.2" r="7.5" fill="#237f2e"/><circle cx="30" cy="58" r="7.5" fill="url(#gdotg)"/><ellipse cx="27.375" cy="55.0" rx="2.4" ry="1.3499999999999999" fill="#fff" opacity=".75" transform="rotate(-35 27.375 55.0)"/><g transform="translate(-9 6) rotate(30 80 56)"><rect x="75" y="30" width="10" height="52" rx="5" fill="url(#gHandle)" stroke="#a96b2d" stroke-width="1.5"/><rect x="74" y="24" width="12" height="13" rx="2" fill="url(#gMetal)" stroke="#7d8696" stroke-width="1.2"/><path d="M74 24 Q80 6 86 24Z" fill="#ff4d6a" stroke="#c4284a" stroke-width="1.2"/></g></svg>`,
sport:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><circle cx="50" cy="48" r="36" fill="url(#gspsport)"/><g clip-path="url(#gClipBall)" fill="none" stroke="#5a2a08" stroke-width="3.2" stroke-linecap="round"><path d="M50 10 V86"/><path d="M12 48 H88"/><path d="M24 16 Q46 48 24 80"/><path d="M76 16 Q54 48 76 80"/></g><ellipse cx="37.04" cy="30.0" rx="10.080000000000002" ry="5.76" fill="#fff" opacity="0.75" transform="rotate(-35 37.04 30.0)"/><circle cx="32.0" cy="40.08" r="2.16" fill="#fff" opacity=".9"/></svg>`,
music:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><circle cx="50" cy="48" r="38" fill="#fff" opacity=".0"/><rect x="40" y="22" width="7" height="50" rx="3.5" fill="#5a38c4"/><rect x="78" y="14" width="7" height="50" rx="3.5" fill="#5a38c4"/><path d="M40 22 L85 12 V28 L40 38Z" fill="url(#gBeam)" stroke="#4325a8" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="32" cy="72" rx="14" ry="11" fill="url(#gNote)" stroke="#3b1f95" stroke-width="1.5" transform="rotate(-22 32 72)"/><ellipse cx="70" cy="64" rx="14" ry="11" fill="url(#gNote)" stroke="#3b1f95" stroke-width="1.5" transform="rotate(-22 70 64)"/><ellipse cx="27" cy="68" rx="5" ry="2.6" fill="#fff" opacity=".65" transform="rotate(-40 27 68)"/><ellipse cx="65" cy="60" rx="5" ry="2.6" fill="#fff" opacity=".65" transform="rotate(-40 65 60)"/><path d="M16 28l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" fill="#ffd23f" stroke="#e59a12" stroke-width=".8"/></svg>`,
break:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><path d="M34 34 V24 Q34 14 44 14 H56 Q66 14 66 24 V34" fill="none" stroke="#b86a1e" stroke-width="6" stroke-linecap="round"/><rect x="14" y="42" width="72" height="44" rx="12" fill="url(#gLB)" stroke="#d1631a" stroke-width="2"/><rect x="10" y="30" width="80" height="18" rx="9" fill="url(#gLid)" stroke="#d98a12" stroke-width="2"/><rect x="15" y="34" width="40" height="4" rx="2" fill="#fff" opacity=".65"/><rect x="43" y="43" width="14" height="10" rx="3.5" fill="#fff3b0" stroke="#d98a12" stroke-width="1.6"/><ellipse cx="36" cy="64" rx="4" ry="5" fill="#6a3b12"/><ellipse cx="64" cy="64" rx="4" ry="5" fill="#6a3b12"/><circle cx="34.8" cy="62.2" r="1.5" fill="#fff"/><circle cx="62.8" cy="62.2" r="1.5" fill="#fff"/><path d="M40 73 Q50 82 60 73" stroke="#6a3b12" stroke-width="3.4" fill="none" stroke-linecap="round"/><ellipse cx="27" cy="72" rx="5" ry="3.4" fill="#ff7f7f" opacity=".55"/><ellipse cx="73" cy="72" rx="5" ry="3.4" fill="#ff7f7f" opacity=".55"/></svg>`,
reading:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><path d="M6 30 V80 Q28 70 50 85 Q72 70 94 80 V30 Q72 20 50 30 Q28 20 6 30Z" fill="url(#gbk79dcae)" stroke="#1b7d52" stroke-width="2.5" stroke-linejoin="round"/><path d="M10 28 Q30 21 49 31 V77 Q30 68 10 74Z" fill="url(#gpg)"/><path d="M90 28 Q70 21 51 31 V77 Q70 68 90 74Z" fill="url(#gpg2)"/><path d="M10 74 Q30 68 49 77 M10 71 Q30 65 49 74 M90 74 Q70 68 51 77 M90 71 Q70 65 51 74" stroke="#d9c79c" stroke-width="1.4" fill="none"/><path d="M50 31 V78" stroke="#c9b585" stroke-width="2.4"/><path d="M18 40 Q28 36 42 40 M18 49 Q28 45 42 49 M18 58 Q28 54 42 58" stroke="#8fc9ad" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M70 36l4 9 10 1-7.5 6.5 2.5 9.7L70 57l-9 5.7 2.5-9.7L56 46l10-1z" fill="url(#gStarS)" stroke="#e0951b" stroke-width="2" stroke-linejoin="round"/></svg>`,
general:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><path d="M50 9l11.5 27.5 29.5 2.5-22.4 19.5 6.9 29L50 72.5 24.5 87.5l6.9-29L9 38.9l29.5-2.5z" fill="#d58a10" stroke="#d58a10" stroke-width="7" stroke-linejoin="round" transform="translate(0,5)"/><path d="M50 9l11.5 27.5 29.5 2.5-22.4 19.5 6.9 29L50 72.5 24.5 87.5l6.9-29L9 38.9l29.5-2.5z" fill="url(#gStar)" stroke="url(#gStarE)" stroke-width="7" stroke-linejoin="round"/><ellipse cx="40" cy="34" rx="9" ry="4.5" fill="#fff" opacity=".7" transform="rotate(-50 40 34)"/></svg>`,
hebrew:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><path d="M68 34.2 L84.2 18 L84.2 72 L68 88.2 Z" fill="#14808a" stroke="#14808a" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 34.2 L30.2 18 L84.2 18 L68 34.2 Z" fill="#b6f3f0" stroke="#b6f3f0" stroke-width="2.4" stroke-linejoin="round"/><rect x="14" y="34.2" width="54" height="54" rx="3" fill="url(#gcfteal)" stroke="#1fa5ad" stroke-width="2.4" stroke-linejoin="round"/><path d="M18 37.7 H63" stroke="#fff" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/><text x="41.0" y="62.6" text-anchor="middle" dominant-baseline="central" font-size="29" font-weight="800" fill="#14808a" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">אב</text><text x="41.0" y="61.2" text-anchor="middle" dominant-baseline="central" font-size="29" font-weight="800" fill="#fff" font-family="'Baloo Bhaijaan 2',Arial,sans-serif">אב</text></svg>`,
nature:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><circle cx="50" cy="48" r="36" fill="url(#gspnat)"/><g clip-path="url(#gClipBall)"><path d="M26 36 Q36 22 52 28 Q58 36 48 42 Q54 52 42 56 Q30 54 24 46Z" fill="url(#gLand)" stroke="#2f8a4b" stroke-width="1.5"/><path d="M58 52 Q74 46 80 60 Q76 78 62 76 Q52 66 58 52Z" fill="url(#gLand)" stroke="#2f8a4b" stroke-width="1.5"/><path d="M62 24 Q74 22 78 32 Q70 38 62 32Z" fill="url(#gLand)" stroke="#2f8a4b" stroke-width="1.5"/><ellipse cx="50" cy="48" rx="36" ry="36" fill="none"/></g><path d="M16 62 Q50 92 84 62" stroke="#0f4a96" stroke-width="5" fill="none" opacity=".25" clip-path="url(#gClipBall)"/><ellipse cx="37.04" cy="30.0" rx="10.080000000000002" ry="5.76" fill="#fff" opacity="0.75" transform="rotate(-35 37.04 30.0)"/><circle cx="32.0" cy="40.08" r="2.16" fill="#fff" opacity=".9"/></svg>`,
life:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><circle cx="50" cy="48" r="36" fill="url(#gsplife)"/><ellipse cx="38" cy="43" rx="5" ry="6.5" fill="#6a3b12"/><ellipse cx="62" cy="43" rx="5" ry="6.5" fill="#6a3b12"/><circle cx="36.5" cy="40.5" r="1.9" fill="#fff"/><circle cx="60.5" cy="40.5" r="1.9" fill="#fff"/><path d="M32 58 Q50 78 68 58" fill="#6a3b12" stroke="#6a3b12" stroke-width="3" stroke-linejoin="round"/><path d="M38 63 Q50 72 62 63 Q50 66 38 63Z" fill="#ff8a8a"/><ellipse cx="28" cy="56" rx="6" ry="4" fill="#ff7f7f" opacity=".55"/><ellipse cx="72" cy="56" rx="6" ry="4" fill="#ff7f7f" opacity=".55"/><ellipse cx="37.04" cy="30.0" rx="10.080000000000002" ry="5.76" fill="#fff" opacity="0.75" transform="rotate(-35 37.04 30.0)"/><circle cx="32.0" cy="40.08" r="2.16" fill="#fff" opacity=".9"/></svg>`,
heart:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><path d="M50 84C19 61 12 40 25 27c9-9 22-4 25 6 3-10 16-15 25-6 13 13 6 34-25 57z" fill="#a31c4d" transform="translate(0,5)"/><path d="M50 84C19 61 12 40 25 27c9-9 22-4 25 6 3-10 16-15 25-6 13 13 6 34-25 57z" fill="url(#ghe)" stroke="#d4336b" stroke-width="2" stroke-linejoin="round"/><ellipse cx="33" cy="36" rx="9" ry="5.5" fill="#fff" opacity=".6" transform="rotate(-38 33 36)"/><g stroke="#b01f55" stroke-opacity=".35" stroke-width="6" stroke-linecap="round" fill="none" transform="translate(1.5,2)"><circle cx="50" cy="45" r="6.5"/><path d="M50 51v18M50 60h8M50 67h6"/></g><g stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="50" cy="45" r="6.5"/><path d="M50 51v18M50 60h8M50 67h6"/></g></svg>`,
traffic:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><rect x="44" y="76" width="12" height="14" rx="3" fill="#6c789e"/><rect x="28" y="6" width="44" height="76" rx="18" fill="url(#gHouse)" stroke="#3e4a74" stroke-width="2.5"/><circle cx="50" cy="24" r="12.5" fill="#2e3556"/><circle cx="50" cy="24" r="10.5" fill="url(#glampr)"/><ellipse cx="46" cy="20" rx="4" ry="2.4" fill="#fff" opacity=".7" transform="rotate(-35 46 20)"/><circle cx="50" cy="45" r="12.5" fill="#2e3556"/><circle cx="50" cy="45" r="10.5" fill="url(#glampy)"/><ellipse cx="46" cy="41" rx="4" ry="2.4" fill="#fff" opacity=".7" transform="rotate(-35 46 41)"/><circle cx="50" cy="66" r="12.5" fill="#2e3556"/><circle cx="50" cy="66" r="10.5" fill="url(#glampg)"/><ellipse cx="46" cy="62" rx="4" ry="2.4" fill="#fff" opacity=".7" transform="rotate(-35 46 62)"/></svg>`,
rest:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><ellipse cx="50" cy="87" rx="26" ry="5" fill="#8fd4f5" opacity=".55"/><path d="M50 8C50 8 20 42 20 62a30 30 0 0 0 60 0C80 42 50 8 50 8z" fill="url(#gDrop)" stroke="#2f9be0" stroke-width="2" stroke-linejoin="round"/><path d="M34 60 Q34 74 46 79" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/><ellipse cx="38" cy="46" rx="4" ry="8" fill="#fff" opacity=".7" transform="rotate(25 38 46)"/></svg>`,
bag:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><path d="M38 28 V20 Q38 10 50 10 Q62 10 62 20 V28" fill="none" stroke="#5f3bb8" stroke-width="5.5" stroke-linecap="round"/><rect x="18" y="52" width="10" height="22" rx="5" fill="#6a43c9"/><rect x="72" y="52" width="10" height="22" rx="5" fill="#6a43c9"/><rect x="22" y="24" width="56" height="64" rx="22" fill="url(#gBag)" stroke="#5f3bb8" stroke-width="2.5"/><path d="M24 48 Q50 62 76 48" stroke="#5f3bb8" stroke-width="3" fill="none" opacity=".55"/><rect x="32" y="58" width="36" height="24" rx="10" fill="url(#gPocket)" stroke="#6a43c9" stroke-width="2"/><path d="M38 66 H62" stroke="#6a43c9" stroke-width="2.5" stroke-linecap="round" opacity=".6"/><rect x="46" y="62" width="8" height="10" rx="3" fill="#ffd23f" stroke="#d98a12" stroke-width="1.4"/><path d="M30 36 Q28 46 31 54" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55" fill="none"/></svg>`,
school:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="34" ry="6" fill="url(#gSh)"/><path d="M62 48 L86 40 V80 L62 88Z" fill="url(#gSide)" stroke="#c97a2a" stroke-width="2" stroke-linejoin="round"/><path d="M39 26 L62 48 L86 40 L63 18Z" fill="url(#gRoof2)" stroke="#b83030" stroke-width="2" stroke-linejoin="round"/><rect x="14" y="48" width="48" height="40" rx="2" fill="url(#gFront)" stroke="#e0a64a" stroke-width="2" stroke-linejoin="round"/><path d="M12 49 L39 26 L64 49Z" fill="url(#gRoof)" stroke="#b83030" stroke-width="2" stroke-linejoin="round"/><circle cx="39" cy="40" r="5" fill="url(#gWin)" stroke="#c4a05a" stroke-width="1.6"/><rect x="32" y="62" width="14" height="26" rx="4" fill="url(#gDoor)" stroke="#4e2a10" stroke-width="1.6"/><circle cx="42.5" cy="76" r="1.5" fill="#ffd23f"/><rect x="18" y="56" width="10" height="10" rx="2" fill="url(#gWin)" stroke="#c4a05a" stroke-width="1.6"/><rect x="50" y="56" width="10" height="10" rx="2" fill="url(#gWin)" stroke="#c4a05a" stroke-width="1.6"/><path d="M63 18 V4" stroke="#8a5a2a" stroke-width="2.2" stroke-linecap="round"/><path d="M63 4 L77 9 L63 14Z" fill="#ff5a5a" stroke="#c4284a" stroke-width="1"/></svg>`
};

var INNER={};
function inner(k){if(!INNER[k])INNER[k]=ICONS[k].replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');return INNER[k];}

/* [tint, accent, deep] per illustration */
var THEME={
arabic:['#fff1d8','#e7bd70','#b9822f'],math:['#e3f4ff','#91c9ec','#3f8fbd'],english:['#f0e5ff','#b49adf','#7d5db8'],
science:['#def7ed','#8fcdb5','#3f9a7e'],art:['#ffeae1','#efb29f','#c9735a'],sport:['#ffe6da','#efa78f','#cb6c50'],
music:['#e6eaff','#abbef0','#6a82c9'],break:['#eaf8dc','#b2dd8c','#5fa23a'],reading:['#e3f7ec','#9fd9be','#4ea67f'],
general:['#f0eaff','#b9adeb','#7f6fcf'],hebrew:['#e0f4f6','#8fd0da','#3f9aa8'],nature:['#e1f1ff','#9ccbf0','#4a8fc4'],
life:['#ffecd9','#f4b784','#cc7d3c'],heart:['#ffe4ec','#f4a3bb','#cf5f84'],traffic:['#e8ecf6','#a9b4d4','#6572a0'],
rest:['#dff6f6','#85d3d6','#3a9ea3'],bag:['#eee9ff','#bfb1f0','#7f6fcf'],school:['#fff0dc','#f1c28a','#c98a45']
};
var SUB={
arabic:'نتعلّم الحروف والكلمات',math:'نعدّ ونحلّ مسائل ممتعة',english:'نتعلّم كلمات جديدة',science:'نكتشف العالم من حولنا',
art:'نبدع بالألوان والخيال',sport:'نتحرّك ونلعب معًا',music:'نغنّي ونتعلّم الإيقاع',break:'وقت اللعب والراحة',
reading:'نقرأ قصصًا جميلة',general:'هيا نتعلّم معًا',hebrew:'نتعلّم كلمات عبرية جديدة',nature:'نتعرّف على الإنسان وبيئته',
life:'نتعلّم مهارات تفيدنا كل يوم',heart:'نتحدّث عن مشاعرنا ونهتمّ ببعضنا',traffic:'نتعلّم كيف نعبر الطريق بأمان',
rest:'وقت قصير للراحة'
};
var LABELS={arabic:'لغة عربية',math:'حساب',hebrew:'لغة عبرية',english:'لغة إنجليزية',science:'علوم',nature:'الإنسان والبيئة',life:'مهارات حياتية',heart:'مفتاح القلب',art:'فنون ورسم',sport:'رياضة',music:'موسيقى',traffic:'السلامة المرورية',reading:'قراءة',rest:'استراحة قصيرة',break:'فرصة',general:'نشاط عام'};
var TYPES={lesson:'حصة',rest:'استراحة',break:'فرصة',activity:'فعالية'};
var TAGS={lesson:'حصّتنا الآن',rest:'وقت الاستراحة',break:'وقت الفرصة',activity:'فعاليتنا الآن'};
var SUBJ={'لغة عربية':'arabic','علوم':'science','الإنسان والبيئة':'nature','مهارات حياتية':'life','مفتاح القلب':'heart','تربية بدنية':'sport','موسيقى':'music','حساب':'math','رياضيات':'math','لغة عبرية':'hebrew','فنون تطبيقية':'art','السلامة المرورية':'traffic','لغة إنجليزية':'english','رياضة':'sport','قراءة':'reading','استراحة':'rest','فرصة':'break','فرصة ثانية':'break'};
var EMOJI={'📖':'arabic','📘':'hebrew','🔬':'science','🌍':'nature','🧩':'life','💗':'heart','⚽':'sport','🎵':'music','🔢':'math','🎨':'art','🚦':'traffic','💧':'rest','🍎':'break','🥪':'break','🏃':'sport','✏️':'arabic'};
function iconFor(name){var f=String(name).split('/')[0].trim();return SUBJ[f]||null;}

/* ---------- default weekly schedule (Sun–Thu) ---------- */
function lesson(n,d){return{name:n,type:'lesson',icon:iconFor(n)||'general',dur:d};}
function rest(){return{name:'استراحة',type:'rest',icon:'rest',dur:5};}
function brk(n,d){return{name:n,type:'break',icon:'break',dur:d};}
var DEFAULT={className:'',start:480,offset:0,sound:true,cheer:true,speak:false,vol:0.7,sndv:2,digital:true,week:{sun:[],mon:[],tue:[],wed:[],thu:[]}};
function clone(o){return JSON.parse(JSON.stringify(o));}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function pad(n){return String(n).padStart(2,'0');}
function hhmm(m){var t=Math.round(m);var h=((Math.floor(t/60)%24)+24)%24;var mm=((t%60)+60)%60;return pad(h)+':'+pad(mm);}

function validateItems(arr){
  if(!Array.isArray(arr)||!arr.length)return null;
  return arr.slice(0,30).map(function(it){
    var ic=LABELS[it.icon]?it.icon:(EMOJI[it.icon]||iconFor(it.name)||'general');
    return{name:String(it.name||'حصة').replace(/رياضيات/g,'حساب').slice(0,60),type:TYPES[it.type]?it.type:'lesson',icon:ic,dur:Math.max(1,Math.min(180,parseInt(it.dur,10)||40))};
  });
}
function load(){
  var d=clone(DEFAULT);
  try{
    var o=JSON.parse(localStorage.getItem(KEY)||'null');
    if(o&&typeof o==='object'){
      if(typeof o.offset==='number')d.offset=Math.max(-30,Math.min(30,Math.round(o.offset)));
      d.sound=!!o.sound;d.cheer=o.cheer!==false;d.speak=!!o.speak;d.digital=o.digital!==false;
      if(typeof o.vol==='number')d.vol=Math.max(0.1,Math.min(1,o.vol));
    }
  }catch(e){}
  return d;
}
var HOOK={onSave:null,guard:function(next){next();}};
function save(){
  try{localStorage.setItem(KEY,JSON.stringify({offset:S.offset,sound:S.sound,cheer:S.cheer,speak:S.speak,vol:S.vol,digital:S.digital,sndv:2}));}catch(e){}
  if(HOOK.onSave)HOOK.onSave();
}

var S=load(),periods=[],endT=0;
var viewDay=todayKey()||'sun',editDay=viewDay;
var demo=null,demoPlaying=false,demoTimer=null;
var stateKey='',warned=-5;

function build(){
  var t=S.start;
  periods=S.week[viewDay].map(function(it){var p={name:it.name,type:it.type,icon:it.icon,dur:it.dur,s:t,e:t+it.dur};t=p.e;return p;});
  endT=t;
}
function nowMin(){
  if(demo!==null)return demo;
  var d=new Date();
  return d.getHours()*60+d.getMinutes()+d.getSeconds()/60+S.offset;
}
function isLive(){return demo!==null||viewDay===todayKey();}
function idxAt(t){
  if(t<S.start)return -1;
  for(var i=0;i<periods.length;i++){if(t>=periods[i].s&&t<periods[i].e)return i;}
  return periods.length;
}

/* ---------- clock face ---------- */
var R1=236,R2=290,RM=263;
function polar(r,deg){var a=deg*Math.PI/180;return[r*Math.sin(a),-r*Math.cos(a)];}
function r2(n){return Math.round(n*100)/100;}
function sector(ri,ro,a1,a2){
  var large=(a2-a1)>180?1:0;
  var p1=polar(ro,a1),p2=polar(ro,a2),p3=polar(ri,a2),p4=polar(ri,a1);
  return 'M'+r2(p1[0])+' '+r2(p1[1])+'A'+ro+' '+ro+' 0 '+large+' 1 '+r2(p2[0])+' '+r2(p2[1])+
         'L'+r2(p3[0])+' '+r2(p3[1])+'A'+ri+' '+ri+' 0 '+large+' 0 '+r2(p4[0])+' '+r2(p4[1])+'Z';
}
(function buildDial(){
  var h='',i,p;
  for(i=0;i<60;i++){
    p=polar(187,i*6);
    h+='<circle cx="'+r2(p[0])+'" cy="'+r2(p[1])+'" r="'+(i%5===0?4.4:2.1)+'" fill="'+(i%5===0?'#b8b1e8':'#dde1f1')+'"/>';
  }
  $('marks').innerHTML=h;
  h='';
  for(i=1;i<=12;i++){
    p=polar(152,i*30);
    h+='<text x="'+r2(p[0])+'" y="'+r2(p[1])+'" font-size="43" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#606891" style="font-family:\'Baloo Bhaijaan 2\',Arial,sans-serif">'+i+'</text>';
  }
  $('numbers').innerHTML=h;
})();

function drawSegs(idx){
  var h='',order=[],i;
  for(i=0;i<periods.length;i++)order.push(i);
  order.sort(function(a,b){return (a===idx)-(b===idx);});
  order.forEach(function(k){
    var p=periods[k],cur=k===idx,past=idx>k;
    var th=THEME[p.icon]||THEME.general;
    var ri=(cur?R1-8:R1)+3,ro=(cur?R2+8:R2)-3;
    var trim=p.dur>=15?1.2:p.dur*0.5*0.12;
    var a1=p.s*0.5+trim,a2=p.e*0.5-trim;
    if(a2<=a1)return;
    h+='<path d="'+sector(ri,ro,a1,a2)+'" fill="'+th[1]+'" stroke="'+(cur?th[2]:'#fff')+'" stroke-width="'+(cur?4:3)+'" stroke-linejoin="round" opacity="'+(past?0.35:1)+'"/>';
  });
  periods.forEach(function(q,k){
    var cur=k===idx,past=idx>k;
    var arc=RM*(q.dur*0.5)*Math.PI/180;
    var d=Math.min(cur?54:46,arc*0.86);
    if(d<24)return;
    var c=polar(RM,(q.s+q.e)/2*0.5),s=d*0.82;
    h+='<g opacity="'+(past?0.45:1)+'"><circle cx="'+r2(c[0])+'" cy="'+r2(c[1])+'" r="'+r2(d/2)+'" fill="#fff"/>'+
       '<svg x="'+r2(c[0]-s/2)+'" y="'+r2(c[1]-s/2)+'" width="'+r2(s)+'" height="'+r2(s)+'" viewBox="0 0 100 100">'+inner(q.icon)+'</svg></g>';
  });
  $('segs').innerHTML=h;
}

/* ---------- cards ---------- */
var nowEl=$('now'),nextEl=$('next'),rightEl=$('right');
function retrigger(el){el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');}
function fitName(){
  var h=$('subject'),box=h.closest('.subject-main');
  if(!h||!box)return;
  h.style.fontSize='';
  var fs=parseFloat(getComputedStyle(h).fontSize),g=0;
  while((h.scrollWidth>h.clientWidth+1||box.scrollHeight>box.clientHeight+1)&&fs>18&&g<60){fs-=2;h.style.fontSize=fs+'px';g++;}
}
function renderNow(idx,live){
  var n=periods.length,state,th,icon,tag,subject,sub,time='';
  if(!live){state='preview';icon='school';tag='معاينة الجدول';subject='يوم '+DAY_NAMES[viewDay];sub='هكذا سيكون يومنا';time=hhmm(S.start)+' – '+hhmm(endT);}
  else if(idx<0){state='before';icon='school';tag='موعدنا القادم';subject='صباح الخير!';sub='هيا نبدأ يومًا رائعًا';time=hhmm(S.start);}
  else if(idx>=n){state='after';icon='bag';tag='انتهى الدوام';subject='أحسنتم يا أبطال!';sub='نراكم غدًا';}
  else{var p=periods[idx];state='active';icon=p.icon;tag=TAGS[p.type]||TAGS.lesson;subject=p.name;sub=SUB[p.icon]||SUB.general;time=hhmm(p.s)+' – '+hhmm(p.e);}
  th=THEME[icon]||THEME.general;
  nowEl.dataset.state=state;
  nowEl.style.setProperty('--a',th[1]);nowEl.style.setProperty('--b',th[0]);nowEl.style.setProperty('--deep',th[2]);
  $('stateLabel').textContent=tag;$('nowTime').textContent=time;
  $('subject').textContent=subject;$('subtitle').textContent=sub;
  $('heroIcon').innerHTML=ICONS[icon];
  if(state!=='active'){
    $('progress').style.width='0%';
    $('remaining').textContent=state==='before'?'تبدأ الحصة الأولى الساعة '+hhmm(S.start):(state==='after'?'إلى اللقاء':'');
    nowEl.classList.remove('soon');rightEl.classList.remove('soon');
  }
  retrigger(nowEl);
}
function renderNext(idx,live){
  var n=periods.length,nx,label='وبعدها عندنا';
  if(!live||idx<0){nx=periods[0];label='وأول حصة عندنا';}
  else if(idx<n-1){nx=periods[idx+1];}
  else if(idx===n-1){nx={name:'نهاية الدوام',icon:'bag',s:endT};}
  else{nx={name:'نلتقي غدًا',icon:'school'};label='إلى اللقاء';}
  var th=THEME[nx.icon]||THEME.general;
  nextEl.style.setProperty('--na',th[1]);nextEl.style.setProperty('--nb',th[0]);
  $('nextIcon').innerHTML=ICONS[nx.icon];
  $('nextLabel').textContent=label;$('nextName').textContent=nx.name;
  $('nextTime').textContent=nx.s!==undefined?hhmm(nx.s):'';
  retrigger(nextEl);
}
function renderLessons(idx,live){
  var h='';
  periods.forEach(function(p,i){
    var th=THEME[p.icon]||THEME.general;
    var cls='lesson'+(p.dur<10?' short':'')+(live&&idx>i?' done':'')+(live&&idx===i?' current':'');
    h+='<article class="'+cls+'" style="--t:'+th[0]+';--acc:'+th[1]+';--deep:'+th[2]+'"><div class="lesson-icon">'+ICONS[p.icon]+'</div><div class="lesson-name">'+esc(p.name)+'</div><div class="lesson-time">'+hhmm(p.s)+' – '+hhmm(p.e)+'</div><div class="current-label">نحن هنا الآن</div></article>';
  });
  var tb=THEME.bag;
  h+='<article class="lesson end'+(live&&idx>=periods.length?' current':'')+'" style="--t:'+tb[0]+';--acc:'+tb[1]+';--deep:'+tb[2]+'"><div class="lesson-icon">'+ICONS.bag+'</div><div class="lesson-name">نهاية الدوام</div><div class="lesson-time">'+hhmm(endT)+'</div><div class="current-label">نحن هنا الآن</div></article>';
  $('lessons').innerHTML=h;
}
function announce(idx,live){
  var n=periods.length,txt;
  if(!live)txt='معاينة جدول يوم '+DAY_NAMES[viewDay];
  else if(idx<0)txt='لم يبدأ الدوام بعد';
  else if(idx>=n)txt='انتهى الدوام';
  else txt='الآن '+periods[idx].name+(idx<n-1?'، وبعدها '+periods[idx+1].name:'، وبعدها نهاية الدوام');
  $('sr').textContent=txt;
}

/* ---------- sound & encouragement ---------- */
var ac=null,master=null;
function ensureAudio(){
  try{
    if(!ac){
      var C=window.AudioContext||window.webkitAudioContext;
      if(C){
        ac=new C();
        var comp=ac.createDynamicsCompressor();master=ac.createGain();
        master.connect(comp);comp.connect(ac.destination);
      }
    }
    if(ac&&ac.state==='suspended')ac.resume();
    if(master)master.gain.value=0.25+0.75*(S.vol||0.7);
  }catch(e){}
  return ac;
}
['pointerdown','keydown','touchstart'].forEach(function(ev){
  window.addEventListener(ev,function(){if(S.sound)ensureAudio();},{passive:true});
});
var N={C4:261.63,G4:392,A4:440,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,A5:880,B5:987.77,C6:1046.5,D6:1174.7,E6:1318.5,G6:1568};
/* soft marimba/bell: fundamental + 2nd + 4th partial, fast attack, long decay */
function note(freq,at,dur,vol){
  var t0=ac.currentTime+at+0.02,v=vol||0.16;
  [[1,1],[2,0.28],[4,0.08]].forEach(function(h){
    var o=ac.createOscillator(),g=ac.createGain();
    o.type='sine';o.frequency.value=freq*h[0];
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.exponentialRampToValueAtTime(v*h[1],t0+0.015);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    o.connect(g);g.connect(master);o.start(t0);o.stop(t0+dur+0.05);
  });
}
var TUNES={
  /* a cheerful rising run: "let's start!" */
  lessonStart:[['C5',0,.22],['E5',.17,.22],['G5',.34,.22],['C6',.51,.5],['G5',.85,.18],['C6',1,.9],['E6',1.0,.9,.07]],
  /* happy "well done" fanfare */
  lessonEnd:[['G5',0,.22],['E5',.16,.22],['G5',.32,.22],['C6',.48,.3],['E6',.8,.9],['G6',.8,.9,.06],['C6',.8,.9,.1]],
  /* playful skipping tune for the break */
  breakStart:[['C5',0,.16],['G5',.15,.16],['E5',.3,.16],['A5',.45,.16],['G5',.6,.16],['E5',.75,.16],['C6',.9,.55],['G5',1.0,.55,.08]],
  /* calm, short */
  restStart:[['E5',0,.4],['C5',.3,.6],['G4',.62,.8,.1]],
  /* morning hello */
  dayStart:[['G4',0,.22],['C5',.2,.22],['E5',.4,.22],['G5',.6,.22],['E5',.88,.2],['G5',1.08,.2],['C6',1.3,1.0]],
  /* goodbye, see you tomorrow */
  dayEnd:[['G5',0,.26],['E5',.3,.26],['C5',.6,.26],['E5',.9,.26],['G5',1.2,.26],['C6',1.5,1.1],['E6',1.5,1.1,.07]],
  warn:[['A5',0,.45,.12],['E5',.34,.7,.1]]
};
function playTune(name,force){
  if(!(force||S.sound)||!ensureAudio())return;
  try{(TUNES[name]||[]).forEach(function(n){note(N[n[0]],n[1],n[2],n[3]);});}catch(e){}
}
function chime(kind){playTune(kind==='warn'?'warn':'lessonStart');}
function soundOk(){return (demo===null&&viewDay===todayKey())||demoPlaying;}

var CHEER={
  lessonStart:['هيا نبدأ بحماس! أنتم أبطال','عقولكم نشيطة اليوم، ما شاء الله!','مستعدّون للتعلّم؟ هيا بنا!','نتعلّم ونمرح معًا'],
  breakStart:['أحسنتم يا أبطال! استمتعوا بالفرصة والعبوا بأمان','عمل رائع! لا تنسوا شرب الماء','أنتم نجوم! اركضوا والعبوا بسعادة'],
  restStart:['أحسنتم! خذوا نفسًا عميقًا وجهّزوا كتبكم','عمل جميل! رتّبوا طاولاتكم للحصة القادمة','فخورون بكم! استراحة قصيرة ثم نكمل'],
  dayStart:['هيا نبدأ يومًا جميلًا مليئًا بالتعلّم','يوم جديد ومغامرات جديدة!'],
  dayEnd:['يوم رائع! نراكم غدًا بنشاط جديد','شكرًا لجهدكم الجميل، أنتم مبدعون','فخورون بكم جدًّا يا أبطال']
};
var lastCheer={};
function pick(kind){
  var a=CHEER[kind],i=Math.floor(Math.random()*a.length);
  if(a.length>1&&lastCheer[kind]===i)i=(i+1)%a.length;
  lastCheer[kind]=i;return a[i];
}
var cheerTimer=null,cheerEl=$('cheer');
function speak(txt){
  try{
    var ss=window.speechSynthesis;if(!S.speak||!ss)return;
    var u=new SpeechSynthesisUtterance(txt),vs=ss.getVoices()||[],v=null,i;
    for(i=0;i<vs.length;i++){if(/^ar/i.test(vs[i].lang)){v=vs[i];break;}}
    if(!v)return;
    u.voice=v;u.lang=v.lang;u.rate=0.85;u.pitch=1.2;u.volume=Math.max(0.3,S.vol||0.7);
    ss.cancel();ss.speak(u);
  }catch(e){}
}
function confetti(){
  var box=$('confetti'),cols=['#ff6b6b','#ffd23f','#4cc9a0','#4dabf7','#b388ff','#ff9f43','#ff7eb6'],h='',i;
  for(i=0;i<34;i++){
    h+='<i style="left:'+r2(Math.random()*100)+'%;background:'+cols[i%cols.length]+';animation-duration:'+r2(3+Math.random()*2.5)+'s;animation-delay:'+r2(Math.random()*1.2)+'s;transform:rotate('+Math.floor(Math.random()*180)+'deg)"></i>';
  }
  box.innerHTML=h;
}
function hideCheer(){cheerEl.classList.remove('show');cheerEl.setAttribute('aria-hidden','true');clearTimeout(cheerTimer);}
cheerEl.addEventListener('click',hideCheer);
function celebrate(kind,idx,force){
  var p=periods[idx]||null,icon,title,msg,tune=kind,th;
  if(kind==='lessonStart'){icon=p?p.icon:'general';title='هيا نبدأ '+(p?p.name:'حصّتنا');}
  else if(kind==='breakStart'){icon='break';title='وقت الفرصة!';}
  else if(kind==='restStart'){icon='rest';title='استراحة قصيرة';}
  else if(kind==='dayStart'){icon='school';title='صباح الخير يا أبطال!';}
  else{icon='bag';title='أحسنتم يا أبطال!';kind='dayEnd';}
  msg=pick(kind);
  if(force||S.sound)playTune(tune,force);
  if(force||S.cheer){
    th=THEME[icon]||THEME.general;
    cheerEl.style.setProperty('--cb',th[1]);cheerEl.style.setProperty('--cd',th[2]);
    $('cheerIco').innerHTML=ICONS[icon];$('cheerTitle').textContent=title;$('cheerMsg').textContent=msg;
    confetti();
    cheerEl.classList.add('show');cheerEl.setAttribute('aria-hidden','false');
    clearTimeout(cheerTimer);cheerTimer=setTimeout(hideCheer,7000);
    speak(title+'. '+msg);
  }
}
function kindFor(prevIdx,idx){
  if(idx>=periods.length)return 'dayEnd';
  var p=periods[idx];
  if(prevIdx<0&&p.type==='lesson')return 'dayStart';
  if(p.type==='break')return 'breakStart';
  if(p.type==='rest')return 'restStart';
  return 'lessonStart';
}
var hintEl=$('audioHint');
hintEl.addEventListener('click',function(){ensureAudio();playTune('warn',true);hintEl.hidden=true;});

/* ---------- tick ---------- */
var hHand=$('hHand'),mHand=$('mHand'),sHand=$('sHand'),ptr=$('ptr'),digitalEl=$('digital');
function minutesWord(n){
  if(n<1)return 'أقل من دقيقة';
  if(n===1)return 'دقيقة واحدة';
  if(n===2)return 'دقيقتان';
  if(n<=10)return n+' دقائق';
  return n+' دقيقة';
}
function tick(){
  var t=nowMin(),live=isLive(),idx=live?idxAt(t):-1;
  hHand.setAttribute('transform','rotate('+r2((t%720)*0.5)+')');
  ptr.setAttribute('transform','rotate('+r2((t%720)*0.5)+')');
  mHand.setAttribute('transform','rotate('+r2((t%60)*6)+')');
  sHand.setAttribute('transform','rotate('+r2(((t*60)%60)*6)+')');
  ptr.style.opacity=live?1:0;
  digitalEl.textContent=hhmm(t);
  hintEl.hidden=!(S.sound&&(!ac||ac.state!=='running'));
  try{$('todayDate').textContent=new Date().toLocaleDateString('ar',{day:'numeric',month:'long'});}catch(e){}

  if(!periods.length)return;
  var key=viewDay+'|'+live+'|'+idx;
  if(key!==stateKey){
    var prev=stateKey;stateKey=key;warned=-5;
    drawSegs(live?idx:-1);renderNow(idx,live);renderNext(idx,live);renderLessons(idx,live);announce(idx,live);fitName();
    var pp=prev.split('|');
    if(prev!==''&&live&&pp[0]===viewDay&&pp[1]==='true'&&soundOk()&&idx>=0)celebrate(kindFor(parseInt(pp[2],10),idx),Math.min(idx,periods.length-1));
  }
  if(live&&idx>=0&&idx<periods.length){
    var p=periods[idx],rem=p.e-t,dur=p.e-p.s,frac=Math.max(0,Math.min(1,rem/dur));
    var soon=rem<=Math.min(5,dur/3);
    $('progress').style.width=(frac*100)+'%';
    $('ringFg').setAttribute('stroke-dashoffset',r2(289.03*(1-frac)));
    $('remaining').textContent=(soon?'اقتربنا من النهاية — ':'')+'باقي '+minutesWord(Math.ceil(rem));
    nowEl.classList.toggle('soon',soon);rightEl.classList.toggle('soon',soon);
    if(p.dur>=15&&rem<=1&&rem>0&&warned!==idx&&soundOk()){chime('warn');warned=idx;}
  }
}
function refresh(){save();build();stateKey='';tick();syncDemoRange();updateTimes();}

/* ---------- day tabs ---------- */
function buildDayTabs(container,selected,onPick,markToday){
  container.innerHTML='';
  DAY_KEYS.forEach(function(k){
    var b=document.createElement('button');
    b.type='button';
    b.className='day'+(k===selected?' active':'')+(markToday&&k===todayKey()?' today':'');
    b.textContent=DAY_NAMES[k];
    b.addEventListener('click',function(){onPick(k);});
    container.appendChild(b);
  });
}
function renderDayTabs(){
  buildDayTabs($('days'),viewDay,function(k){viewDay=k;renderDayTabs();build();stateKey='';tick();syncDemoRange();},true);
  var tk=todayKey(),note=$('dayNote');
  if(demo!==null||viewDay===tk){note.hidden=true;}
  else{
    note.hidden=false;
    note.textContent=(tk===null?'اليوم عطلة — ':'')+'معاينة جدول '+DAY_NAMES[viewDay]+(tk?'، واليوم الحقيقي '+DAY_NAMES[tk]:'');
  }
}
function renderEdayTabs(){
  buildDayTabs($('edays'),editDay,function(k){editDay=k;renderEdayTabs();renderEditor();},false);
}

/* ---------- editor ---------- */
var dlg=$('dlg'),rowsEl=$('rows');
function el(tag,attrs){
  var e=document.createElement(tag);attrs=attrs||{};
  for(var k in attrs){
    if(k==='class')e.className=attrs[k];
    else if(k==='text')e.textContent=attrs[k];
    else if(k.indexOf('on')===0)e.addEventListener(k.slice(2),attrs[k]);
    else e.setAttribute(k,attrs[k]);
  }
  for(var i=2;i<arguments.length;i++){if(arguments[i])e.appendChild(arguments[i]);}
  return e;
}
function updateTimes(){
  var ts=rowsEl.querySelectorAll('.t'),t=S.start;
  S.week[editDay].forEach(function(it,i){var st=t,en=t+it.dur;t=en;if(ts[i])ts[i].textContent=hhmm(st)+' – '+hhmm(en);});
}
function renderEditor(){
  rowsEl.innerHTML='';
  var items=S.week[editDay];
  items.forEach(function(it,i){
    var prev=el('span',{class:'prev','aria-hidden':'true'});
    function paintPrev(){prev.innerHTML=ICONS[it.icon];prev.style.background=(THEME[it.icon]||THEME.general)[0];}
    paintPrev();

    var ic=el('select',{'aria-label':'الأيقونة',onchange:function(){it.icon=ic.value;paintPrev();refresh();}});
    Object.keys(LABELS).forEach(function(k){ic.appendChild(el('option',{value:k,text:LABELS[k]}));});
    ic.value=it.icon;

    var nm=el('input',{class:'name',type:'text',value:it.name,'aria-label':'اسم الحصة',
      oninput:function(){it.name=nm.value;refresh();},
      onchange:function(){var m=iconFor(it.name);if(m&&m!==it.icon){it.icon=m;ic.value=m;paintPrev();refresh();}}});

    var ty=el('select',{class:'ty','aria-label':'النوع',onchange:function(){it.type=ty.value;refresh();}});
    Object.keys(TYPES).forEach(function(k){ty.appendChild(el('option',{value:k,text:TYPES[k]}));});
    ty.value=it.type;

    var du=el('input',{class:'dur',type:'number',min:'1',max:'180',step:'5',value:String(it.dur),'aria-label':'المدة بالدقائق',
      oninput:function(){var v=parseInt(du.value,10);if(v>=1&&v<=180){it.dur=v;refresh();}}});

    var tt=el('span',{class:'t'});
    function move(from,to){var x=items.splice(from,1)[0];items.splice(to,0,x);renderEditor();refresh();}
    var up=el('button',{class:'mini',type:'button','aria-label':'فوق',text:'↑',onclick:function(){if(i>0)move(i,i-1);}});
    var dn=el('button',{class:'mini',type:'button','aria-label':'تحت',text:'↓',onclick:function(){if(i<items.length-1)move(i,i+1);}});
    var rm=el('button',{class:'mini danger',type:'button','aria-label':'حذف',text:'✕',onclick:function(){if(items.length>1){items.splice(i,1);renderEditor();refresh();}}});

    rowsEl.appendChild(el('div',{class:'row'},prev,ic,nm,ty,du,tt,up,dn,rm));
  });
  updateTimes();
}
$('addRow').addEventListener('click',function(){
  S.week[editDay].push({name:'حصة جديدة',type:'lesson',icon:'general',dur:40});
  renderEditor();refresh();
});
function armed(btn,label,action){
  var timer=null;
  btn.addEventListener('click',function(){
    if(!timer){btn.textContent='اضغطي مرة ثانية للتأكيد';timer=setTimeout(function(){timer=null;btn.textContent=label;},3500);return;}
    clearTimeout(timer);timer=null;btn.textContent=label;action();
  });
}
armed($('copyDay'),'نسخ هذا اليوم لباقي الأيام',function(){
  var src=clone(S.week[editDay]);
  DAY_KEYS.forEach(function(k){if(k!==editDay)S.week[k]=clone(src);});
  refresh();
});
$('startTime').addEventListener('input',function(){
  var v=this.value.split(':');
  if(v.length===2&&v[0]!==''){S.start=parseInt(v[0],10)*60+parseInt(v[1],10);refresh();}
});
$('clsInput').addEventListener('input',function(){S.className=this.value;save();applyClass();});
function applyClass(){var c=$('clsName');c.textContent=S.className||'';c.parentNode.style.display=S.className?'':'none';}

function updateOff(){
  var o=S.offset;
  $('offLabel').textContent=o===0?'الساعة مطابقة لجهازك':('الساعة '+(o>0?'متقدّمة ':'متأخّرة ')+Math.abs(o)+' دقيقة عن جهازك');
}
function setOff(v){S.offset=v;save();updateOff();stateKey='';tick();}
$('offPlus').addEventListener('click',function(){setOff(S.offset+1);});
$('offMinus').addEventListener('click',function(){setOff(S.offset-1);});
$('offReset').addEventListener('click',function(){setOff(0);});
$('optSound').addEventListener('change',function(){S.sound=this.checked;save();if(S.sound){ensureAudio();playTune('lessonStart',true);}});
$('optCheer').addEventListener('change',function(){S.cheer=this.checked;save();});
$('optSpeak').addEventListener('change',function(){S.speak=this.checked;save();if(S.speak)speak('هيا نبدأ، أنتم أبطال');});
$('optVol').addEventListener('input',function(){S.vol=parseInt(this.value,10)/100;save();if(master)master.gain.value=0.25+0.75*S.vol;});
$('optVol').addEventListener('change',function(){ensureAudio();playTune('warn',true);});
$('testStart').addEventListener('click',function(){dlg.close();ensureAudio();celebrate('lessonStart',Math.max(0,periods.findIndex(function(p){return p.type==='lesson';})),true);});
$('testEnd').addEventListener('click',function(){dlg.close();ensureAudio();celebrate('breakStart',0,true);});
$('testDay').addEventListener('click',function(){dlg.close();ensureAudio();celebrate('dayEnd',periods.length,true);});
$('optDigital').addEventListener('change',function(){S.digital=this.checked;save();document.body.classList.toggle('show-digital',S.digital);fitName();});

function syncControls(){
  $('clsInput').value=S.className||'';applyClass();
  $('startTime').value=hhmm(S.start);
  $('optSound').checked=S.sound;$('optCheer').checked=S.cheer;$('optSpeak').checked=S.speak;$('optVol').value=Math.round((S.vol||0.7)*100);$('optDigital').checked=S.digital;
  document.body.classList.toggle('show-digital',S.digital);
  updateOff();
}
$('setBtn').addEventListener('click',function(){
  HOOK.guard(function(){
    syncControls();editDay=viewDay;renderEdayTabs();renderEditor();
    if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
  });
});
$('dlgClose').addEventListener('click',function(){dlg.close();});

/* ---------- demo mode ---------- */
var slider=$('demoSlider');
function syncDemoRange(){
  slider.min=String(Math.max(0,S.start-30));
  slider.max=String(Math.min(1439,Math.ceil(endT)+10));
  if(demo!==null){
    demo=Math.max(+slider.min,Math.min(+slider.max,demo));
    slider.value=String(Math.round(demo));
    $('demoTime').textContent=hhmm(demo);
  }
}
function setDemoUI(){
  var on=demo!==null;
  document.body.classList.toggle('demo',on);
  $('demoBtn').textContent=on?'⏹ إنهاء التجربة':'▶ تجربة الوقت';
  $('demoPlay').textContent=demoPlaying?'⏸ إيقاف':'▶ تشغيل سريع';
  $('demoTime').textContent=on?hhmm(demo):'';
  renderDayTabs();
}
function stopPlay(){demoPlaying=false;clearInterval(demoTimer);demoTimer=null;}
function demoOff(){stopPlay();demo=null;setDemoUI();stateKey='';tick();fitName();}
function demoOn(){demo=S.start+5;syncDemoRange();setDemoUI();stateKey='';tick();}
$('demoBtn').addEventListener('click',function(){if(demo!==null)demoOff();else demoOn();});
$('demoExit').addEventListener('click',demoOff);
slider.addEventListener('input',function(){demo=+slider.value;$('demoTime').textContent=hhmm(demo);tick();});
$('demoPlay').addEventListener('click',function(){
  if(demo===null)return;
  if(demoPlaying){stopPlay();setDemoUI();return;}
  demoPlaying=true;setDemoUI();
  demoTimer=setInterval(function(){
    demo+=0.5;
    if(demo>+slider.max)demo=+slider.min;
    slider.value=String(Math.round(demo));$('demoTime').textContent=hhmm(demo);tick();
  },250);
});

/* ---------- fullscreen ---------- */
var fsBtn=$('fsBtn');
if(!document.documentElement.requestFullscreen){fsBtn.style.display='none';}
fsBtn.addEventListener('click',function(){
  try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen();}catch(e){}
});

/* ---------- init ---------- */
renderDayTabs();
build();
syncControls();
syncDemoRange();
tick();
setInterval(tick,1000);
window.addEventListener('resize',fitName);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitName);

/* ---------- API for the cloud layer (auth.js) ---------- */
document.querySelectorAll('[data-ver]').forEach(function(e){e.textContent=VERSION;});
function refreshNoSave(){build();stateKey='';tick();syncDemoRange();updateTimes();}
window.__clock={
  hook:HOOK,
  getData:function(){return{name:S.className,start:S.start,week:clone(S.week)};},
  version:VERSION,
  setData:function(d){
    if(typeof d.name==='string')S.className=d.name;
    if(typeof d.start==='number')S.start=Math.max(0,Math.min(1439,d.start));
    DAY_KEYS.forEach(function(k){S.week[k]=validateItems(d.week&&d.week[k])||[];});
    stopPlay();demo=null;setDemoUI();
    viewDay=todayKey()||'sun';editDay=viewDay;
    renderDayTabs();applyClass();refreshNoSave();
    if(dlg.open){syncControls();renderEdayTabs();renderEditor();}
  },
  lockName:function(b){$('clsInput').disabled=!!b;},
  icon:function(k){return ICONS[k]||ICONS.general;},
  theme:function(k){return THEME[k]||THEME.general;},
  statusOf:function(d){
    var dk=todayKey();if(!dk)return{state:'weekend'};
    var t=nowMin(),cur=d.start,arr=(d.week&&d.week[dk])||[],i;
    if(t<d.start)return{state:'before',at:hhmm(d.start)};
    for(i=0;i<arr.length;i++){
      var e=cur+arr[i].dur;
      if(t>=cur&&t<e){
        var nx=arr[i+1];
        return{state:'active',name:arr[i].name,icon:arr[i].icon,type:arr[i].type,rem:Math.ceil(e-t),next:nx?nx.name:null};
      }
      cur=e;
    }
    return{state:'after'};
  }
};
})();
