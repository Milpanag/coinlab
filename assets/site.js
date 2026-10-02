/* =========================================================
   Κοινός κώδικας για όλες τις σελίδες.
   Δεν χρειάζεται να αλλάξετε τίποτα εδώ: όλο το περιεχόμενο
   βρίσκεται στον φάκελο data/ και αλλάζει από το Pages CMS.
   ========================================================= */

const NAV = [
  ["index.html", "Αρχική"],
  ["about.html", "Σχετικά"],
  ["team.html", "Ομάδα"],
  ["research.html", "Έρευνα"],
  ["publications.html", "Δημοσιεύσεις"],
  ["news.html", "Νέα"],
  ["contact.html", "Επικοινωνία"],
];
const TEAM_GROUPS = ["Διδακτικό Προσωπικό", "Συνεργαζόμενα Μέλη", "Διδάκτορες", "Υποψήφιοι Διδάκτορες"];
const ALPHA_GROUPS = ["Υποψήφιοι Διδάκτορες"]; // αλφαβητικά με βάση το επώνυμο
const PUB_GROUPS = ["Επιστημονικά Περιοδικά", "Επιστημονικά Συνέδρια", "Κεφάλαια σε Συλλογικούς Τόμους", "Βιβλία", "Άλλες"];
const MONTHS = ["Ιανουάριος","Φεβρουάριος","Μάρτιος","Απρίλιος","Μάιος","Ιούνιος","Ιούλιος","Αύγουστος","Σεπτέμβριος","Οκτώβριος","Νοέμβριος","Δεκέμβριος"];
const MONTHS_GEN = ["Ιανουαρίου","Φεβρουαρίου","Μαρτίου","Απριλίου","Μαΐου","Ιουνίου","Ιουλίου","Αυγούστου","Σεπτεμβρίου","Οκτωβρίου","Νοεμβρίου","Δεκεμβρίου"];
const PALETTE = ["#1F4E8C","#8C3B5E","#5E7A2E","#1F6F8B","#A8741A","#5B4FB3"];
const LOGO = "images/uoa-logo.png";

