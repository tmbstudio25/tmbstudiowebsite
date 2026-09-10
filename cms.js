/* ============================================================
   TMB STUDIO — cms.js
   Applies content.json (the published content) to any element
   marked with a data-cms-* attribute. If this browser has local
   preview edits saved from admin.html, those are layered on top
   so the person editing can see changes before publishing.
   ============================================================ */
(function () {
  const CMS_KEY = "tmb_cms_content";

  function getPath(obj, path) {
    return path
      .split(".")
      .reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }

  function isPlainObject(v) {
    return v && typeof v === "object" && !Array.isArray(v);
  }

  function deepMerge(base, override) {
    if (!isPlainObject(override)) return override;
    const out = isPlainObject(base) ? { ...base } : {};
    Object.keys(override).forEach((k) => {
      out[k] =
        isPlainObject(override[k]) && isPlainObject(base && base[k])
          ? deepMerge(base[k], override[k])
          : override[k];
    });
    return out;
  }

  function applyContent(content) {
    if (!content) return;

    document.querySelectorAll("[data-cms-text]").forEach((el) => {
      const val = getPath(content, el.getAttribute("data-cms-text"));
      if (val !== undefined) el.textContent = val;
    });

    document.querySelectorAll("[data-cms-html]").forEach((el) => {
      const val = getPath(content, el.getAttribute("data-cms-html"));
      if (val !== undefined) el.innerHTML = val;
    });

    document.querySelectorAll("[data-cms-src]").forEach((el) => {
      const val = getPath(content, el.getAttribute("data-cms-src"));
      if (val !== undefined) {
        el.setAttribute("src", val);
        if (el.tagName === "SOURCE") {
          const media = el.closest("video, audio");
          if (media && media.load) media.load();
        }
      }
    });

    document.querySelectorAll("[data-cms-bg]").forEach((el) => {
      const val = getPath(content, el.getAttribute("data-cms-bg"));
      if (val !== undefined) el.style.backgroundImage = `url("${val}")`;
    });

    document.querySelectorAll("[data-cms-href]").forEach((el) => {
      const val = getPath(content, el.getAttribute("data-cms-href"));
      if (val !== undefined) el.setAttribute("href", val);
    });

    window.__tmbContent = content;
    document.dispatchEvent(new CustomEvent("tmb-content-applied", { detail: content }));
  }

  async function loadContent() {
    let published = null;
    try {
      const res = await fetch("./content.json", { cache: "no-store" });
      if (res.ok) published = await res.json();
    } catch (e) {
      console.warn("CMS: could not load content.json", e);
    }

    let content = published || {};

    // Local, browser-only preview edits made in admin.html (not yet published)
    try {
      const raw = localStorage.getItem(CMS_KEY);
      if (raw) content = deepMerge(content, JSON.parse(raw));
    } catch (e) {
      console.warn("CMS: could not read local preview edits", e);
    }

    applyContent(content);
  }

  document.addEventListener("DOMContentLoaded", loadContent);

  // Exposed so admin.html can trigger a live re-render in a preview iframe/tab
  window.TMB_CMS = { loadContent, applyContent, deepMerge, getPath };
})();
