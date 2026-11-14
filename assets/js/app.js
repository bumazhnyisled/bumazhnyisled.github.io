/* «Субподрядчик» — интерактив. Без сборки и внешних библиотек: страница открывается и с диска, и с любого хостинга. */
(function () {
  "use strict";
  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const nf = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
  const MON = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

  /* ───── источники ───── */
  function srcHTML(ref) {
    const [k, note] = Array.isArray(ref) ? ref : [ref, ""];
    const s = S.SRC[k];
    if (!s) return "";
    const label = esc(s.t) + (note ? " · " + esc(note) : "");
    const main = s.u ? `<a href="${esc(s.u)}" target="_blank" rel="noopener">${label}</a>` : `<span>${label}</span>`;
    const file = s.f ? ` <a class="file" href="${esc(s.f)}" target="_blank" rel="noopener" title="Копия документа">${s.f.split(".").pop().toUpperCase()}&nbsp;↓</a>` : "";
    return `<span class="src-it">${main}${file}</span>`;
  }
  const srcList = (refs) => refs.map(srcHTML).join("");
  $$("[data-src]").forEach((n) => { n.outerHTML = srcHTML(n.dataset.note ? [n.dataset.src, n.dataset.note] : n.dataset.src); });
  $("#upd").textContent = S.UPDATED;

  /* ───── шапка, прогресс, меню ───── */
  const top = $("#top"), prog = $("#progress");
  const navLinks = $$(".nav a");
  const sheet = $("#navSheet"), navBtn = $("#navBtn");
  sheet.innerHTML = navLinks.map((a) => a.outerHTML).join("");
  const setSheet = (open) => { sheet.hidden = !open; navBtn.setAttribute("aria-expanded", open); document.documentElement.style.overflow = open ? "hidden" : ""; };
  navBtn.addEventListener("click", () => setSheet(sheet.hidden));
  sheet.addEventListener("click", (e) => { if (e.target.closest("a")) setSheet(false); });
  const navTargets = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);

  /* ───── появление и счётчики ───── */
  function countUp(el) {
    const to = +el.dataset.count, suf = el.dataset.suffix || "";
    if (reduced || el.dataset.done) { el.textContent = nf(to) + suf; return; }
    el.dataset.done = 1;
    const t0 = performance.now(), dur = 1500;
    (function tick(t) {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = nf(to * e) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  const io = new IntersectionObserver((ents) => {
    for (const en of ents) {
      if (!en.isIntersecting) continue;
      en.target.classList.add("in");
      $$("[data-count]", en.target).forEach(countUp);
      if (en.target.dataset.count) countUp(en.target);
      io.unobserve(en.target);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  const watch = (root = document) => $$(".reveal", root).forEach((n) => io.observe(n));

  /* дни с марта 2018 */
  $("#days").textContent = nf(Math.floor((Date.now() - new Date(2018, 2, 1).getTime()) / 864e5));

  /* ───── фильм ───── */
  const canEmbed = /^https?:$/.test(location.protocol);
  const ytURL = (t) => `https://youtu.be/${S.FILM}${t ? "?t=" + t : ""}`;
  function play(t = 0) {
    if (!canEmbed) { window.open(ytURL(t), "_blank", "noopener"); return; }
    const box = $(".film-player .film-facade") || $(".film-player .film-frame");
    const fr = h(`<div class="film-facade film-frame"><iframe title="Субподрядчик" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen src="https://www.youtube-nocookie.com/embed/${S.FILM}?autoplay=1&start=${t}&rel=0&hl=ru&cc_lang_pref=ru"></iframe></div>`);
    box.replaceWith(fr);
    fr.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  }
  $("#filmBtn").addEventListener("click", () => play(0));
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  $("#chapters").innerHTML = S.CHAPTERS.map(([t, n]) => `<li><a href="${ytURL(t)}" data-t="${t}" target="_blank" rel="noopener"><time>${mmss(t)}</time><span>${esc(n)}</span></a></li>`).join("");
  $("#chapters").addEventListener("click", (e) => { const a = e.target.closest("a"); if (a && canEmbed) { e.preventDefault(); play(+a.dataset.t); } });

  /* ───── 88 точек ───── */
  const PPL = {
    all: { fig: "88", label: "бывших сотрудников ООО «Приволжэнерго». Уфа, Нижний Новгород, Москва, Пермь, Сочи", note: "Инженеры, проектировщики, монтажники.", src: ["k6206"], cls: () => "" },
    paid: { fig: "4", label: "человека получают начисления в 2020 году. Один из них — директор", note: "Остальным в этом году компания не начисляет ничего.", src: ["k5045"], cls: (i) => (i < 4 ? "on" : "off") },
    won: { fig: "82", label: "человека — в их пользу Верховный суд Башкортостана взыскал долг с двух директоров", note: "По троим дело прекращено: они умерли.", src: ["vs"], cls: (i) => (i >= 85 ? "x" : i < 82 ? "on" : "off") },
    dead: { fig: "5", label: "человек не дожили до решения суда — не меньше", note: "По троим производство прекращено в связи со смертью; об остальных известно со слов коллег.", src: ["vs"], cls: (i) => (i >= 83 ? "x" : "") },
  };
  const ppl = $("#ppl");
  ppl.innerHTML = Array.from({ length: 88 }, (_, i) => `<i style="--i:${i}"></i>`).join("");
  function setPpl(k) {
    const p = PPL[k];
    $$("i", ppl).forEach((d, i) => { d.className = p.cls(i); });
    $("#pplFig").textContent = p.fig; $("#pplLabel").textContent = p.label; $("#pplNote").textContent = p.note; $("#pplSrc").outerHTML = `<span id="pplSrc">${srcList(p.src)}</span>`;
    $$("#pplSeg button").forEach((b) => b.setAttribute("aria-selected", b.dataset.k === k));
  }
  $("#pplSeg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) setPpl(b.dataset.k); });
  setPpl("all");

  /* ───── схема связей ───── */
  const B = S.BOARD;
  const LAYOUT = {
    d: { vb: "80 62 1814 870", nw: 420, nh: 130, pos: { naz: [110, 170], syn: [750, 170], uzb: [1390, 170], ccc: [110, 470], ooo: [750, 470], galim: [1390, 470], em: [1390, 770], work: [750, 770] },
      e: { own: [[[530, 235], [750, 235]], [640, 215, "middle"]], contract: [[[1390, 235], [1170, 235]], [1280, 215, "middle"]], sub: [[[960, 300], [960, 470]], [982, 394, "start"]], pay: [[[960, 600], [960, 770]], [982, 694, "start"]],
        dir: [[[1390, 535], [1170, 535]], [1280, 515, "middle"]], member: [[[1600, 600], [1600, 770]], [1622, 694, "start"]], steelpay: [[[320, 300], [320, 470]], [342, 394, "start"]],
        steel: [[[1470, 770], [1470, 656], [320, 656], [320, 600]], [350, 640, "start"]], friend: [[[1810, 535], [1864, 535], [1864, 112], [320, 112], [320, 170]], [1092, 96, "middle"]] } },
    m: { vb: "0 0 1000 1112", nw: 430, nh: 124, pos: { uzb: [550, 30], syn: [550, 266], ooo: [550, 502], work: [550, 738], naz: [20, 266], ccc: [20, 502], em: [20, 738], galim: [20, 974] },
      names: { ccc: "Chemical Consult" },
      subs: { ooo: "генпроектировщик · Уфа", naz: "владелец Synecta до 2013", uzb: "заказчик энергоблока", em: "Лондон · с 01.08.2012", work: "Уфа · Н. Новгород · Москва" },
      labels: { steelpay: "4,2 млн $ за сталь", steel: "та же партия стали", friend: ["«дружба и деловые отношения»", "показания Галимова, Лондон, 2015"], sub: "платит за проект", pay: "платит зарплату" },
      redLabels: { sub: "долг 4,26 млн $", pay: "долг 142,7 млн ₽" },
      e: { contract: [[[765, 154], [765, 266]], [787, 220, "start"]], sub: [[[765, 390], [765, 502]], [787, 456, "start"]], pay: [[[765, 626], [765, 738]], [787, 692, "start"]], own: [[[450, 348], [550, 348]], [500, 328, "middle"]],
        steelpay: [[[235, 390], [235, 502]], [257, 456, "start"]], steel: [[[235, 738], [235, 626]], [257, 692, "start"]], member: [[[235, 974], [235, 862]], [257, 928, "start"]],
        dir: [[[450, 1036], [520, 1036], [520, 584], [550, 584]], [542, 928, "start"]], friend: [[[20, 1036], [7, 1036], [7, 190], [235, 190], [235, 266]], [22, 122, "start"]] } },
  };
  const boardEl = $("#board"), stepsEl = $("#boardSteps");
  let mode = null, curStep = 0;
  function renderBoard() {
    const m = matchMedia("(max-width: 980px)").matches ? "m" : "d";
    if (m === mode) return;
    mode = m;
    const L = LAYOUT[m];
    const mk = [["0", "#7b7466"], ["1", "#f4d03f"], ["2", "#e5573f"]].map(([n, c]) => `<marker id="ar${n}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker>`).join("");
    let out = `<svg viewBox="${L.vb}" xmlns="http://www.w3.org/2000/svg"><defs>${mk}</defs>`;
    for (const k in L.e) {
      const [pts, [lx, ly, anc]] = L.e[k];
      const d = pts.map((p, i) => (i ? "L" : "M") + p.join(",")).join(" ");
      const lab = (L.labels && L.labels[k]) || B.edges[k];
      const lines = Array.isArray(lab) ? lab : [lab];
      const fs = m === "m" ? 36 : 34;
      const txt = lines.map((t, i) => `<tspan x="${lx}" dy="${i ? fs : 0}">${esc(t)}</tspan>`).join("");
      out += `<g class="e${B.dashed.includes(k) ? " dash" : ""}" data-k="${k}"><path d="${d}"/><text x="${lx}" y="${ly}" text-anchor="${anc}" data-def="${esc(lines[0])}">${txt}</text></g>`;
    }
    for (const k in L.pos) {
      const [x, y] = L.pos[k], [name, sub, person] = B.nodes[k];
      const nm = (L.names && L.names[k]) || name, sb = (L.subs && L.subs[k]) || sub;
      out += `<g class="n" data-k="${k}" transform="translate(${x},${y})"><rect class="card" width="${L.nw}" height="${L.nh}"/>${person ? `<rect class="bar" width="8" height="${L.nh}"/>` : ""}` +
        `<text class="nm" x="${m === "m" ? 26 : 30}" y="${L.nh * 0.43}">${esc(nm)}</text><text class="sb" x="${m === "m" ? 26 : 30}" y="${L.nh * 0.76}">${esc(sb)}</text></g>`;
    }
    boardEl.innerHTML = out + "</svg>";
    boardEl.classList.toggle("m", m === "m");
    applyStep(curStep, true);
  }
  function applyStep(i, force) {
    if (i === curStep && !force) return;
    curStep = i;
    const st = B.steps[i], L = LAYOUT[mode];
    const show = new Set(st.show), hl = new Set(st.hl || []), red = new Set(st.red || []);
    $$("[data-k]", boardEl).forEach((g) => {
      const k = g.dataset.k;
      g.classList.toggle("show", show.has(k)); g.classList.toggle("hl", hl.has(k)); g.classList.toggle("red", red.has(k));
      if (g.classList.contains("e")) {
        const p = $("path", g), t = $("text", g), first = $("tspan", t);
        p.setAttribute("marker-end", `url(#ar${red.has(k) ? 2 : hl.has(k) ? 1 : 0})`);
        const over = st.labels && st.labels[k] ? (mode === "m" && L.redLabels && L.redLabels[k]) || st.labels[k] : t.dataset.def;
        if (first.textContent !== over) first.textContent = over;
      }
    });
    $("#boardStep").textContent = `${i + 1} / ${B.steps.length}`;
    $$(".step", stepsEl).forEach((s, j) => s.classList.toggle("on", j === i));
  }
  stepsEl.innerHTML = B.steps.map((st, i) => `<article class="step" data-i="${i}"><div class="step-in"><p class="tag">${esc(st.tag)}</p><h3>${esc(st.h)}</h3><p class="t">${esc(st.p)}</p>${st.open ? '<span class="open">судом не установлено</span>' : ""}<div class="src"><i>Источник</i>${srcList(st.src)}</div></div></article>`).join("");
  const stepEls = $$(".step", stepsEl);

  /* ───── шкалы времени ───── */
  const SCALES = [];
  function scale(id, pts, brackets = []) { SCALES.push([id, pts, brackets]); drawScale(id, pts, brackets); }
  function drawScale(id, pts, brackets) {
    const el = $(id); if (!el) return;
    const fmt = (d) => d.slice(8, 10) + "." + d.slice(5, 7) + "." + d.slice(0, 4);
    const narrow = el.clientWidth < 620;
    el.classList.toggle("v", narrow); el.style.height = "";
    if (narrow) { /* на узком экране — вертикальный список с интервалами */
      el.innerHTML = pts.map((p, i) => { const br = brackets.find((x) => x[0] === i); return `<div class="vi${p[2] ? " key" : ""}"><b>${fmt(p[0])}</b><span>${esc(p[1])}</span>${br ? `<em>${esc(br[2])}</em>` : ""}</div>`; }).join("");
      return;
    }
    const ts = pts.map((p) => Date.parse(p[0])), a = Math.min(...ts), b = Math.max(...ts);
    const pad = 4, pos = ts.map((t) => pad + ((t - a) / (b - a)) * (100 - 2 * pad));
    let out = '<div class="axis"></div>', low = false;
    brackets.forEach(([i, j, t]) => { out += `<div class="br" style="left:${pos[i]}%;width:${pos[j] - pos[i]}%"><span>${esc(t)}</span></div>`; });
    pts.forEach((p, i) => {
      const cls = i === 0 ? " first" : i === pts.length - 1 ? " last" : "";
      const near = i > 0 && i < pts.length - 1 && pos[i] - pos[i - 1] < 16; low = low || near;
      out += `<div class="pt${p[2] ? " key" : ""}" style="left:${pos[i]}%"></div><div class="lab${cls}" style="left:${i === 0 ? 0 : i === pts.length - 1 ? 100 : pos[i]}%${near ? ";top:176px" : ""}"><b>${fmt(p[0])}</b><span>${esc(p[1])}</span></div>`;
    });
    el.innerHTML = out;
    if (low) el.style.height = "250px";
  }
  scale("#scale13", [["2013-03-14", "Суд замораживает активы Назарова"], ["2013-04-19", "4,2 млн $ «за сталь»", 1], ["2013-05-06", "Галимов выходит из Energy Machine LLP", 1]], [[0, 1, "5 недель"], [1, 2, "17 дней"]]);
  scale("#scale18", [["2018-11-01", "Налоговая подаёт на банкротство"], ["2018-12-14", "«Переплата» 98,8 млн ₽", 1], ["2019-01-08", "Новый директор"], ["2019-06-19", "Банкротство приостановлено", 1]], [[0, 1, "6 недель"]]);
  scale("#scale25", [["2025-05-22", "Иск прокурора"], ["2025-09-24", "Районный суд: отказ"], ["2026-04-17", "Верховный суд РБ: взыскать", 1], ["2026-09-03", "Кассация: без изменения", 1]]);

  /* ───── столбцы ───── */
  function bars(id, rows, max) {
    $(id).innerHTML = rows.map((r) => {
      const segs = r.segs.map(([v, c, lo]) => `<div class="bar ${c}${lo ? " lo" : ""}" style="width:${Math.max((v / max) * 100, 0.6)}%"></div>`).join("");
      return `<div class="row" tabindex="0" data-tip="${esc(r.tip)}"><div class="blab">${esc(r.label)}</div><div class="ln2"><div class="track">${segs}</div><div class="val">${esc(r.val)}</div></div></div>`;
    }).join("");
  }
  bars("#prices", [
    { label: "ArcelorMittal продаёт фирме Energy Machine LLP", val: "475–575 $", segs: [[475, "c-fg", 1], [100, "c-fg2"]], tip: "<b>475–575 $ за тонну</b>Цена поставки Energy Machine LLP — по ответу концерна, записанному в решении суда" },
    { label: "Фирма Назарова платит получателю на Виргинских островах", val: "920–950 $", segs: [[920, "c-red", 1], [30, "c-red2"]], tip: "<b>920–950 $ за тонну</b>Цена, по которой фирма Назарова заплатила 4,2 млн $ компании Chemical Consult Corp" },
  ], 950);
  bars("#balance", [
    { label: "Должны компании", val: "581,3 млн ₽", segs: [[581.3, "c-mark"]], tip: "<b>581,3 млн ₽</b>Дебиторская задолженность по балансу за 2019 год" },
    { label: "Должна компания", val: "280,8 млн ₽", segs: [[280.8, "c-red"]], tip: "<b>280,8 млн ₽</b>Кредиторская задолженность по балансу за 2019 год" },
    { label: "Деньги на счетах", val: "86 тыс. ₽", segs: [[0.086, "c-fg"]], tip: "<b>86 тыс. ₽</b>Меньше 0,02 % от того, что должны компании" },
  ], 581.3);

  /* ───── приказ суда ───── */
  const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii"];
  const grp = (g) => `<div class="grp"><h4>${esc(g.h)}</h4><ul>${g.items.map((it, i) => `<li class="${it in S.ORDER_HL ? "on" : ""}"><i>(${ROMAN[i]})</i><span><b>${esc(it)}</b> <small>${esc(S.ORDER_HL[it] || "")}</small></span></li>`).join("")}</ul></div>`;
  $("#order").innerHTML = `<div>${grp(S.ORDER[0])}</div><div>${grp(S.ORDER[1])}${grp(S.ORDER[2])}</div>`;
  $("#orderBtn").addEventListener("click", (e) => {
    const on = $(".order").classList.toggle("hl");
    e.currentTarget.setAttribute("aria-pressed", on); e.currentTarget.textContent = on ? "Вернуть весь список" : "Показать, кто в списке";
  });

  /* ───── таблицы ───── */
  $("#cars").innerHTML = S.CARS.map(([n, m, st, c]) => `<tr class="st-${c}"><td class="b">${esc(m)} <small class="num">${esc(n)}</small></td><td class="st">${esc(st)}</td></tr>`).join("");
  $("#excl").innerHTML = S.EXCL.map(([d, r]) => `<tr><td class="a">${d}</td><td class="b">решение о предстоящем исключении <small>${esc(r)}</small></td></tr>`).join("");
  $("#sfr").innerHTML = S.SFR.map(([d, v]) => `<tr><td class="a">${d}</td><td class="b">${esc(v)}</td></tr>`).join("");

  /* штрафы по месяцам */
  {
    let out = "", n = 0;
    for (let i = 0; i < 22; i++) {
      const y = 2023 + Math.floor(i / 12), m = (i % 12) + 1, c = S.FINES[`${String(m).padStart(2, "0")}.${y % 100}`] || 0;
      const sq = Array.from({ length: c }, () => `<div class="sq" style="--i:${n++}"></div>`).join("");
      out += `<div class="m" tabindex="0" data-tip="<b>${MONTHS[m - 1]} ${y}</b>${c ? c + " " + (c === 1 ? "постановление" : "постановления") : "штрафов нет"}">${sq}<span class="mn">${MON[m - 1]}</span>${m === 1 ? `<span class="yr">${y}</span>` : ""}</div>`;
    }
    $("#fines").innerHTML = out;
  }

  /* жалобы */
  {
    const tot = S.APPEALS.reduce((a, x) => a + x.n, 0);
    $("#appeals").innerHTML = S.APPEALS.map((a) => `<div class="s c-${a.c}" style="flex:${a.n} 1 0" tabindex="0" data-tip="<b>${a.n} из ${tot}</b>${esc(a.t)}: ${esc(a.d)}">${a.n >= 10 ? `<b>${a.n}</b>` : ""}</div>`).join("");
    $("#appealsLegend").innerHTML = S.APPEALS.map((a) => `<li><i class="sw c-${a.c}"></i><b>${a.n} — ${esc(a.t)}</b><span>${esc(a.d)}</span></li>`).join("");
  }

  /* ближайшие заседания */
  {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const plural = (n) => (n % 10 === 1 && n % 100 !== 11 ? "день" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "дня" : "дней");
    $("#cal").innerHTML = S.EVENTS.filter((e) => e.up).map((e) => {
      const d = new Date(e.d + "T00:00:00"), left = Math.round((d - now) / 864e5), past = left < 0;
      const badge = past ? "состоялось — смотрите карточку дела" : left === 0 ? "сегодня" : `через ${left} ${plural(left)}`;
      const [place, time] = e.x.split(", ");
      return `<div class="cal-i${past ? " past" : ""}"><span class="left">${badge}</span><div class="dt">${e.d.slice(8, 10)}.${e.d.slice(5, 7)}</div><div class="tm">${e.d.slice(0, 4)} · ${esc(time.replace(/\.$/, "").split(". ")[0])} · ${esc(place)}</div><h4>${esc(e.t.replace("Заседание: ", ""))}</h4><p>${esc(time.split(". ").slice(1).join(". "))}</p><div class="src"><i>Источник</i>${srcList(e.s)}</div></div>`;
    }).join("");
  }

  /* ───── хронология ───── */
  const fmtD = (e) => e.l || (e.p === "y" ? e.d : e.p === "m" ? `${MONTHS[+e.d.slice(5, 7) - 1]} ${e.d.slice(0, 4)}` : `${e.d.slice(8, 10)}.${e.d.slice(5, 7)}.${e.d.slice(0, 4)}`);
  const sortKey = (e) => e.o || (e.p === "y" ? e.d + "-12-32" : e.p === "m" ? e.d + "-32" : e.d);
  const QN = { doc: "Установлено документом", claim: "Со слов стороны дела", open: "Не установлено" };
  const today = new Date().toISOString().slice(0, 10);
  const EV = S.EVENTS.map((e, i) => ({ ...e, i, y: e.d.slice(0, 4), q: e.q || "doc", key: sortKey(e) })).sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : a.i - b.i));
  EV.forEach((e, n) => { e.id = `e-${e.d}-${n}`; e.hay = [fmtD(e), e.t, e.x, S.TRACKS[e.tr], ...e.s.map((s) => S.SRC[Array.isArray(s) ? s[0] : s].t)].join(" ").toLowerCase().replace(/ё/g, "е"); e.future = e.up && e.d >= today; });
  const tl = $("#tl"), years = [...new Set(EV.map((e) => e.y))];
  tl.innerHTML = years.map((y) => `<section class="yr" id="y${y}" data-y="${y}"><h3 class="yr-h">${y}</h3>` + EV.filter((e) => e.y === y).map((e) =>
    `<article class="ev${e.k ? " k" : ""}${e.future ? " up" : ""}" id="${e.id}" data-tr="${e.tr}" data-n="${EV.indexOf(e)}">
      <div class="ev-d"><time datetime="${e.d}">${esc(fmtD(e))}</time>${e.future ? " · предстоит" : ""}<span class="tr">${esc(S.TRACKS[e.tr])}</span></div>
      <div class="ev-m"><button class="ev-t" aria-expanded="false" aria-controls="${e.id}-x"><span class="q q-${e.q}" title="${QN[e.q]}"></span><span>${esc(e.t)}</span><span class="ar" aria-hidden="true">+</span></button>
        <div class="ev-x" id="${e.id}-x"><div><p>${esc(e.x)}</p>${e.img ? exhBtn(e.img) : ""}<div class="src"><i>Источник</i>${srcList(e.s)}</div><a class="ev-link" href="#${e.id}">ссылка на это событие</a></div></div>
      </div></article>`).join("") + "</section>").join("");
  function exhBtn(k) { const [cap] = S.EXHIBITS[k]; return `<button class="exh" data-exh="${k}"><img src="assets/img/${k}_s.webp" alt="" loading="lazy" width="640" height="360"><span>${esc(cap)}</span></button>`; }
  const evEls = $$(".ev", tl);
  const setOpen = (el, open) => { el.classList.toggle("open", open); $(".ev-t", el).setAttribute("aria-expanded", open); };
  tl.addEventListener("click", (e) => { const b = e.target.closest(".ev-t"); if (b) { const el = b.closest(".ev"); setOpen(el, !el.classList.contains("open")); } });

  const chips = $("#tlChips"), state = { tr: new Set(), q: "", key: false };
  const cnt = {}; EV.forEach((e) => { cnt[e.tr] = (cnt[e.tr] || 0) + 1; });
  chips.innerHTML = Object.entries(S.TRACKS).map(([k, t]) => `<button aria-pressed="false" data-tr="${k}">${esc(t)}<sup>${cnt[k] || 0}</sup></button>`).join("");
  const allBtn = $("#tlAll");
  allBtn.addEventListener("click", () => { const on = allBtn.getAttribute("aria-pressed") !== "true"; allBtn.setAttribute("aria-pressed", on); allBtn.textContent = on ? "Свернуть все" : "Раскрыть все"; evEls.forEach((el) => setOpen(el, on)); });
  function filter() {
    const q = state.q.trim().toLowerCase().replace(/ё/g, "е").split(/\s+/).filter(Boolean);
    let n = 0; const perYear = {};
    evEls.forEach((el) => {
      const e = EV[+el.dataset.n];
      const ok = (!state.tr.size || state.tr.has(e.tr)) && (!state.key || e.k) && q.every((w) => e.hay.includes(w));
      el.hidden = !ok; if (ok) { n++; perYear[e.y] = (perYear[e.y] || 0) + 1; }
    });
    $$(".yr", tl).forEach((y) => { y.hidden = !perYear[y.dataset.y]; });
    $$("#tlRail a").forEach((a) => a.classList.toggle("empty", !perYear[a.dataset.y]));
    $("#tlCount").textContent = `${n} из ${EV.length}`;
    let empty = $(".tl-empty", tl);
    if (!n && !empty) tl.append(h('<p class="tl-empty">Ничего не найдено. Попробуйте другое слово или снимите фильтры.</p>'));
    if (n && empty) empty.remove();
    mini(perYear);
  }
  chips.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; const k = b.dataset.tr; state.tr.has(k) ? state.tr.delete(k) : state.tr.add(k); b.setAttribute("aria-pressed", state.tr.has(k)); filter(); });
  $("#tlQ").addEventListener("input", (e) => { state.q = e.target.value; filter(); });
  $("#tlKey").addEventListener("change", (e) => { state.key = e.target.checked; filter(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); $("#timeline").scrollIntoView(); $("#tlQ").focus(); }
  });
  $("#tlRail").innerHTML = years.map((y) => `<a href="#y${y}" data-y="${y}">${y}</a>`).join("");
  /* плотность по годам */
  const Y0 = 2007, Y1 = +years[years.length - 1], miniYears = [years[0], ...Array.from({ length: Y1 - Y0 + 1 }, (_, i) => String(Y0 + i))];
  function mini(per) {
    const tot = {}, key = {};
    evEls.forEach((el) => { if (el.hidden) return; const e = EV[+el.dataset.n]; tot[e.y] = (tot[e.y] || 0) + 1; if (e.k) key[e.y] = (key[e.y] || 0) + 1; });
    const all = EV.reduce((o, e) => { o[e.y] = (o[e.y] || 0) + 1; return o; }, {}), mx = Math.max(1, ...Object.values(all));
    $("#tlMini").innerHTML = miniYears.map((y, i) => { const t = tot[y] || 0, k = key[y] || 0; return `<a href="#y${y}" data-tip="<b>${y}</b>${t ? t + " соб., из них ключевых " + k : "нет событий"}" ${t ? "" : 'tabindex="-1"'}><i style="height:${((t - k) / mx) * 100}%"></i><i class="k" style="height:${(k / mx) * 100}%"></i><span>${i === 0 || y % 2 === 1 ? "’" + y.slice(2) : ""}</span></a>`; }).join("");
  }
  filter();
  function openHash() {
    const el = location.hash.startsWith("#e-") && document.getElementById(location.hash.slice(1));
    if (el) { el.hidden = false; el.closest(".yr").hidden = false; setOpen(el, true); setTimeout(() => el.scrollIntoView({ block: "center" }), 60); }
  }
  addEventListener("hashchange", openHash);

  /* ───── документы и экспонаты ───── */
  const GN = { ru: ["Россия", "RU"], uk: ["Великобритания", "UK"], cz: ["Чехия", "CZ"], reg: ["Реестры", "§"] };
  const ext = (f) => f.split(".").pop().toUpperCase();
  $("#docList").innerHTML = S.DOCS.map((d) => {
    const files = d.files ? `<details${d.files.length <= 3 ? " open" : ""}><summary>Файлы: ${d.files.length}</summary><ul class="files">${d.files.map((f) => `<li><a href="${esc(f.f)}" target="_blank" rel="noopener"><time>${esc(f.d)}</time><span>${esc(f.t)}</span><em>${ext(f.f)}&nbsp;↓</em></a></li>`).join("")}</ul></details>` : "";
    const more = (d.u2 || []).map(([t, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)} ↗</a>`).join("");
    return `<article class="doc" data-g="${d.g}"><div class="g" title="${GN[d.g][0]}">${GN[d.g][1]}</div><div><h4>${esc(d.t)}</h4><p class="sub">${esc(d.sub)}</p><p class="why">${esc(d.why)}</p>${files}</div><div class="lnk"><a href="${esc(d.u)}" target="_blank" rel="noopener">Первоисточник ↗</a>${more}</div></article>`;
  }).join("");
  const dc = $("#docChips");
  dc.innerHTML = `<button aria-pressed="true" data-g="">Все<sup>${S.DOCS.length}</sup></button>` + Object.entries(GN).map(([k, [t]]) => `<button aria-pressed="false" data-g="${k}">${t}<sup>${S.DOCS.filter((d) => d.g === k).length}</sup></button>`).join("");
  dc.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; $$("button", dc).forEach((x) => x.setAttribute("aria-pressed", x === b)); $$(".doc").forEach((d) => { d.hidden = b.dataset.g && d.dataset.g !== b.dataset.g; }); });
  const EXK = Object.keys(S.EXHIBITS);
  $("#exhGrid").innerHTML = EXK.map(exhBtn).join("");
  $$(".exh-row[data-exh]").forEach((r) => { r.innerHTML = r.dataset.exh.split(",").map(exhBtn).join(""); r.removeAttribute("data-exh"); });

  const lb = $("#lb"); let lbI = 0;
  function showExh(i) {
    lbI = (i + EXK.length) % EXK.length; const k = EXK[lbI], [cap, src] = S.EXHIBITS[k];
    $("#lbImg").src = `assets/img/${k}.webp`; $("#lbImg").alt = cap; $("#lbCap").textContent = cap; $("#lbSrc").innerHTML = srcHTML(src);
  }
  document.addEventListener("click", (e) => { const b = e.target.closest(".exh[data-exh]"); if (b) { showExh(EXK.indexOf(b.dataset.exh)); lb.showModal(); } });
  $("#lbX").addEventListener("click", () => lb.close());
  $("#lbPrev").addEventListener("click", () => showExh(lbI - 1)); $("#lbNext").addEventListener("click", () => showExh(lbI + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") showExh(lbI - 1); if (e.key === "ArrowRight") showExh(lbI + 1); });

  /* ───── вопросы ───── */
  $("#qs").innerHTML = S.QUESTIONS.map((q, i) => `<li class="reveal" style="--d:${i * 350}ms">${esc(q)}</li>`).join("");

  /* ───── подсказки ───── */
  const tip = $("#tip");
  const showTip = (el, x, y) => { tip.innerHTML = el.dataset.tip; tip.hidden = false; const r = tip.getBoundingClientRect(); tip.style.left = Math.max(8, Math.min(x + 14, innerWidth - r.width - 8)) + "px"; tip.style.top = Math.max(8, y - r.height - 14) + "px"; };
  document.addEventListener("pointermove", (e) => { const el = e.target.closest && e.target.closest("[data-tip]"); if (el) showTip(el, e.clientX, e.clientY); else tip.hidden = true; });
  document.addEventListener("focusin", (e) => { const el = e.target.closest("[data-tip]"); if (el) { const r = el.getBoundingClientRect(); showTip(el, r.left + r.width / 2, r.top); } });
  document.addEventListener("focusout", () => { tip.hidden = true; });

  /* ───── прокрутка ───── */
  const heroBg = $(".hero-bg");
  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    top.classList.toggle("scrolled", y > 20);
    if (!reduced && y < innerHeight) heroBg.style.transform = `scale(1.04) translateY(${y * 0.12}px)`;
    /* активный раздел меню */
    let cur = null; for (const t of navTargets) if (t.getBoundingClientRect().top < innerHeight * 0.4) cur = t;
    navLinks.forEach((a) => a.classList.toggle("on", cur && a.getAttribute("href") === "#" + cur.id));
    /* шаг схемы */
    const line = innerHeight * (mode === "m" ? 0.8 : 0.6); let s = 0;
    stepEls.forEach((el, i) => { if (el.getBoundingClientRect().top < line) s = i; });
    applyStep(s);
    /* год в рейке */
    let yy = null; for (const el of $$(".yr:not([hidden])", tl)) if (el.getBoundingClientRect().top < innerHeight * 0.45) yy = el.dataset.y;
    $$("#tlRail a").forEach((a) => a.classList.toggle("on", a.dataset.y === yy));
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", () => { renderBoard(); SCALES.forEach((s) => drawScale(...s)); onScroll(); });

  renderBoard(); watch(); onScroll(); openHash();
  requestAnimationFrame(() => $$(".hero .reveal").forEach((n) => n.classList.add("in")));
  setTimeout(() => countUp($("#heroFig")), 500);
})();
