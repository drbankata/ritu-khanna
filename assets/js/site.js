/* =====================================================================
   RITU KHANNA · site script (no libraries, no build step)
   Progressive enhancement: every page reads fine without JavaScript.
   ===================================================================== */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var ROOT = doc.getAttribute("data-root") || "";   /* "" on the home page, "../" in sub-folders */
  var NL = String.fromCharCode(10);

  /* ---------- SETTINGS (edit here) ----------
     Paste each detail between the quotes as soon as Ritu sends it. Anything left empty simply
     stays hidden. Until WHATSAPP, EMAIL or FORM_URL is set, orders can only be copied, and the
     "Send" step says ordering opens soon.                                                    */
  var WHATSAPP     = "";   /* digits only, with country code, e.g. "64211234567" (NZ +64, drop the leading 0) */
  var EMAIL        = "";   /* e.g. "hello@ritukhanna.co.nz" */
  var PHONE        = "";   /* as it should be shown, e.g. "021 123 4567" */
  var INSTAGRAM    = "";   /* full profile link */
  var FACEBOOK     = "";   /* full page link */
  var FORM_URL     = "";   /* optional Google Form link: orders/messages go there instead */
  var PAYMENT_URL  = "";   /* optional online payment link (Stripe / PayPal / Square payment link) */
  var BANK_DETAILS = "";   /* optional bank-transfer line shown at checkout, e.g. "ANZ · R Khanna · 01-0000-0000000-00" */
  var PICKUP_AREA  = "Auckland";  /* shown as the pickup place; add the suburb when Ritu is happy to show it */
  var CURRENCY     = "NZ$";
  var LEAD_DAYS    = 2;    /* food orders: earliest pickup is this many days from today */
  var MIN_FOOD     = 80;   /* food orders: minimum order value (0 = none) */
  var SITE = "https://drbankata.github.io/ritu-khanna/";

  /* ---------- helpers ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function money(n) { return CURRENCY + Math.round(n).toLocaleString("en-NZ"); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ref(prefix) { var d = new Date(); return prefix + "-" + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") + "-" + Math.floor(100 + Math.random() * 900); }

  /* ---------- Contact details: show only what has been filled in ---------- */
  var LINKS = {
    email: EMAIL && "mailto:" + EMAIL,
    whatsapp: WHATSAPP && "https://wa.me/" + WHATSAPP,
    phone: PHONE && "tel:" + PHONE.replace(/[^+0-9]/g, ""),
    instagram: INSTAGRAM, facebook: FACEBOOK, payment: PAYMENT_URL, bank: BANK_DETAILS
  };
  var TEXT = { email: EMAIL, phone: PHONE, whatsapp: PHONE || (WHATSAPP && "+" + WHATSAPP), bank: BANK_DETAILS };
  function external(a, url) { a.href = url; if (/^https?:/.test(url)) { a.target = "_blank"; a.rel = "noopener"; } }
  function applyShow(scope) {
    $$("[data-show]", scope).forEach(function (el) {
      var k = el.getAttribute("data-show");
      if (!LINKS[k]) { el.hidden = true; return; }
      el.hidden = false;
      if (el.tagName === "A" && k !== "bank") external(el, LINKS[k]);
      $$("[data-fill]", el).forEach(function (f) { if (TEXT[k]) f.textContent = TEXT[k]; });
    });
  }
  applyShow();
  var anyChannel = !!(WHATSAPP || EMAIL || FORM_URL);
  $$("[data-when-none]").forEach(function (el) { el.hidden = !!(WHATSAPP || EMAIL || PHONE); });
  $$("[data-pickup]").forEach(function (el) { el.textContent = PICKUP_AREA; });
  $$("[data-min-food]").forEach(function (el) { if (MIN_FOOD) el.textContent = money(MIN_FOOD); else el.closest("li,p,span").hidden = true; });
  $$("[data-lead]").forEach(function (el) { el.textContent = LEAD_DAYS === 1 ? "1 day" : LEAD_DAYS + " days"; });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Mobile menu ---------- */
  var toggle = $(".menu-btn"), nav = $("#site-nav");
  var ICON_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg><span class="sr-only">Open menu</span>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg><span class="sr-only">Close menu</span>';
  if (toggle && nav) {
    var setOpen = function (open) { nav.classList.toggle("open", open); toggle.setAttribute("aria-expanded", open ? "true" : "false"); toggle.innerHTML = open ? ICON_CLOSE : ICON_OPEN; };
    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); toggle.focus(); } });
  }

  /* ---------- Header shadow, reading progress, back-to-top ---------- */
  var header = $(".site-header"), bar = $(".progress"), toTop = $(".to-top");
  function onScroll() {
    var y = window.scrollY, h = doc.scrollHeight - innerHeight;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    if (toTop) toTop.classList.toggle("show", y > 900);
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (toTop) toTop.addEventListener("click", function () { scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Toast ---------- */
  var toast = document.createElement("div"); toast.className = "toast"; toast.setAttribute("role", "status"); toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
  var tt;
  function say(html) { toast.innerHTML = html; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("show"); }, 3600); }

  /* ---------- Dialog helpers ---------- */
  function openDlg(d) { if (!d) return; if (d.showModal) { if (!d.open) d.showModal(); } else d.setAttribute("open", ""); }
  function closeDlg(d) { if (!d) return; if (d.close) d.close(); else d.removeAttribute("open"); }
  $$("dialog").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target === d) closeDlg(d); });
    $$("[data-close]", d).forEach(function (b) { b.addEventListener("click", function () { closeDlg(d); }); });
  });

  /* =================================================================
     HANDMADE BAG (all pages). Items live in localStorage "rk-bag".
     ================================================================= */
  var bag = store("rk-bag") || [];
  var drawer = $("#bag");
  function bagCount() { return bag.reduce(function (n, i) { return n + i.qty; }, 0); }
  function bagTotal() { return bag.reduce(function (n, i) { return n + i.qty * i.price; }, 0); }
  function saveBag() { store("rk-bag", bag); renderBag(); }
  function product(el) {
    var p = el.closest("[data-product]"); if (!p) return null;
    return { id: p.dataset.id, name: p.dataset.name, price: +p.dataset.price, img: p.dataset.img, cat: p.dataset.catLabel || "", spec: p.dataset.spec || "", one: p.dataset.one === "1" };
  }
  function addToBag(p, btn) {
    var have = bag.filter(function (i) { return i.id === p.id; })[0];
    if (have) { if (!p.one) have.qty++; } else bag.push({ id: p.id, name: p.name, price: p.price, img: p.img, cat: p.cat, one: p.one, qty: 1 });
    saveBag();
    $$("[data-bag-count]").forEach(function (c) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); });
    if (btn) { btn.classList.add("done"); var old = btn.innerHTML; btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span>Added</span>'; setTimeout(function () { btn.classList.remove("done"); btn.innerHTML = old; }, 1600); }
    say('<img src="' + esc(ROOT + p.img) + '" alt="">' + esc(p.name) + ' is in your bag <a href="#" data-open-bag>View bag</a>');
  }
  function renderBag() {
    $$("[data-bag-count]").forEach(function (c) { var n = bagCount(); c.textContent = n; c.setAttribute("data-n", n); });
    if (!drawer) return;
    var list = $(".bag-list", drawer), foot = $(".df", drawer), empty = $(".bag-empty", drawer);
    empty.hidden = bag.length > 0; foot.hidden = bag.length === 0; list.hidden = bag.length === 0;
    list.innerHTML = bag.map(function (i, ix) {
      return '<div class="bag-item"><img src="' + esc(ROOT + i.img) + '" alt=""><div><b>' + esc(i.name) + '</b><small>' + esc(i.cat) + (i.one ? " · one of a kind" : "") + '</small>' +
        (i.one ? "" : '<div class="qty"><button type="button" data-q="-1" data-i="' + ix + '" aria-label="One less">−</button><output>' + i.qty + '</output><button type="button" data-q="1" data-i="' + ix + '" aria-label="One more">+</button></div>') +
        '</div><div style="text-align:right"><span class="price">' + money(i.price * i.qty) + '</span><br><button type="button" class="link-btn" data-rm="' + ix + '">Remove</button></div></div>';
    }).join("");
    $$("[data-bag-total]").forEach(function (t) { t.textContent = money(bagTotal()); });
  }
  if (drawer) {
    drawer.addEventListener("click", function (e) {
      var q = e.target.closest("[data-q]"), r = e.target.closest("[data-rm]");
      if (q) { var i = bag[+q.dataset.i]; i.qty += +q.dataset.q; if (i.qty < 1) bag.splice(+q.dataset.i, 1); saveBag(); }
      if (r) { bag.splice(+r.dataset.rm, 1); saveBag(); }
    });
    var bagForm = $("#bag-form");
    if (bagForm) bagForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(bagForm)) return;
      var f = new FormData(bagForm), id = ref("RK");
      var lines = ["Hello Ritu, I'd like to order from your handmade collection.", "", "Order " + id];
      bag.forEach(function (i) { lines.push("• " + i.name + (i.qty > 1 ? " × " + i.qty : "") + " — " + money(i.price * i.qty)); });
      lines.push("Items total: " + money(bagTotal()));
      lines.push("", (f.get("ship") === "courier" ? "Delivery: courier within New Zealand (please quote postage) to " + (f.get("town") || "—") : "Delivery: I'll pick up in " + PICKUP_AREA));
      lines.push("Name: " + f.get("name"), "Phone: " + f.get("phone"));
      if (f.get("note")) lines.push("Note: " + f.get("note"));
      closeDlg(drawer);
      sendFlow({ title: "Send your order to Ritu", subject: "Handmade order " + id, body: lines.join(NL), pay: true, after: "bag" });
    });
  }
  document.addEventListener("click", function (e) {
    var ob = e.target.closest("[data-open-bag]"); if (ob) { e.preventDefault(); toast.classList.remove("show"); renderBag(); openDlg(drawer); return; }
    var ad = e.target.closest("[data-add]"); if (ad) { e.preventDefault(); var p = product(ad); if (p) addToBag(p, ad.classList.contains("add") ? ad : null); return; }
    var qv = e.target.closest("[data-quick]"); if (qv) { e.preventDefault(); quickView(qv.closest("[data-product]")); }
  });
  renderBag();

  /* ---------- Quick view ---------- */
  var qd = $("#quick");
  function quickView(p) {
    if (!qd || !p) return;
    var d = p.dataset, art = d.cat === "paintings";
    $(".qv", qd).classList.toggle("art", art);
    $(".qimg img", qd).src = ROOT + d.img; $(".qimg img", qd).alt = d.alt || d.name;
    $(".qcat", qd).textContent = d.catLabel; $("h2", qd).textContent = d.name;
    $(".qtxt .price", qd).innerHTML = "<small>" + CURRENCY.replace("$", "") + "</small>$" + (+d.price).toLocaleString("en-NZ");
    $(".qdesc", qd).textContent = d.desc || "";
    $(".qspec", qd).innerHTML = (d.spec ? "<dt>Details</dt><dd>" + esc(d.spec) + "</dd>" : "") + "<dt>Made</dt><dd>" + (d.one === "1" ? "One of a kind — once it's gone, it's gone" : "By hand, to order — usually 1 to 3 weeks") + "</dd><dt>Delivery</dt><dd>Pick up in " + esc(PICKUP_AREA) + ", or courier within New Zealand</dd>";
    var add = $("[data-add]", qd); add.closest("[data-product]").dataset.id = d.id;
    ["id", "name", "price", "img", "catLabel", "spec", "one"].forEach(function (k) { add.closest("[data-product]").dataset[k] = d[k] || ""; });
    $("[data-ask]", qd).href = ROOT + "contact/?about=" + encodeURIComponent("A question about: " + d.name);
    openDlg(qd);
  }
  if (qd) $("[data-add]", qd).addEventListener("click", function () { setTimeout(function () { closeDlg(qd); }, 250); });

  /* ---------- Shop filters ---------- */
  var chips = $$(".filters .chip[data-filter]");
  if (chips.length) {
    var cards = $$(".products .pcard");
    var setF = function (f, push) {
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c.dataset.filter === f ? "true" : "false"); });
      cards.forEach(function (c) { c.hidden = !(f === "all" || c.dataset.cat === f); });
      if (push) history.replaceState(null, "", f === "all" ? location.pathname : "#" + f);
    };
    chips.forEach(function (c) { c.addEventListener("click", function () { setF(c.dataset.filter, true); }); });
    var h = location.hash.replace("#", "");
    if (h && chips.some(function (c) { return c.dataset.filter === h; })) { setF(h, false); }
  }

  /* =================================================================
     KITCHEN ORDER (kitchen page). Lives in localStorage "rk-food".
     ================================================================= */
  var kitchen = $("#order-builder");
  var food = store("rk-food") || {};   /* { id: {name, price, qty, unit, kind} } */
  function foodTotal() { var t = 0; Object.keys(food).forEach(function (k) { t += food[k].price * food[k].qty; }); return t; }
  function foodCount() { return Object.keys(food).length; }
  function saveFood() { store("rk-food", food); renderFood(); }
  function renderFood() {
    if (!kitchen) return;
    $$("[data-dish]").forEach(function (m) {
      var it = food[m.dataset.id], q = it ? it.qty : 0;
      m.classList.toggle("on", q > 0);
      var out = $("output", m); if (out) out.textContent = q;
      var a = $(".add", m), s = $(".qty", m);
      if (a) a.hidden = q > 0; if (s) s.hidden = q === 0;
    });
    $$("[data-package]").forEach(function (p) {
      var it = food[p.dataset.id], b = $("[data-pk-add]", p);
      if (b) b.innerHTML = it ? "Added · " + it.qty + " guests" : "Add to order";
      if (b) b.classList.toggle("btn-berry", !it), b.classList.toggle("btn-line", !!it);
    });
    var lines = $(".lines", kitchen), keys = Object.keys(food);
    lines.innerHTML = keys.length ? keys.map(function (k) {
      var i = food[k];
      return "<li><span>" + esc(i.name) + "</span><b>" + money(i.price * i.qty) + "</b><small>" + (i.kind === "pk" ? i.qty + " guests × " + money(i.price) + " per head" : i.qty + " × " + esc(i.unit) + " @ " + money(i.price)) + '</small><button type="button" class="rm" data-frm="' + esc(k) + '">Remove</button></li>';
    }).join("") : '<li class="empty">Your order is empty. Add dishes or a party menu to begin.</li>';
    var t = foodTotal();
    $$("[data-food-total]").forEach(function (el) { el.textContent = money(t); });
    $$("[data-food-count]").forEach(function (el) { el.textContent = foodCount() === 1 ? "1 item" : foodCount() + " items"; });
    var short = MIN_FOOD && t > 0 && t < MIN_FOOD;
    $$("[data-food-short]").forEach(function (el) { el.hidden = !short; if (short) el.textContent = "Add " + money(MIN_FOOD - t) + " more to reach the " + money(MIN_FOOD) + " minimum."; });
    var ob = $(".obar"); if (ob) { ob.classList.toggle("show", keys.length > 0); document.body.classList.toggle("has-obar", keys.length > 0); }
    var w = $(".wa"); if (w) w.classList.toggle("lift", keys.length > 0);
  }
  if (kitchen) {
    $$("[data-dish]").forEach(function (m) {
      var d = m.dataset;
      m.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        var cur = food[d.id];
        if (b.classList.contains("add")) food[d.id] = { name: d.name, price: +d.price, unit: d.unit, qty: 1, kind: "dish" };
        else if (b.dataset.step) { if (!cur) return; cur.qty += +b.dataset.step; if (cur.qty < 1) delete food[d.id]; }
        else return;
        saveFood();
      });
    });
    $$("[data-package]").forEach(function (p) {
      var d = p.dataset, inp = $("input", p), b = $("[data-pk-add]", p);
      if (food[d.id] && inp) inp.value = food[d.id].qty;
      b.addEventListener("click", function () {
        var g = Math.max(+d.min, parseInt(inp.value, 10) || +d.min); inp.value = g;
        food[d.id] = { name: d.name + " (party menu)", price: +d.price, unit: "guest", qty: g, kind: "pk" };
        saveFood(); say(esc(d.name) + " added for " + g + ' guests <a href="#order">Review order</a>');
      });
      if (inp) inp.addEventListener("change", function () { if (food[d.id]) { food[d.id].qty = Math.max(+d.min, parseInt(inp.value, 10) || +d.min); inp.value = food[d.id].qty; saveFood(); } });
    });
    kitchen.addEventListener("click", function (e) { var r = e.target.closest("[data-frm]"); if (r) { delete food[r.dataset.frm]; saveFood(); } });

    /* cuisine tabs: jump + highlight */
    var tabs = $$(".tabs .chip");
    tabs.forEach(function (t) { t.addEventListener("click", function () { var s = $(t.dataset.target); if (s) s.scrollIntoView({ behavior: "smooth", block: "start" }); }); });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) tabs.forEach(function (t) { t.setAttribute("aria-selected", t.dataset.target === "#" + en.target.id ? "true" : "false"); }); }); }, { rootMargin: "-160px 0px -60% 0px" });
      $$(".cuisine-h").forEach(function (h) { io.observe(h); });
    }

    /* pickup date: earliest = today + LEAD_DAYS */
    var dt = $("#k-date");
    if (dt) { var m = new Date(); m.setDate(m.getDate() + LEAD_DAYS); dt.min = m.toISOString().slice(0, 10); }
    var kf = $("#food-form");
    kf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!foodCount()) { say("Add a dish or a party menu first"); $("#menu").scrollIntoView({ behavior: "smooth" }); return; }
      if (MIN_FOOD && foodTotal() < MIN_FOOD) { say("Orders start at " + money(MIN_FOOD)); return; }
      if (!validate(kf)) return;
      var f = new FormData(kf), id = ref("RKF");
      var when = new Date(f.get("date") + "T12:00:00");
      var lines = ["Hello Ritu, I'd like to place a food order.", "", "Order " + id];
      Object.keys(food).forEach(function (k) { var i = food[k]; lines.push("• " + i.name + " — " + (i.kind === "pk" ? i.qty + " guests" : i.qty + " × " + i.unit) + " — " + money(i.price * i.qty)); });
      lines.push("Estimated total: " + money(foodTotal()), "");
      lines.push("Pickup: " + when.toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + ", " + f.get("time"));
      lines.push("Number of guests: " + (f.get("guests") || "—"));
      lines.push("Name: " + f.get("name"), "Phone: " + f.get("phone"));
      if (f.get("diet")) lines.push("Allergies / dietary needs: " + f.get("diet"));
      if (f.get("note")) lines.push("Note: " + f.get("note"));
      sendFlow({ title: "Send your food order to Ritu", subject: "Food order " + id + " for " + f.get("date"), body: lines.join(NL), pay: true, after: "food" });
    });
  }
  renderFood();

  /* ---------- Contact form ---------- */
  var cf = $("#contact-form");
  if (cf) {
    var about = new URLSearchParams(location.search).get("about");
    if (about) { var ta = $("textarea", cf); ta.value = about + NL + NL; }
    cf.addEventListener("submit", function (e) {
      e.preventDefault(); if (!validate(cf)) return;
      var f = new FormData(cf);
      var body = ["Hello Ritu,", "", f.get("message"), "", "— " + f.get("name"), f.get("phone") ? "Phone: " + f.get("phone") : "", f.get("topic") ? "About: " + f.get("topic") : ""].filter(function (x, i) { return x !== "" || i < 3; }).join(NL);
      sendFlow({ title: "Send your message", subject: "Message from " + f.get("name") + " (" + (f.get("topic") || "website") + ")", body: body, pay: false });
    });
  }

  /* ---------- Validation (polite, inline) ---------- */
  function validate(form) {
    var ok = true;
    $$("[required]", form).forEach(function (inp) {
      var fld = inp.closest(".field"), good = inp.value.trim() !== "" && (!inp.min || inp.type !== "date" || inp.value >= inp.min);
      if (inp.type === "tel" && good) good = inp.value.replace(/\D/g, "").length >= 7;
      if (fld) fld.classList.toggle("bad", !good);
      if (!good && ok) { inp.focus(); ok = false; }
    });
    return ok;
  }

  /* ---------- Send flow: WhatsApp / email / form / copy ---------- */
  var sd = $("#send");
  function sendFlow(o) {
    if (!sd) return;
    $("h2", sd).textContent = o.title;
    $(".msg-box", sd).textContent = o.body;
    var wa = $("[data-send=whatsapp]", sd), em = $("[data-send=email]", sd), fm = $("[data-send=form]", sd);
    wa.hidden = !WHATSAPP; em.hidden = !EMAIL; fm.hidden = !FORM_URL;
    wa.target = "_blank"; wa.rel = "noopener";
    if (WHATSAPP) wa.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(o.body);
    if (EMAIL) em.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(o.subject) + "&body=" + encodeURIComponent(o.body);
    if (FORM_URL) fm.href = FORM_URL;
    $("[data-soon]", sd).hidden = anyChannel;
    var pay = $("[data-paybox]", sd); pay.hidden = !o.pay;
    sd.dataset.after = o.after || "";
    openDlg(sd);
  }
  if (sd) {
    $("[data-copy]", sd).addEventListener("click", function () {
      var t = $(".msg-box", sd).textContent, b = this;
      var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy order details"; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () {}); else { var r = document.createRange(); r.selectNodeContents($(".msg-box", sd)); getSelection().removeAllRanges(); getSelection().addRange(r); }
    });
    $$("[data-send]", sd).forEach(function (a) {
      if (/^https?:/.test(a.getAttribute("href") || "")) { a.target = "_blank"; a.rel = "noopener"; }
      a.addEventListener("click", function () {
        var after = sd.dataset.after;
        setTimeout(function () {
          closeDlg(sd);
          if (after === "bag") { bag = []; saveBag(); }
          if (after === "food") { food = {}; saveFood(); }
          say("Thank you! Ritu will reply to confirm.");
        }, 600);
      });
    });
  }
})();
