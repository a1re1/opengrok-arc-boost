// OpenGrok → highlight.js integration with theme picker
// Assumes highlight.js is already loaded globally
(() => {
  "use strict";

  console.log("🔍 Highlight.js integration starting...");

  // Check if we're on an xref page
  if (!/^\/xref\//.test(location.pathname)) {
    console.log("❌ Not on xref page, exiting");
    return;
  }

  const HLJS_VERSION = "11.9.0";
  const DEFAULT_THEME = "github-dark";

  // CDN for theme CSS files
  const THEME_CDN = (theme) =>
    `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${HLJS_VERSION}/styles/${theme}.min.css`;

  // Popular highlight.js themes
  const THEMES = [
    { name: "GitHub Dark", id: "github-dark" },
    { name: "GitHub Light", id: "github" },
    { name: "VS Code Dark", id: "vs2015" },
    { name: "Monokai", id: "monokai" },
    { name: "Dracula", id: "dracula" },
    { name: "Nord", id: "nord" },
    { name: "Atom One Dark", id: "atom-one-dark" },
    { name: "Atom One Light", id: "atom-one-light" },
    { name: "Tokyo Night Dark", id: "tokyo-night-dark" },
    { name: "Solarized Dark", id: "solarized-dark" },
    { name: "Solarized Light", id: "solarized-light" },
    { name: "Gruvbox Dark", id: "gruvbox-dark" },
    { name: "Gruvbox Light", id: "gruvbox-light" },
  ];

  // Settings management
  const Settings = {
    get: (key, defaultValue) => {
      try {
        const value = localStorage.getItem(`ogHighlight:${key}`);
        return value !== null ? JSON.parse(value) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(`ogHighlight:${key}`, JSON.stringify(value));
      } catch (e) {
        console.warn("Failed to save setting:", e);
      }
    },
  };

  // Wait for hljs to be available
  async function waitForHljs(maxWait = 5000) {
    const start = Date.now();
    while (!window.hljs) {
      if (Date.now() - start > maxWait) {
        throw new Error("highlight.js not found after waiting");
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log("✅ highlight.js detected");
  }

  function loadTheme(themeId) {
    console.log("Loading theme:", themeId);

    // Remove existing themes
    const existing = document.getElementById("hljs-theme");
    if (existing) existing.remove();

    // Load new theme CSS
    const link = document.createElement("link");
    link.id = "hljs-theme";
    link.rel = "stylesheet";
    link.href = THEME_CDN(themeId);

    link.onerror = () => {
      console.warn("Theme CSS failed to load:", themeId);
    };

    document.head.appendChild(link);
    Settings.set("theme", themeId);
  }

  function loadCustomTheme(css) {
    console.log("Loading custom theme");

    // Remove built-in theme
    const existing = document.getElementById("hljs-theme");
    if (existing) existing.remove();

    const customExisting = document.getElementById("hljs-custom-theme");
    if (customExisting) customExisting.remove();

    const style = document.createElement("style");
    style.id = "hljs-custom-theme";
    style.textContent = css;
    document.head.appendChild(style);

    Settings.set("customTheme", css);
    Settings.set("usingCustom", true);
  }

  // Check if this is a file view (not directory)
  function isFileView() {
    const pre = document.querySelector("#src pre");
    const dirlist = document.querySelector("#dirlist");
    return !!pre && !dirlist;
  }

  // Extract and prepare code for highlighting
  function extractCodeContent() {
    const pre = document.querySelector("#src pre");
    if (!pre) {
      console.warn("No #src pre found");
      return null;
    }

    console.log("Found code pre element");

    // OpenGrok wraps lines in <a> tags with line numbers
    const lines = Array.from(pre.querySelectorAll("a"));
    console.log("Found lines:", lines.length);

    if (lines.length === 0) {
      // Fallback: just get the text content
      const text = pre.textContent;
      console.log("No line anchors, using textContent");
      return {
        code: text,
        language: detectLanguage(),
        useFallback: true,
      };
    }

    const codeText = lines
      .map((line) => {
        // Remove line number span
        const clone = line.cloneNode(true);
        const lineNum = clone.querySelector(".l");
        if (lineNum) lineNum.remove();
        return clone.textContent;
      })
      .join("\n");

    console.log("Extracted code:", codeText.length, "chars");

    return {
      code: codeText,
      language: detectLanguage(),
      useFallback: false,
    };
  }

  function detectLanguage() {
    const pathMatch = location.pathname.match(/\.([^/.]+)$/);
    const ext = pathMatch ? pathMatch[1] : "";

    const langMap = {
      js: "javascript",
      ts: "typescript",
      jsx: "javascript",
      tsx: "typescript",
      py: "python",
      rb: "ruby",
      java: "java",
      cpp: "cpp",
      cc: "cpp",
      cxx: "cpp",
      c: "c",
      h: "c",
      hpp: "cpp",
      cs: "csharp",
      go: "go",
      rs: "rust",
      php: "php",
      sh: "bash",
      bash: "bash",
      zsh: "bash",
      yml: "yaml",
      yaml: "yaml",
      json: "json",
      xml: "xml",
      html: "xml",
      css: "css",
      scss: "scss",
      sass: "scss",
      less: "less",
      md: "markdown",
      sql: "sql",
      kt: "kotlin",
      swift: "swift",
      m: "objectivec",
      mm: "objectivec",
      scala: "scala",
      pl: "perl",
      r: "r",
      lua: "lua",
      vim: "vim",
    };

    const detected = langMap[ext.toLowerCase()] || "plaintext";
    console.log("Detected language:", detected, "from extension:", ext);
    return detected;
  }

  // Apply highlight.js to code
  async function applyHighlighting() {
    console.log("Applying highlighting...");

    if (!window.hljs) {
      console.error("highlight.js not available!");
      return;
    }

    const codeData = extractCodeContent();
    if (!codeData) {
      console.error("No code data extracted");
      return;
    }

    try {
      console.log("Highlighting with language:", codeData.language);

      // Highlight the code
      const result = window.hljs.highlight(codeData.code, {
        language: codeData.language,
        ignoreIllegals: true,
      });

      console.log("Highlighting complete");

      const highlightedLines = result.value.split("\n");
      const pre = document.querySelector("#src pre");

      if (codeData.useFallback) {
        pre.innerHTML = `<code class="hljs">${result.value}</code>`;
      } else {
        const lines = Array.from(pre.querySelectorAll("a"));

        lines.forEach((line, idx) => {
          if (idx >= highlightedLines.length) return;

          const lineNum = line.querySelector(".l");
          const lineNumText = lineNum ? lineNum.outerHTML : "";
          const lineId = line.getAttribute("name") || line.id;

          line.innerHTML = lineNumText + highlightedLines[idx];

          if (lineId && !line.id) line.id = lineId;
        });
      }

      pre.classList.add("hljs-applied");
      console.log("✅ Highlighting applied successfully");
    } catch (e) {
      console.error("❌ Highlighting failed:", e);
    }
  }

  // Create settings panel UI
  function createSettingsPanel() {
    if (document.getElementById("hljs-settings-panel")) return;

    const panel = document.createElement("div");
    panel.id = "hljs-settings-panel";
    panel.style.cssText = `
        position: fixed;
        right: 18px;
        bottom: 140px;
        width: 320px;
        max-height: 500px;
        background: white;
        border: 1px solid #d9e1ec;
        border-radius: 12px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: none;
        flex-direction: column;
        overflow: hidden;
      `;

    const currentTheme = Settings.get("theme", DEFAULT_THEME);
    const isCustom = Settings.get("usingCustom", false);

    panel.innerHTML = `
        <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            🎨 Syntax Theme
          </h3>
        </div>
        
        <div style="overflow-y: auto; flex: 1; padding: 12px;">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 12px; font-weight: 600; 
                          color: #6b7280; margin-bottom: 8px; text-transform: uppercase; 
                          letter-spacing: 0.05em;">
              Built-in Themes
            </label>
            <select id="hljs-theme-select" style="width: 100%; padding: 8px 12px; 
                    border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;
                    background: white; cursor: pointer;">
              ${THEMES.map(
                (t) =>
                  `<option value="${t.id}" ${
                    !isCustom && t.id === currentTheme ? "selected" : ""
                  }>${t.name}</option>`
              ).join("")}
            </select>
          </div>
  
          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 16px;">
            <label style="display: block; font-size: 12px; font-weight: 600; 
                          color: #6b7280; margin-bottom: 8px; text-transform: uppercase; 
                          letter-spacing: 0.05em;">
              Custom Theme CSS
            </label>
            <textarea id="hljs-custom-css" placeholder="Paste custom highlight.js theme CSS here..."
              style="width: 100%; height: 120px; padding: 8px; border: 1px solid #d1d5db; 
                     border-radius: 6px; font-family: 'SF Mono', Monaco, monospace; 
                     font-size: 12px; resize: vertical; background: #f9fafb;">${Settings.get(
                       "customTheme",
                       ""
                     )}</textarea>
            <button id="hljs-apply-custom" style="margin-top: 8px; width: 100%; 
                    padding: 8px 16px; background: #0b61ff; color: white; border: none; 
                    border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer;
                    transition: background 0.15s;">
              Apply Custom Theme
            </button>
          </div>
  
          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 16px;">
            <button id="hljs-reset" style="width: 100%; padding: 8px 16px; 
                    background: #f3f4f6; color: #6b7280; border: 1px solid #d1d5db; 
                    border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer;
                    transition: all 0.15s;">
              Reset to Default
            </button>
          </div>
        </div>
      `;

    document.body.appendChild(panel);

    // Event handlers
    document
      .getElementById("hljs-theme-select")
      .addEventListener("change", (e) => {
        Settings.set("usingCustom", false);
        loadTheme(e.target.value);
        if (window.hljs) applyHighlighting();
      });

    document
      .getElementById("hljs-apply-custom")
      .addEventListener("click", () => {
        const css = document.getElementById("hljs-custom-css").value.trim();
        if (css) {
          loadCustomTheme(css);
          if (window.hljs) applyHighlighting();
        }
      });

    document.getElementById("hljs-reset").addEventListener("click", () => {
      Settings.set("usingCustom", false);
      Settings.set("customTheme", "");
      document.getElementById("hljs-custom-css").value = "";
      document.getElementById("hljs-theme-select").value = DEFAULT_THEME;
      loadTheme(DEFAULT_THEME);
      if (window.hljs) applyHighlighting();
    });

    // Hover effects
    const applyBtn = document.getElementById("hljs-apply-custom");
    applyBtn.addEventListener("mouseenter", () => {
      applyBtn.style.background = "#084bcb";
    });
    applyBtn.addEventListener("mouseleave", () => {
      applyBtn.style.background = "#0b61ff";
    });

    const resetBtn = document.getElementById("hljs-reset");
    resetBtn.addEventListener("mouseenter", () => {
      resetBtn.style.background = "#e5e7eb";
      resetBtn.style.color = "#374151";
    });
    resetBtn.addEventListener("mouseleave", () => {
      resetBtn.style.background = "#f3f4f6";
      resetBtn.style.color = "#6b7280";
    });
  }

  // Create floating settings button
  function createSettingsButton() {
    if (document.getElementById("hljs-settings-btn")) return;

    const btn = document.createElement("button");
    btn.id = "hljs-settings-btn";
    btn.title = "Syntax Theme Settings (press T)";
    btn.style.cssText = `
        position: fixed;
        right: 18px;
        bottom: 80px;
        z-index: 9998;
        background: #6366f1;
        color: white;
        border: none;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 6px 18px rgba(99, 102, 241, 0.3);
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
    btn.textContent = "🎨";

    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "scale(1.1)";
      btn.style.boxShadow = "0 8px 24px rgba(99, 102, 241, 0.4)";
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "scale(1)";
      btn.style.boxShadow = "0 6px 18px rgba(99, 102, 241, 0.3)";
    });

    btn.addEventListener("click", () => {
      const panel = document.getElementById("hljs-settings-panel");
      const isVisible = panel.style.display === "flex";
      panel.style.display = isVisible ? "none" : "flex";
      btn.textContent = isVisible ? "🎨" : "✕";
    });

    document.body.appendChild(btn);
  }

  // Close panel when clicking outside
  document.addEventListener("click", (e) => {
    const panel = document.getElementById("hljs-settings-panel");
    const btn = document.getElementById("hljs-settings-btn");

    if (
      panel &&
      panel.style.display === "flex" &&
      !panel.contains(e.target) &&
      e.target !== btn
    ) {
      panel.style.display = "none";
      if (btn) btn.textContent = "🎨";
    }
  });

  // Keyboard shortcut: 't' for theme
  document.addEventListener("keydown", (e) => {
    if (
      e.key.toLowerCase() === "t" &&
      !e.altKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.target.matches("input, textarea, select")
    ) {
      e.preventDefault();
      document.getElementById("hljs-settings-btn")?.click();
    }
  });

  // Initialize
  async function init() {
    console.log("🚀 Initializing highlight.js integration...");

    // Check if this is a file view
    const hasCode = isFileView();
    console.log("Has code:", hasCode);

    if (hasCode) {
      try {
        // Wait for highlight.js to be available
        await waitForHljs();

        console.log(
          "✅ highlight.js ready, version:",
          window.hljs.versionString
        );

        // Load initial theme
        const isCustom = Settings.get("usingCustom", false);
        if (isCustom) {
          const customCss = Settings.get("customTheme", "");
          if (customCss) {
            loadCustomTheme(customCss);
          } else {
            loadTheme(Settings.get("theme", DEFAULT_THEME));
          }
        } else {
          loadTheme(Settings.get("theme", DEFAULT_THEME));
        }

        // Wait for theme to load
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Apply highlighting
        await applyHighlighting();

        // Create UI
        createSettingsButton();
        createSettingsPanel();

        console.log("✨ Highlight.js integration fully loaded");
      } catch (e) {
        console.error("❌ Failed to initialize highlight.js:", e);
      }
    } else {
      console.log("ℹ️ Not a code file, skipping highlight.js");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
