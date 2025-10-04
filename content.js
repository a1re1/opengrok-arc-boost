// OpenGrok Modern Boost - Chrome Extension Content Script
(() => {
  "use strict";

  // Only run on xref pages (file or directory views)
  if (!/^\/xref\//.test(location.pathname)) return;

  const BRAND =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--brand")
      .trim() || "#0b61ff";

  // Optional: override mapping manually
  // window.OPEN_GITHUB_MAP = {
  //   "chore-e-ography": "https://github.com/a1re1/chore-e-ography",
  //   "cookbuk": "https://github.com/cookb-uk/cookbuk",
  // };
  const USER_MAP = window.OPEN_GITHUB_MAP || {};

  // Extract project and relative path from /xref/{project}/{...}
  function getProjectAndRelPath() {
    const m = location.pathname.match(/^\/xref\/([^/]+)\/?(.*)$/);
    if (!m) return null;
    return {
      project: decodeURIComponent(m[1]),
      relPath: decodeURIComponent(m[2] || ""),
    };
  }

  // View type detection
  function isFileView() {
    return !!document.querySelector("#src pre");
  }
  function isDirView() {
    return !!document.querySelector("#dirlist");
  }

  // When a file view has a specific revision, it's shown as:
  // "... (revision <sha>)" in the masthead
  function getRevisionSha() {
    const txt =
      (document.querySelector("#Masthead") || document.body).textContent || "";
    const m = txt.match(/\(revision\s+([a-f0-9]{7,40})\)/i);
    return m ? m[1] : null;
  }

  // Extract GitHub-style line anchor from OpenGrok hash:
  // Supports "#20", "#20-30", "#L20", "#L20-L30"
  function getGithubLineAnchor() {
    let h = (location.hash || "").replace(/^#/, "");
    if (!h) return "";

    const m = h.match(/^L?(\d+)(?:-L?(\d+))?$/i);
    if (!m) return "";
    const start = m[1];
    const end = m[2];
    return end ? `#L${start}-L${end}` : `#L${start}`;
  }

  // Cache GitHub remote info in localStorage for 24h
  async function getRepoInfo(project) {
    if (USER_MAP[project]) {
      return { base: USER_MAP[project].replace(/\.git$/, ""), branch: "main" };
    }

    const CACHE_KEY = `ghRepoInfo:${project}`;
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached && Date.now() - cached.ts < 24 * 3600 * 1000) return cached;
    } catch (_) {}

    let base = null;
    let branch = "main";

    try {
      const res = await fetch("/", { credentials: "same-origin" });
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      // Try both modern/legacy home tables
      const rows = [
        ...doc.querySelectorAll(
          'table[aria-label*="repositories"] tbody tr, .panel-body table tbody tr'
        ),
      ];
      for (const row of rows) {
        const nameAnchor = row.querySelector("td.name.repository a");
        const name =
          (nameAnchor &&
            nameAnchor.textContent &&
            nameAnchor.textContent.trim()) ||
          "";
        if (name !== project) continue;

        const remoteAnchor = row.querySelector('td a[rel="noreferrer"]');
        if (remoteAnchor) {
          base = remoteAnchor.getAttribute("href").replace(/\.git$/, "");
        }

        const text = row.textContent || "";
        const b = text.match(/\(([^)]+)\)/);
        if (b && b[1]) branch = b[1].trim();
        break;
      }
    } catch (_) {
      // ignore network/parse errors
    }

    if (!base) base = `https://github.com/${project}/${project}`;

    const info = { base, branch, ts: Date.now() };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(info));
    } catch (_) {}
    return info;
  }

  function buildGithubUrl(info, relPath, isFile, rev, lineAnchor = "") {
    const ref = rev || info.branch || "main";
    const type = isFile ? "blob" : "tree";
    relPath = (relPath || "").replace(/^\/+/, "");

    const baseUrl = !relPath
      ? `${info.base}/${type}/${encodeURIComponent(ref)}`
      : `${info.base}/${type}/${encodeURIComponent(ref)}/${relPath
          .split("/")
          .map(encodeURIComponent)
          .join("/")}`;

    // Only add line anchors for files
    return isFile && lineAnchor ? baseUrl + lineAnchor : baseUrl;
  }

  function injectFloatingButton(url) {
    if (document.getElementById("og-github-launcher")) return;

    const a = document.createElement("a");
    a.id = "og-github-launcher";
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.title = "Open in GitHub";
    a.textContent = "GitHub";
    a.style.cssText = `
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 9999;
        background: ${BRAND};
        color: #fff;
        text-decoration: none;
        padding: 10px 12px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 12px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.15);
        letter-spacing: .2px;
      `;

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("width", "16");
    icon.setAttribute("height", "16");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "2");
    icon.setAttribute("stroke-linecap", "round");
    icon.setAttribute("stroke-linejoin", "round");
    icon.style.marginLeft = "8px";
    const path1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    path1.setAttribute(
      "d",
      "M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
    );
    const path2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline"
    );
    path2.setAttribute("points", "15 3 21 3 21 9");
    const path3 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    path3.setAttribute("x1", "10");
    path3.setAttribute("y1", "14");
    path3.setAttribute("x2", "21");
    path3.setAttribute("y2", "3");
    icon.appendChild(path1);
    icon.appendChild(path2);
    icon.appendChild(path3);
    a.appendChild(icon);

    document.body.appendChild(a);
  }

  // Optional top-nav link, next to Download
  function injectTopNavLink(url) {
    const ul = document.querySelector("#bar ul");
    if (!ul) return;
    if (
      ul.querySelector(
        'li a[href^="https://github.com"], li a[href^="http://github.com"]'
      )
    )
      return;

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "GitHub";
    li.appendChild(a);
    const searchLi = ul.querySelector("li input#search")?.parentElement;
    ul.insertBefore(li, searchLi || null);
  }

  async function run() {
    const ctx = getProjectAndRelPath();
    if (!ctx) return;

    const fileView = isFileView();
    const dirView = isDirView();
    if (!fileView && !dirView) return;

    const rev = getRevisionSha();
    const lineAnchor = fileView ? getGithubLineAnchor() : "";
    const repo = await getRepoInfo(ctx.project);
    const url = buildGithubUrl(repo, ctx.relPath, fileView, rev, lineAnchor);

    injectFloatingButton(url);
    // Uncomment to also add a top-bar GitHub link:
    // injectTopNavLink(url);

    // Keyboard shortcut: g opens GitHub
    document.addEventListener("keydown", (e) => {
      if (
        e.key.toLowerCase() === "g" &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        window.open(url, "_blank", "noopener");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();