/* ---------- Βοηθητικά ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
const paras = (t) => String(t || "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${inline(p).replace(/\n/g, "<br>")}</p>`).join("");
const initials = (n) => String(n || "").split(/[\s-]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
const surname = (n) => String(n || "").trim().split(/\s+/).pop();
const list = (x) => Array.isArray(x) ? x.filter(Boolean) : (x ? [x] : []);
function parseDate(d) {
  const m = String(d || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}
function fmtDate(d) { const x = parseDate(d); return x ? `${x.getDate()} ${MONTHS_GEN[x.getMonth()]} ${x.getFullYear()}` : ""; }
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const safeUrl = (u) => /^(https?:\/\/|mailto:|uploads\/|images\/|files\/)/i.test(String(u || "").trim()) ? String(u).trim() : "";
// απόλυτη διεύθυνση, ώστε η εικόνα να βρίσκεται σωστά από το style.css
const abs = (u) => { try { return new URL(u, location.href).href; } catch { return u; } };
const bg = (u) => safeUrl(u) ? `--img:url('${esc(abs(safeUrl(u)))}')` : "";

const cache = {};
async function load(name) {
  if (name in cache) return cache[name];
  try {
    const r = await fetch(`data/${name}.json`, { cache: "no-cache" });
    if (!r.ok) throw new Error(r.status);
    return (cache[name] = await r.json());
  } catch (e) {
    if (location.protocol === "file:") showLocalNotice();
    return (cache[name] = null);
  }
}
function showLocalNotice() {
  if ($(".notice")) return;
  const n = document.createElement("div");
  n.className = "notice";
  n.textContent = "Προεπισκόπηση από τον υπολογιστή: το περιεχόμενο εμφανίζεται μόλις το site ανέβει στο GitHub.";
  document.body.prepend(n);
}

/* ---------- Βίντεο ---------- */
function videoEmbed(v) {
  v = String(v || "").trim();
  if (!v) return "";
  const yt = v.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="Βίντεο" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
  const vm = v.match(/vimeo\.com\/(\d+)/);
  if (vm) return `<div class="video"><iframe src="https://player.vimeo.com/video/${vm[1]}" title="Βίντεο" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
  if (safeUrl(v)) return `<div class="video"><video src="${esc(safeUrl(v))}" controls preload="metadata"></video></div>`;
  return "";
}

/* ---------- Lightbox ---------- */
function lightbox() {
  let d = $("dialog.lightbox");
  if (!d) {
    d = document.createElement("dialog");
    d.className = "lightbox";
    d.innerHTML = `<button aria-label="Κλείσιμο">×</button><img alt="">`;
    document.body.appendChild(d);
    d.addEventListener("click", (e) => { if (e.target !== d.querySelector("img")) d.close(); });
  }
  return d;
}
function bindGallery(root) {
  root.querySelectorAll(".gallery button").forEach(b => b.addEventListener("click", () => {
    const d = lightbox(); const img = d.querySelector("img");
    img.src = b.dataset.src; img.alt = b.dataset.alt || "";
    d.showModal();
  }));
}

/* ---------- Κεφαλίδα & υποσέλιδο ---------- */
function renderChrome(site) {
  const s = site || {};
  const title = s.title || "Εργαστήριο Κατανάλωσης, Επιχειρηματικότητας και Καινοτομίας";
  const section = document.body.dataset.section;
  const deptUrl = safeUrl(s.department_url) || "https://www.soc.uoa.gr/";
  const head = $("#site-header");
  if (head) {
    head.outerHTML = `
    <div class="topbar"><div class="wrap">
      <a class="uoa-logo" href="https://www.uoa.gr/"><img src="${LOGO}" alt="Εθνικό και Καποδιστριακό Πανεπιστήμιο Αθηνών" onerror="this.classList.add('missing');this.nextElementSibling.hidden=false"><span hidden>Εθνικό και Καποδιστριακό Πανεπιστήμιο Αθηνών</span></a>
      <a href="${esc(deptUrl)}">Τμήμα Κοινωνιολογίας ↗</a>
    </div></div>
    <header class="site-header">
      <div class="wrap">
        <a class="brand" href="index.html"><b>${esc(title)}</b><span>${esc(s.department || "Τμήμα Κοινωνιολογίας")}, ΕΚΠΑ</span></a>
        <button class="nav-toggle" aria-expanded="false" aria-controls="mainnav">Μενού</button>
        <nav class="nav" id="mainnav" aria-label="Κύρια πλοήγηση">
          ${NAV.map(([h, t]) => `<a href="${h}"${h === section ? ' aria-current="page"' : ""}>${t}</a>`).join("")}
        </nav>
      </div>
    </header>`;
    const btn = $(".nav-toggle"), nav = $("#mainnav");
    btn.addEventListener("click", () => btn.setAttribute("aria-expanded", nav.classList.toggle("open")));
  }
  const foot = $("#site-footer");
  if (foot) {
    foot.outerHTML = `
    <footer class="site-footer">
      <div class="wrap">
        <div><b>${esc(title)}</b>${s.title_en ? `<em>${esc(s.title_en)}</em><br>` : ""}${esc(s.department || "Τμήμα Κοινωνιολογίας")}<br>${esc(s.university || "Εθνικό και Καποδιστριακό Πανεπιστήμιο Αθηνών")}</div>
        <div><b>Επικοινωνία</b>${s.address ? esc(s.address) + "<br>" : ""}${s.email ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a><br>` : ""}${s.phone ? esc(s.phone) + "<br>" : ""}<a href="contact.html">Φόρμα επικοινωνίας</a></div>
        <div><b>Σύνδεσμοι</b><ul>
          <li><a href="${esc(deptUrl)}">Τμήμα Κοινωνιολογίας</a></li>
          <li><a href="https://www.uoa.gr/">ΕΚΠΑ</a></li>
          <li><a href="https://hub.uoa.gr/">Κόμβος Επικοινωνίας ΕΚΠΑ</a></li>
          ${safeUrl(s.linkedin) ? `<li><a href="${esc(safeUrl(s.linkedin))}">LinkedIn</a></li>` : ""}
        </ul></div>
        <div class="copy">© ${new Date().getFullYear()} ${esc(title)}</div>
      </div>
    </footer>`;
  }
}

