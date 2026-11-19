/* Kudjoba Solutions — site interactions (no dependencies) */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var config = window.KUDJOBA_CONFIG || {};

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ---------- Year ---------- */
  $all("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Theme toggle ---------- */
  var themeBtn = $("[data-theme-toggle]");
  function syncThemeButton() {
    if (!themeBtn) return;
    var dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#0B1220");
  }
  if (themeBtn) {
    syncThemeButton();
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("kudjoba-theme", next); } catch (e) { /* storage unavailable */ }
      syncThemeButton();
    });
  }

  /* ---------- Sticky header state ---------- */
  var header = $(".site-header");
  var backToTop = $("[data-back-to-top]");
  if (backToTop) backToTop.hidden = false;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (backToTop) backToTop.classList.toggle("is-visible", y > 700);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
      var brand = $(".site-header .brand");
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = $all("[data-nav]");
  var sectionIds = ["home", "about", "services", "projects", "approach", "contact"];
  var sections = sectionIds.map(function (id) { return doc.getElementById(id); }).filter(Boolean);
  function setActive(id) {
    navLinks.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window && sections.length) {
    var visible = {};
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      var best = null, bestRatio = 0;
      sectionIds.forEach(function (id) {
        if (visible[id] > bestRatio) { bestRatio = visible[id]; best = id; }
      });
      if (best) setActive(best);
    }, { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.01, 0.25, 0.5, 1] });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Mobile drawer ---------- */
  var drawer = $("#mobile-drawer");
  var openBtn = $("[data-menu-open]");
  var lastFocus = null;
  function focusables(el) {
    return $all('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', el)
      .filter(function (n) { return n.offsetParent !== null; });
  }
  function openDrawer() {
    if (!drawer) return;
    lastFocus = doc.activeElement;
    drawer.hidden = false;
    doc.body.classList.add("no-scroll");
    openBtn.setAttribute("aria-expanded", "true");
    // next frame so the transition runs
    window.requestAnimationFrame(function () {
      drawer.classList.add("is-open");
      var f = focusables(drawer);
      if (f.length) f[0].focus();
    });
  }
  function closeDrawer(restoreFocus) {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove("is-open");
    doc.body.classList.remove("no-scroll");
    openBtn.setAttribute("aria-expanded", "false");
    var finish = function () { drawer.hidden = true; };
    if (reduceMotion.matches) finish(); else window.setTimeout(finish, 280);
    if (restoreFocus !== false && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (drawer && openBtn) {
    openBtn.addEventListener("click", openDrawer);
    $all("[data-menu-close]", drawer).forEach(function (b) { b.addEventListener("click", function () { closeDrawer(); }); });
    $all("a", drawer).forEach(function (a) { a.addEventListener("click", function () { closeDrawer(false); }); });
    drawer.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); closeDrawer(); return; }
      if (e.key !== "Tab") return;
      var f = focusables(drawer);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth >= 1024) closeDrawer(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $all(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion.matches) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); revealObserver.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Hero map animation pause ---------- */
  var mapSvg = $(".map-svg");
  var mapBtn = $("[data-map-pause]");
  function setMapPaused(paused) {
    if (!mapSvg || typeof mapSvg.pauseAnimations !== "function") return;
    if (paused) mapSvg.pauseAnimations(); else mapSvg.unpauseAnimations();
    if (mapBtn) {
      mapBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      mapBtn.textContent = paused ? "Play animation" : "Pause animation";
    }
  }
  if (mapSvg && typeof mapSvg.pauseAnimations === "function") {
    if (reduceMotion.matches) {
      try { mapSvg.setCurrentTime(4.5); } catch (e) { /* ignore */ }
      setMapPaused(true);
    }
    if (mapBtn) mapBtn.addEventListener("click", function () {
      setMapPaused(mapBtn.getAttribute("aria-pressed") !== "true");
    });
  } else if (mapBtn) {
    mapBtn.hidden = true;
  }

  /* ---------- Service "learn more" ---------- */
  $all("[data-toggle-more]").forEach(function (btn) {
    var panel = doc.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      btn.textContent = open ? "Learn more" : "Show less";
      panel.hidden = open;
    });
  });

  /* ---------- "Discuss this service" preselects the form ---------- */
  var serviceSelect = $("#f-service");
  $all("[data-service]").forEach(function (link) {
    link.addEventListener("click", function () {
      if (!serviceSelect) return;
      var wanted = link.getAttribute("data-service");
      $all("option", serviceSelect).forEach(function (o) { if (o.textContent.trim() === wanted) serviceSelect.value = o.value || o.textContent; });
      clearFieldError(serviceSelect);
      window.setTimeout(function () { var n = $("#f-name"); if (n) n.focus({ preventScroll: true }); }, reduceMotion.matches ? 0 : 500);
    });
  });

  /* ---------- Project dialogs ---------- */
  $all("[data-dialog-open]").forEach(function (btn) {
    var dlg = doc.getElementById(btn.getAttribute("data-dialog-open"));
    if (!dlg) return;
    btn.setAttribute("aria-haspopup", "dialog");
    btn.addEventListener("click", function () {
      if (typeof dlg.showModal === "function") {
        dlg.showModal();
        doc.body.classList.add("no-scroll");
      } else {
        dlg.setAttribute("open", "");
      }
    });
  });
  $all("dialog.modal").forEach(function (dlg) {
    $all("[data-dialog-close]", dlg).forEach(function (b) { b.addEventListener("click", function () { dlg.close(); }); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); }); // backdrop click
    dlg.addEventListener("close", function () { doc.body.classList.remove("no-scroll"); });
  });

  /* ---------- Approach tabs (WAI-ARIA tabs pattern) ---------- */
  var tablist = $(".process-tabs");
  if (tablist) {
    var tabs = $all('[role="tab"]', tablist);
    function selectTab(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var p = doc.getElementById(t.getAttribute("aria-controls"));
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { selectTab(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var idx = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") idx = (i + 1) % tabs.length;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") idx = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") idx = 0;
        else if (e.key === "End") idx = tabs.length - 1;
        if (idx !== null) { e.preventDefault(); selectTab(tabs[idx], true); }
      });
    });
  }

  /* ---------- Enquiry form ---------- */
  var form = $("#enquiry-form");
  var summary = $("#form-summary");
  var statusBox = $("#form-status");
  var submitBtn = form ? $("[data-submit]", form) : null;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var rules = {
    name: function (v) { return v.trim().length < 2 ? "Enter your full name." : ""; },
    email: function (v) {
      if (!v.trim()) return "Enter your email address.";
      return EMAIL_RE.test(v.trim()) ? "" : "Enter an email address in the format name@example.com.";
    },
    service: function (v) { return v ? "" : "Select the service you are interested in."; },
    message: function (v) {
      var n = v.trim().length;
      if (!n) return "Describe your project.";
      return n < 20 ? "Add a little more detail (at least 20 characters)." : "";
    }
  };

  function errorEl(field) { return doc.getElementById(field.id + "-err"); }
  function setFieldError(field, msg) {
    var el = errorEl(field);
    if (el) el.textContent = msg;
    field.setAttribute("aria-invalid", msg ? "true" : "false");
  }
  function clearFieldError(field) { if (field && errorEl(field)) setFieldError(field, ""); }
  function validateField(field) {
    var rule = rules[field.name];
    if (!rule) return "";
    var msg = rule(field.value);
    setFieldError(field, msg);
    return msg;
  }

  function setStatus(kind, title, text, extra) {
    if (!statusBox) return;
    statusBox.className = "form-status" + (kind ? " is-" + kind : "");
    statusBox.innerHTML = "";
    if (!kind) return;
    var strong = doc.createElement("strong"); strong.textContent = title; statusBox.appendChild(strong);
    var p = doc.createElement("p"); p.textContent = text; statusBox.appendChild(p);
    if (extra) statusBox.appendChild(extra);
  }
  function fallbackLink() {
    if (!config.fallbackEmail) return null;
    var p = doc.createElement("p");
    var a = doc.createElement("a");
    a.href = "mailto:" + config.fallbackEmail + "?subject=" + encodeURIComponent("Business enquiry");
    a.textContent = "Email us at " + config.fallbackEmail;
    p.appendChild(a);
    return p;
  }
  function setLoading(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.classList.toggle("is-loading", on);
    form.setAttribute("aria-busy", on ? "true" : "false");
    var label = $(".btn-label", submitBtn);
    if (label) label.textContent = on ? "Sending…" : "Submit enquiry";
  }

  if (form) {
    var fields = $all("[name]", form).filter(function (f) { return rules[f.name]; });
    fields.forEach(function (f) {
      f.addEventListener("blur", function () { if (f.value || f.getAttribute("aria-invalid") === "true") validateField(f); });
      f.addEventListener("input", function () { if (f.getAttribute("aria-invalid") === "true") validateField(f); });
      f.addEventListener("change", function () { if (f.tagName === "SELECT") validateField(f); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus(null);

      var errors = [];
      fields.forEach(function (f) { var m = validateField(f); if (m) errors.push({ field: f, msg: m }); });

      if (errors.length) {
        summary.hidden = false;
        summary.innerHTML = "";
        var p = doc.createElement("p");
        p.textContent = errors.length === 1 ? "There is 1 problem with your enquiry" : "There are " + errors.length + " problems with your enquiry";
        var ul = doc.createElement("ul");
        errors.forEach(function (er) {
          var li = doc.createElement("li"); var a = doc.createElement("a");
          a.href = "#" + er.field.id; a.textContent = er.msg;
          a.addEventListener("click", function (ev) { ev.preventDefault(); er.field.focus(); });
          li.appendChild(a); ul.appendChild(li);
        });
        summary.appendChild(p); summary.appendChild(ul);
        summary.focus();
        return;
      }
      summary.hidden = true;

      // Honeypot filled: silently stop (likely a bot).
      var hp = form.elements["_gotcha"];
      if (hp && hp.value) { form.reset(); return; }

      if (!config.formEndpoint) {
        setStatus("info", "Online enquiries are not active yet",
          "Your enquiry has not been sent because this website's form service has not been connected. Your details are still in the form, so nothing is lost.",
          fallbackLink());
        return;
      }

      setLoading(true);
      var data = new FormData(form);
      data.append("_subject", "New enquiry: " + (data.get("service") || "General"));

      fetch(config.formEndpoint, { method: "POST", body: data, headers: { "Accept": "application/json" } })
        .then(function (res) {
          if (!res.ok) {
            return res.json().catch(function () { return {}; }).then(function (body) {
              var msg = body && body.errors && body.errors.length ? body.errors.map(function (x) { return x.message; }).join(" ") : "";
              throw new Error(msg || ("Request failed (" + res.status + ")"));
            });
          }
          form.reset();
          fields.forEach(clearFieldError);
          setStatus("success", "Thank you, your enquiry has been sent",
            "We have received your details and will be in touch to arrange a conversation.");
          statusBox.setAttribute("tabindex", "-1");
          statusBox.focus();
        })
        .catch(function (err) {
          var retry = doc.createElement("button");
          retry.type = "submit"; retry.className = "btn btn-secondary btn-sm"; retry.textContent = "Try again";
          var wrap = doc.createElement("div"); wrap.appendChild(retry);
          var fb = fallbackLink(); if (fb) wrap.appendChild(fb);
          setStatus("error", "Your enquiry could not be sent",
            "Please check your connection and try again. Your details are still in the form." + (err && err.message ? " (" + err.message + ")" : ""), wrap);
        })
        .then(function () { setLoading(false); });
    });
  }
})();