/* ---------- Νέα ---------- */
function sortNews(arr) { return (arr || []).filter(n => n && n.title).sort((a, b) => (parseDate(b.date) || 0) - (parseDate(a.date) || 0)); }
function newsCard(n, full) {
  const vid = full ? videoEmbed(n.video) : "";
  const img = !vid || !full ? (safeUrl(n.image) ? `<div class="photo" style="${bg(n.image)}"></div>` : (n.video && !full ? `<div class="photo" style="background:#1A2238;display:grid;place-items:center;color:#fff;font-size:2rem">▶</div>` : `<div class="photo"></div>`)) : "";
  return `<article class="news-card">
    ${full && vid ? vid : img}
    <time datetime="${esc(n.date)}">${fmtDate(n.date)}</time>
    <h3>${esc(n.title)}</h3>
    ${paras(n.summary)}
    ${full && n.body ? `<details><summary>Διαβάστε περισσότερα</summary>${paras(n.body)}</details>` : ""}
    ${!full ? `<p><a class="more" href="news.html">Διαβάστε περισσότερα</a></p>` : ""}
    ${full && safeUrl(n.link) ? `<p><a class="more" href="${esc(safeUrl(n.link))}">Σύνδεσμος</a></p>` : ""}
  </article>`;
}
function uoaFeed(feed, n) {
  const items = (feed && feed.items || []).slice(0, n);
  if (!items.length) return "";
  return `<ul class="uoa-feed">${items.map(i => `<li><a href="${esc(safeUrl(i.link))}" target="_blank" rel="noopener">
      <div class="photo" style="${bg(i.image)}"></div>
      <div class="t"><time>${fmtDate(i.date)}</time><h4>${esc(i.title)}</h4></div></a></li>`).join("")}</ul>
    <p class="feed-src">Αυτόματη ενημέρωση από τον <a href="https://hub.uoa.gr/" target="_blank" rel="noopener">Κόμβο Επικοινωνίας του ΕΚΠΑ</a>.</p>`;
}

/* ---------- Εκδηλώσεις & ημερολόγιο ---------- */
function eventItem(e) {
  const when = fmtDate(e.date) + (e.time ? `, ${esc(e.time)}` : "");
  return `<li><div class="when">${when}</div><h4>${esc(e.title)}</h4>
    ${e.location ? `<p>${esc(e.location)}</p>` : ""}
    ${e.description ? `<p>${esc(e.description)}</p>` : ""}
    ${safeUrl(e.link) ? `<p><a class="more" href="${esc(safeUrl(e.link))}" target="_blank" rel="noopener">Περισσότερα</a></p>` : ""}</li>`;
}
function upcoming(events, n) {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return (events || []).filter(e => parseDate(e.date) >= t).sort((a, b) => parseDate(a.date) - parseDate(b.date)).slice(0, n);
}
function calendar(root, events) {
  events = (events || []).filter(e => parseDate(e.date));
  const today = new Date();
  let view = new Date(today.getFullYear(), today.getMonth(), 1), selected = null;
  const listEl = $("#event-list");
  function showList() {
    let items, title;
    if (selected) { items = events.filter(e => sameDay(parseDate(e.date), selected)); title = `Δραστηριότητες στις ${selected.getDate()} ${MONTHS_GEN[selected.getMonth()]}`; }
    else { items = upcoming(events, 6); title = "Επερχόμενες δραστηριότητες"; }
    listEl.innerHTML = `<h3 style="font-size:1.1rem;margin-top:20px">${title}</h3>` +
      (items.length ? `<ul class="events">${items.map(eventItem).join("")}</ul>` : `<p class="muted" style="margin-top:10px">Δεν υπάρχουν προγραμματισμένες δραστηριότητες.</p>`) +
      (selected ? `<p><button class="btn" style="padding:8px 14px;font-size:.9rem" id="show-all">Όλες οι επερχόμενες</button></p>` : "");
    const b = $("#show-all"); if (b) b.onclick = () => { selected = null; draw(); };
  }
  function draw() {
    const y = view.getFullYear(), m = view.getMonth();
    const first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
    let cells = ["Δε","Τρ","Τε","Πε","Πα","Σα","Κυ"].map(d => `<div class="dow">${d}</div>`).join("");
    for (let i = 0; i < first; i++) cells += `<span class="blank"></span>`;
    for (let d = 1; d <= days; d++) {
      const date = new Date(y, m, d), has = events.some(e => sameDay(parseDate(e.date), date));
      const cls = [has ? "has" : "", sameDay(date, today) ? "today" : "", sameDay(date, selected) ? "sel" : ""].join(" ");
      cells += `<button class="${cls}" ${has ? `data-d="${d}" aria-label="${d} ${MONTHS_GEN[m]}, έχει δραστηριότητα"` : 'tabindex="-1" aria-hidden="true"'}>${d}</button>`;
    }
    root.innerHTML = `<div class="cal-head"><button aria-label="Προηγούμενος μήνας" id="prev">‹</button><h3>${MONTHS[m]} ${y}</h3><button aria-label="Επόμενος μήνας" id="next">›</button></div><div class="cal-grid">${cells}</div>`;
    $("#prev", root).onclick = () => { view = new Date(y, m - 1, 1); draw(); };
    $("#next", root).onclick = () => { view = new Date(y, m + 1, 1); draw(); };
    root.querySelectorAll("button[data-d]").forEach(b => b.onclick = () => { selected = new Date(y, m, +b.dataset.d); draw(); });
    showList();
  }
  draw();
}

/* ---------- Ομάδα ---------- */
function personCard(p) {
  const img = safeUrl(p.photo), cv = safeUrl(p.cv);
  return `<article class="person">
    <div class="person-photo" style="${img ? `background-image:url('${esc(img)}')` : ""}">${img ? "" : esc(initials(p.name))}</div>
    <h3>${esc(p.name)}</h3>
    ${p.role ? `<p class="role">${esc(p.role)}</p>` : ""}
    ${p.topic ? `<p class="topic"><span>Θέμα διατριβής</span>${esc(p.topic)}</p>` : ""}
    ${p.email ? `<p class="contact-line"><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>` : ""}
    ${p.phone ? `<p class="contact-line">${esc(p.phone)}</p>` : ""}
    ${cv ? `<a class="cv" href="${esc(cv)}" target="_blank" rel="noopener">Βιογραφικό</a>` : ""}
  </article>`;
}

/* ---------- Δημοσιεύσεις ---------- */
function pubItem(p) {
  const link = safeUrl(p.link);
  return `<li><span class="yr">${esc(p.year)}</span><div>
    <div class="meta">${esc(p.authors)}</div><div class="t">${esc(p.title)}</div>
    ${p.venue ? `<div class="meta"><em>${esc(p.venue)}</em></div>` : ""}
    ${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">Δείτε τη δημοσίευση</a>` : ""}</div></li>`;
}

/* ---------- Γραφήματα ---------- */
const nf = new Intl.NumberFormat("el-GR");
function drawChart(canvas, cfg) {
  if (!window.Chart || !canvas) return;
  const labels = String(cfg.labels || "").split(",").map(s => s.trim()).filter(Boolean);
  const round = cfg.type === "pie" || cfg.type === "doughnut";
  const horiz = cfg.type === "barh";
  const type = horiz ? "bar" : (cfg.type || "bar");
  const series = list(cfg.series);
  const datasets = series.map((s, i) => {
    const color = PALETTE[i % PALETTE.length];
    const data = String(s.values || "").split(",").map(v => parseFloat(v.replace(/\s/g, "")) || 0);
    return {
      label: s.name || "", data,
      backgroundColor: round ? labels.map((_, j) => PALETTE[j % PALETTE.length])
        : (series.length === 1 && (type === "bar") ? data.map((_, j) => j < 3 ? color : color + "66") : color + (type === "line" ? "33" : "")),
      borderColor: round ? "#fff" : color, borderWidth: round ? 2 : (type === "line" ? 2 : 0), borderRadius: type === "bar" ? 3 : 0, tension: .3,
    };
  });
  const unit = cfg.unit ? ` ${cfg.unit}` : "";
  const font = { family: "Commissioner" };
  new Chart(canvas, {
    type, data: { labels, datasets },
    options: {
      indexAxis: horiz ? "y" : "x", responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: datasets.length > 1 || round, position: "bottom", labels: { font } },
        tooltip: { callbacks: { label: (c) => `${c.dataset.label ? c.dataset.label + ": " : ""}${nf.format(c.raw)}${unit}` } },
      },
      scales: round ? {} : {
        [horiz ? "x" : "y"]: { beginAtZero: true, ticks: { precision: 0, font, callback: (v) => nf.format(v) }, title: { display: !!cfg.unit, text: cfg.unit || "", font } },
        [horiz ? "y" : "x"]: { ticks: { font }, grid: { display: false } },
      },
    },
  });
}
function chartBox(cfg, id, tall) {
  return `<div class="chart-card"><div class="chart-box${tall ? " tall" : ""}"><canvas id="${id}" role="img" aria-label="${esc(cfg.title)}"></canvas></div>
    ${cfg.source ? `<p class="src">Πηγή: ${esc(cfg.source)}${safeUrl(cfg.source_link) ? ` <a href="${esc(safeUrl(cfg.source_link))}" target="_blank" rel="noopener">↗</a>` : ""}</p>` : ""}</div>`;
}
function chartText(cfg, full) {
  const ps = String(cfg.description || "").split(/\n\s*\n/).filter(Boolean);
  const first = ps.slice(0, 1).join("\n\n"), rest = ps.slice(1).join("\n\n");
  return `${cfg.month ? `<p class="month">${esc(cfg.month)}</p>` : ""}
    <h3>${esc(cfg.headline || cfg.title)}</h3>
    ${cfg.headline ? `<p class="muted" style="font-size:.95rem">${esc(cfg.title)}</p>` : ""}
    <div class="analysis">${paras(first)}${rest ? `<details${full ? "" : ""}><summary>Διαβάστε ολόκληρη την ανάλυση</summary>${paras(rest)}</details>` : ""}</div>`;
}
function featuredChart(charts) {
  const ch = list(charts).filter(c => c.title && c.visible !== false);
  return ch.find(c => c.featured) || ch[0];
}

/* ---------- Σελίδες ---------- */
const PAGES = {
  async home(site) {
    const [home, axes, news, events, charts, feed] = await Promise.all([load("home"), load("axes"), load("news"), load("events"), load("charts"), load("uoa-news")]);
    const s = site || {};
    if (home) {
      $("#h-tagline").innerHTML = inline(home.tagline);
      $("#h-pull").innerHTML = inline(home.pull);
      $("#h-intro").innerHTML = paras(home.intro);
      $("#h-focus-title").textContent = home.focus_title || "Πεδία έμφασης";
      $("#h-focus").innerHTML = list(home.focus).map(f => `<li>${esc(f)}</li>`).join("");
      $("#h-outro").innerHTML = paras(home.outro);
      $("#h-goal").innerHTML = `<h3>${esc(home.goal_title)}</h3>${paras(home.goal_text)}${list(home.goal_items).length ? `<p style="margin-top:12px"><strong>${esc(home.goal_items_title || "")}</strong></p><ul class="goal-list">${list(home.goal_items).map(g => `<li>${inline(g)}</li>`).join("")}</ul>` : ""}`;
    }
    if (s.title) $("#h-title").textContent = s.title;
    if (s.title_en) $("#h-title-en").textContent = s.title_en;
    // εναλλαγή φωτογραφιών
    const imgs = list(s.hero_images).map(safeUrl).filter(Boolean);
    const box = $("#slides");
    if (imgs.length) {
      box.innerHTML = imgs.map((u, i) => `<div class="${i ? "" : "on"}" style="background-image:url('${esc(u)}')"></div>`).join("");
      if (imgs.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        let k = 0; const els = box.children;
        setInterval(() => { els[k].classList.remove("on"); k = (k + 1) % els.length; els[k].classList.add("on"); }, 6000);
      }
    }
    // απόδειξη
    if (axes) $("#receipt-list").innerHTML = axes.map(a => `<li><a href="axis.html?id=${encodeURIComponent(a.id)}"><span class="sw" style="background:${esc(a.color)}"></span><span class="name">${esc(a.title)}</span><span class="dots"></span><span>1</span></a></li>`).join("");
    // γράφημα του μήνα
    const fc = featuredChart(charts);
    if (fc) {
      $("#featured").innerHTML = `<div><span class="kicker">Γράφημα του μήνα</span>${chartText(fc)}<p><a class="more" href="research.html#charts-block">Όλα τα γραφήματα</a></p></div>${chartBox(fc, "chart-featured", true)}`;
      drawChart($("#chart-featured"), fc);
    } else $("#featured-block").hidden = true;
    // νέα
    const n = sortNews(news).slice(0, 3);
    $("#home-news").innerHTML = n.length ? `<div class="news-grid">${n.map(x => newsCard(x, false)).join("")}</div>` : `<p class="empty">Σύντομα θα αναρτηθούν τα πρώτα νέα του Εργαστηρίου.</p>`;
    const ev = upcoming(events, 3);
    $("#home-events").innerHTML = ev.length ? `<ul class="events">${ev.map(eventItem).join("")}</ul>` : `<p class="muted">Δεν υπάρχουν προγραμματισμένες δραστηριότητες αυτή τη στιγμή.</p>`;
    const f = uoaFeed(feed, 4);
    if (f) $("#home-uoa").innerHTML = f; else $("#uoa-block").hidden = true;
  },

  async about() {
    const a = await load("about");
    if (!a) return;
    $("#a-photo").style.cssText = bg(a.director_photo);
    $("#a-wtitle").textContent = a.welcome_title;
    $("#a-quote").innerHTML = inline(a.welcome_quote);
    $("#a-text").innerHTML = paras(a.welcome_text);
    $("#a-sign").innerHTML = `<b>${esc(a.director_name)}</b>${esc(a.director_role)}`;
    $("#a-gtitle").textContent = a.glance_title;
    $("#a-gtext").innerHTML = paras(a.glance_text) + (list(a.fields).length ? `<ul class="chips" style="margin-bottom:8px">${list(a.fields).map(f => `<li>${esc(f)}</li>`).join("")}</ul>` : "");
    $("#a-facts").innerHTML = list(a.facts).map(f => `<dt>${esc(f.label)}</dt><dd>${inline(f.value)}</dd>`).join("");
    const gi = list(a.glance_images);
    $("#a-collage").innerHTML = gi.map(u => `<div class="photo" style="${bg(u)}"></div>`).join("");
    if (gi.length < 2) $("#a-collage").style.gridTemplateColumns = "1fr";
  },

  async team() {
    const team = (await load("team")) || [];
    $("#team-root").innerHTML = TEAM_GROUPS.map(g => {
      let people = team.filter(p => p && p.name && p.category === g);
      if (ALPHA_GROUPS.includes(g)) people.sort((a, b) => surname(a.name).localeCompare(surname(b.name), "el"));
      if (!people.length) return "";
      return `<section class="team-group"><h2>${g}</h2><div class="people">${people.map(personCard).join("")}</div></section>`;
    }).join("");
  },

  async research() {
    const [axes, projects, charts] = await Promise.all([load("axes"), load("projects"), load("charts")]);
    $("#axis-cards").innerHTML = list(axes).map(a => `
      <a class="axis-card" href="axis.html?id=${encodeURIComponent(a.id)}" style="--c:${esc(a.color)}">
        <div class="photo" style="${bg(list(a.images)[0])}"></div>
        <div class="txt"><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p></div></a>`).join("");
    const pr = list(projects).filter(p => p.title);
    $("#projects").innerHTML = pr.length ? `<div class="projects">${pr.map(p => `
      <article class="project"><h3>${esc(p.title)}</h3>${p.status ? `<span class="status">${esc(p.status)}</span>` : ""}
      ${paras(p.description)}${safeUrl(p.link) ? `<a class="btn-link" href="${esc(safeUrl(p.link))}" target="_blank" rel="noopener">${esc(p.link_label || "Ιστοσελίδα του έργου")}</a>` : ""}</article>`).join("")}</div>`
      : `<p class="empty">Τα τρέχοντα ερευνητικά έργα θα παρουσιαστούν σύντομα.</p>`;
    const ch = list(charts).filter(c => c.title && c.visible !== false);
    if (!ch.length) { $("#charts-block").hidden = true; return; }
    $("#charts").innerHTML = `<div class="chart-archive">${ch.map((c, i) => `<div class="item"><div>${c.featured ? `<span class="kicker">Γράφημα του μήνα</span>` : ""}${chartText(c)}</div>${chartBox(c, "chart-" + i, true)}</div>`).join("")}</div>`;
    ch.forEach((c, i) => drawChart($(`#chart-${i}`), c));
  },

  async axis() {
    const axes = list(await load("axes"));
    const id = new URLSearchParams(location.search).get("id");
    const i = Math.max(0, axes.findIndex(a => a.id === id));
    const a = axes[i];
    if (!a) return;
    document.title = `${a.title} | Εργαστήριο Κατανάλωσης, Επιχειρηματικότητας και Καινοτομίας`;
    const imgs = list(a.images);
    const prev = axes[i - 1], next = axes[i + 1];
    $("#axis-root").innerHTML = `
    <section class="axis" style="--c:${esc(a.color)}">
      <div class="wrap">
        <div class="axis-band" style="${bg(imgs[0])}" role="img" aria-label="${esc(a.title)}"></div>
        <div class="axis-grid">
          <aside class="axis-side">
            <h1 style="font-size:clamp(1.7rem,2.8vw,2.3rem);margin-bottom:18px;color:var(--c)">${esc(a.title)}</h1>
            <p class="summary">${esc(a.summary)}</p>
            ${list(a.thinkers).length ? `<div class="thinkers"><h3>${esc(a.theory_label || "Θεωρητικό πλαίσιο")}</h3><ul>${list(a.thinkers).map(t => `<li>${esc(t)}</li>`).join("")}</ul></div>` : ""}
          </aside>
          <div class="axis-body">
            ${paras(a.intro)}
            ${a.more ? `<details><summary>Διαβάστε ολόκληρη την περιγραφή</summary>${paras(a.more)}</details>` : ""}
            ${list(a.list_items).length ? `<h3>${esc(a.list_title)}</h3><ul class="checks${/ερωτήματα/i.test(a.list_title) ? " q" : ""}">${list(a.list_items).map(x => `<li>${inline(x)}</li>`).join("")}</ul>` : ""}
            ${a.callout_text ? `<div class="callout"><h3>${esc(a.callout_title)}</h3>${paras(a.callout_text)}</div>` : ""}
            ${imgs.length > 1 ? `<div class="gallery">${imgs.slice(1).map(u => `<button data-src="${esc(safeUrl(u))}" data-alt="${esc(a.title)}" aria-label="Μεγέθυνση φωτογραφίας"><img src="${esc(safeUrl(u))}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
          </div>
        </div>
        <nav class="axis-nav" aria-label="Άλλοι άξονες">
          ${prev ? `<a href="axis.html?id=${encodeURIComponent(prev.id)}">‹ ${esc(prev.title)}</a>` : `<a href="research.html">‹ Όλοι οι άξονες</a>`}
          ${next ? `<a href="axis.html?id=${encodeURIComponent(next.id)}">${esc(next.title)} ›</a>` : `<a href="research.html">Όλοι οι άξονες ›</a>`}
        </nav>
      </div>
    </section>`;
    bindGallery($("#axis-root"));
  },

  async publications() {
    const pubs = list(await load("publications")).filter(p => p.title).sort((a, b) => (+b.year || 0) - (+a.year || 0));
    const root = $("#pubs-root"), filters = $("#pub-filters"), search = $("#pub-search");
    let current = "Όλες";
    function draw() {
      const q = search.value.trim().toLowerCase();
      const match = p => !q || [p.title, p.authors, p.venue, p.year].join(" ").toLowerCase().includes(q);
      let html = "";
      (current === "Όλες" ? PUB_GROUPS : [current]).forEach(g => {
        const items = pubs.filter(p => p.category === g && match(p));
        if (items.length) html += `<section class="pub-group"><h2>${g}</h2><ul class="pubs">${items.map(pubItem).join("")}</ul></section>`;
      });
      root.innerHTML = html || `<p class="empty">${pubs.length ? "Δεν βρέθηκαν δημοσιεύσεις με αυτά τα κριτήρια." : "Οι δημοσιεύσεις του Εργαστηρίου θα αναρτηθούν σύντομα."}</p>`;
    }
    filters.innerHTML = ["Όλες", ...PUB_GROUPS].map(g => `<button type="button" aria-pressed="${g === current}">${g}</button>`).join("");
    filters.querySelectorAll("button").forEach(b => b.onclick = () => {
      current = b.textContent; filters.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); draw();
    });
    search.oninput = draw; draw();
    if (pubs.length >= 3 && window.Chart) {
      const years = [...new Set(pubs.map(p => +p.year).filter(Boolean))].sort();
      const cfg = { type: "bar", title: "Δημοσιεύσεις ανά έτος", labels: years.join(","), series: [{ name: "Δημοσιεύσεις", values: years.map(y => pubs.filter(p => +p.year === y).length).join(",") }] };
      $("#pub-chart").innerHTML = `<h2 style="font-size:1.5rem;margin-bottom:16px">Δημοσιεύσεις ανά έτος</h2>` + chartBox(cfg, "chart-pubs");
      drawChart($("#chart-pubs"), cfg);
    }
  },

  async news() {
    const [news, events, feed] = await Promise.all([load("news"), load("events"), load("uoa-news")]);
    const n = sortNews(news);
    $("#news-root").innerHTML = n.length ? `<div class="news-grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${n.map(x => newsCard(x, true)).join("")}</div>` : `<p class="empty">Σύντομα θα αναρτηθούν τα πρώτα νέα του Εργαστηρίου.</p>`;
    calendar($("#calendar"), events || []);
    const f = uoaFeed(feed, 8);
    if (f) $("#news-uoa").innerHTML = f; else $("#uoa-block").hidden = true;
  },

  async contact(site) {
    const s = site || {};
    $("#c-address").innerHTML = s.address ? esc(s.address).replace(/\n/g, "<br>") + (s.office ? `<br>${esc(s.office)}` : "") : "Τμήμα Κοινωνιολογίας, ΕΚΠΑ";
    $("#c-email").innerHTML = s.email ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : "—";
    $("#c-phone").textContent = s.phone || "—";
    if (s.hours) $("#c-extra").innerHTML = `<dt>Ώρες</dt><dd>${esc(s.hours)}</dd>`;
    const topics = list(s.form_topics);
    if (topics.length) $("#f-topic").innerHTML = topics.map(t => `<option>${esc(t)}</option>`).join("");
    const form = $("#contact-form"), msg = $("#form-msg");
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      msg.className = "form-msg";
      if (form.website.value) return;
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form));
      if (s.formspree) {
        const btn = form.querySelector("button"); btn.disabled = true;
        try {
          const r = await fetch(`https://formspree.io/f/${encodeURIComponent(s.formspree)}`, {
            method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ name: data.name, email: data.email, θέμα: data.topic, μήνυμα: data.message }),
          });
          if (!r.ok) throw new Error();
          form.reset(); msg.className = "form-msg ok"; msg.textContent = "Το μήνυμά σας στάλθηκε. Θα επικοινωνήσουμε μαζί σας σύντομα.";
        } catch { msg.className = "form-msg err"; msg.textContent = "Το μήνυμα δεν στάλθηκε. Δοκιμάστε ξανά ή στείλτε μας email."; }
        btn.disabled = false;
      } else if (s.email) {
        location.href = `mailto:${s.email}?subject=${encodeURIComponent("[Ιστότοπος] " + data.topic)}&body=${encodeURIComponent(`Όνομα: ${data.name}\nEmail: ${data.email}\n\n${data.message}`)}`;
      } else { msg.className = "form-msg err"; msg.textContent = "Η φόρμα δεν έχει ενεργοποιηθεί ακόμη."; }
    });
  },
};

/* ---------- Εκκίνηση ---------- */
(async function init() {
  const site = await load("site");
  renderChrome(site);
  const page = document.body.dataset.page;
  if (PAGES[page]) PAGES[page](site);
})();
