// OpenGrok Native Theme System - works with OpenGrok's existing tokenization
(() => {
  "use strict";

  console.log("🎨 OpenGrok Theme System starting...");

  // Check if we're on an xref page
  if (!/^\/xref\//.test(location.pathname)) {
    console.log("❌ Not on xref page, exiting");
    return;
  }

  // Theme definitions - map OpenGrok's token classes to colors
  const THEMES = {
    "monokai": {
      name: "Monokai",
      background: "#272822",
      foreground: "#f8f8f2",
      lineNumbers: "#75715e",
      lineNumbersHover: "#a6a292",
      tokens: {
        keyword: "#f92672",        // b tags (import, export, const, etc)
        string: "#e6db74",         // .s class
        comment: "#75715e",        // .c class
        number: "#ae81ff",         // .n class
        function: "#a6e22e",       // function names
        variable: "#f8f8f2",       // regular identifiers
        link: "#66d9ef",           // a tags (symbols/refs)
        operator: "#f92672",       // operators
      }
    },
    "github-dark": {
      name: "GitHub Dark",
      background: "#0d1117",
      foreground: "#c9d1d9",
      lineNumbers: "#8b949e",
      lineNumbersHover: "#c9d1d9",
      tokens: {
        keyword: "#ff7b72",
        string: "#a5d6ff",
        comment: "#8b949e",
        number: "#79c0ff",
        function: "#d2a8ff",
        variable: "#c9d1d9",
        link: "#79c0ff",
        operator: "#ff7b72",
      }
    },
    "dracula": {
      name: "Dracula",
      background: "#282a36",
      foreground: "#f8f8f2",
      lineNumbers: "#6272a4",
      lineNumbersHover: "#f8f8f2",
      tokens: {
        keyword: "#ff79c6",
        string: "#f1fa8c",
        comment: "#6272a4",
        number: "#bd93f9",
        function: "#50fa7b",
        variable: "#f8f8f2",
        link: "#8be9fd",
        operator: "#ff79c6",
      }
    },
    "vs-dark": {
      name: "VS Code Dark",
      background: "#1e1e1e",
      foreground: "#d4d4d4",
      lineNumbers: "#858585",
      lineNumbersHover: "#c6c6c6",
      tokens: {
        keyword: "#569cd6",
        string: "#ce9178",
        comment: "#6a9955",
        number: "#b5cea8",
        function: "#dcdcaa",
        variable: "#9cdcfe",
        link: "#4ec9b0",
        operator: "#d4d4d4",
      }
    },
    "nord": {
      name: "Nord",
      background: "#2e3440",
      foreground: "#d8dee9",
      lineNumbers: "#4c566a",
      lineNumbersHover: "#d8dee9",
      tokens: {
        keyword: "#81a1c1",
        string: "#a3be8c",
        comment: "#616e88",
        number: "#b48ead",
        function: "#88c0d0",
        variable: "#d8dee9",
        link: "#8fbcbb",
        operator: "#81a1c1",
      }
    },
    "solarized-dark": {
      name: "Solarized Dark",
      background: "#002b36",
      foreground: "#839496",
      lineNumbers: "#586e75",
      lineNumbersHover: "#93a1a1",
      tokens: {
        keyword: "#859900",
        string: "#2aa198",
        comment: "#586e75",
        number: "#d33682",
        function: "#b58900",
        variable: "#839496",
        link: "#268bd2",
        operator: "#859900",
      }
    },
    "gruvbox-dark": {
      name: "Gruvbox Dark",
      background: "#282828",
      foreground: "#ebdbb2",
      lineNumbers: "#665c54",
      lineNumbersHover: "#ebdbb2",
      tokens: {
        keyword: "#fb4934",
        string: "#b8bb26",
        comment: "#928374",
        number: "#d3869b",
        function: "#fabd2f",
        variable: "#ebdbb2",
        link: "#83a598",
        operator: "#fb4934",
      }
    },
    "atom-one-dark": {
      name: "Atom One Dark",
      background: "#282c34",
      foreground: "#abb2bf",
      lineNumbers: "#5c6370",
      lineNumbersHover: "#abb2bf",
      tokens: {
        keyword: "#c678dd",
        string: "#98c379",
        comment: "#5c6370",
        number: "#d19a66",
        function: "#61aeee",
        variable: "#e06c75",
        link: "#56b6c2",
        operator: "#c678dd",
      }
    },
    "tokyo-night": {
      name: "Tokyo Night",
      background: "#1a1b26",
      foreground: "#a9b1d6",
      lineNumbers: "#3b4261",
      lineNumbersHover: "#a9b1d6",
      tokens: {
        keyword: "#9d7cd8",
        string: "#9ece6a",
        comment: "#565f89",
        number: "#ff9e64",
        function: "#7aa2f7",
        variable: "#bb9af7",
        link: "#2ac3de",
        operator: "#9d7cd8",
      }
    },
    "github-light": {
      name: "GitHub Light",
      background: "#ffffff",
      foreground: "#24292e",
      lineNumbers: "#6a737d",
      lineNumbersHover: "#24292e",
      tokens: {
        keyword: "#d73a49",
        string: "#032f62",
        comment: "#6a737d",
        number: "#005cc5",
        function: "#6f42c1",
        variable: "#24292e",
        link: "#005cc5",
        operator: "#d73a49",
      }
    },
    "solarized-light": {
      name: "Solarized Light",
      background: "#fdf6e3",
      foreground: "#657b83",
      lineNumbers: "#93a1a1",
      lineNumbersHover: "#586e75",
      tokens: {
        keyword: "#859900",
        string: "#2aa198",
        comment: "#93a1a1",
        number: "#d33682",
        function: "#b58900",
        variable: "#657b83",
        link: "#268bd2",
        operator: "#859900",
      }
    },
    "opengrok-default": {
      name: "OpenGrok Default",
      background: "#ffffff",
      foreground: "#000000",
      lineNumbers: "#94a3b8",
      lineNumbersHover: "#1e293b",
      tokens: {
        keyword: "#7c3aed",
        string: "#047857",
        comment: "#6b7280",
        number: "#b91c1c",
        function: "#0f766e",
        variable: "#1e293b",
        link: "#1e40af",
        operator: "#334155",
      }
    }
  };

  // Settings management
  const Settings = {
    get: (key, defaultValue) => {
      try {
        const value = localStorage.getItem(`ogTheme:${key}`);
        return value !== null ? JSON.parse(value) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(`ogTheme:${key}`, JSON.stringify(value));
      } catch (e) {
        console.warn("Failed to save setting:", e);
      }
    },
  };

  // Apply theme to the page
  function applyTheme(themeId) {
    const theme = THEMES[themeId];
    if (!theme) {
      console.warn("Theme not found:", themeId);
      return;
    }

    console.log("Applying theme:", theme.name);

    // Remove existing theme style
    const existingStyle = document.getElementById("opengrok-theme-style");
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const style = document.createElement("style");
    style.id = "opengrok-theme-style";
    style.textContent = `
      /* Background and base text */
      #src pre {
        background: ${theme.background} !important;
        color: ${theme.foreground} !important;
      }

      /* Line numbers */
      #src .l,
      #src a.l {
        color: ${theme.lineNumbers} !important;
        background: transparent !important;
        border-right: 1px solid ${theme.lineNumbers}33 !important;
      }

      #src .l:hover,
      #src a.l:hover {
        color: ${theme.lineNumbersHover} !important;
        background: ${theme.lineNumbers}22 !important;
      }

      /* Keywords (b tags) */
      #src b {
        color: ${theme.tokens.keyword} !important;
        font-weight: bold !important;
      }

      /* Strings */
      #src .s,
      #src .s a {
        color: ${theme.tokens.string} !important;
      }

      /* Comments */
      #src .c {
        color: ${theme.tokens.comment} !important;
        font-style: italic !important;
      }

      /* Numbers */
      #src .n {
        color: ${theme.tokens.number} !important;
      }

      /* Links/symbols */
      #src a:not(.l) {
        color: ${theme.tokens.link} !important;
        text-decoration: none !important;
      }

      #src a:not(.l):hover {
        text-decoration: underline !important;
        background: ${theme.tokens.link}22 !important;
        padding: 0 2px;
        margin: 0 -2px;
        border-radius: 2px;
      }

      /* Function definitions */
      #src a[href*="defs="] {
        color: ${theme.tokens.function} !important;
        font-weight: 600 !important;
      }

      /* IntelliWindow symbols */
      #src a.intelliWindow-symbol {
        color: ${theme.tokens.variable} !important;
      }

      #src a.d {
        color: ${theme.tokens.function} !important;
        font-weight: 600 !important;
      }

      /* Selected/highlighted lines */
      #src .hl,
      #src .selected {
        background: ${theme.tokens.keyword}22 !important;
      }

      /* Make sure text remains visible */
      #src {
        color: ${theme.foreground} !important;
      }

      /* Adjust the overall container if needed */
      #src {
        padding: 1em;
        border-radius: 8px;
        margin: 1em 0;
      }
    `;

    document.head.appendChild(style);
    Settings.set("theme", themeId);
  }

  // Create theme selector widget
  function createThemeSelector() {
    if (document.getElementById("og-theme-panel")) return;

    const panel = document.createElement("div");
    panel.id = "og-theme-panel";
    panel.style.cssText = `
      position: fixed;
      right: 18px;
      bottom: 140px;
      width: 280px;
      max-height: 400px;
      background: white;
      border: 1px solid #d9e1ec;
      border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      display: none;
      flex-direction: column;
      overflow: hidden;
    `;

    const currentTheme = Settings.get("theme", "opengrok-default");

    panel.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">
          🎨 Code Theme
        </h3>
      </div>

      <div style="overflow-y: auto; flex: 1; padding: 12px;">
        <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
          ${Object.entries(THEMES).map(([id, theme]) => `
            <button class="og-theme-option" data-theme="${id}" style="
              padding: 12px;
              border: 2px solid ${id === currentTheme ? '#0b61ff' : '#e5e7eb'};
              border-radius: 8px;
              background: ${id === currentTheme ? '#eaf2ff' : 'white'};
              text-align: left;
              cursor: pointer;
              transition: all 0.2s;
            ">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="
                  width: 32px;
                  height: 32px;
                  border-radius: 4px;
                  background: ${theme.background};
                  border: 1px solid #e5e7eb;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 10px;
                  color: ${theme.tokens.keyword};
                  font-weight: bold;
                ">{ }</div>
                <div>
                  <div style="font-weight: 600; color: #1f2937; font-size: 14px;">
                    ${theme.name}
                  </div>
                  <div style="display: flex; gap: 4px; margin-top: 4px;">
                    <span style="width: 12px; height: 12px; border-radius: 2px; background: ${theme.tokens.keyword};"></span>
                    <span style="width: 12px; height: 12px; border-radius: 2px; background: ${theme.tokens.string};"></span>
                    <span style="width: 12px; height: 12px; border-radius: 2px; background: ${theme.tokens.function};"></span>
                    <span style="width: 12px; height: 12px; border-radius: 2px; background: ${theme.tokens.comment};"></span>
                  </div>
                </div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Add event listeners to theme buttons
    panel.querySelectorAll(".og-theme-option").forEach(btn => {
      btn.addEventListener("click", () => {
        const themeId = btn.dataset.theme;
        applyTheme(themeId);

        // Update button styles
        panel.querySelectorAll(".og-theme-option").forEach(b => {
          if (b === btn) {
            b.style.border = "2px solid #0b61ff";
            b.style.background = "#eaf2ff";
          } else {
            b.style.border = "2px solid #e5e7eb";
            b.style.background = "white";
          }
        });
      });

      // Hover effect
      btn.addEventListener("mouseenter", () => {
        if (btn.dataset.theme !== Settings.get("theme", "opengrok-default")) {
          btn.style.background = "#f3f4f6";
        }
      });

      btn.addEventListener("mouseleave", () => {
        if (btn.dataset.theme !== Settings.get("theme", "opengrok-default")) {
          btn.style.background = "white";
        }
      });
    });
  }

  // Create floating button
  function createThemeButton() {
    if (document.getElementById("og-theme-btn")) return;

    const btn = document.createElement("button");
    btn.id = "og-theme-btn";
    btn.title = "Code Theme (press T)";
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
      const panel = document.getElementById("og-theme-panel");
      const isVisible = panel.style.display === "flex";
      panel.style.display = isVisible ? "none" : "flex";
      btn.textContent = isVisible ? "🎨" : "✕";
    });

    document.body.appendChild(btn);
  }

  // Check if this is a code view (not directory)
  function isCodeView() {
    const pre = document.querySelector("#src pre");
    const dirlist = document.querySelector("#dirlist");
    return !!pre && !dirlist;
  }

  // Initialize
  function init() {
    console.log("🚀 Initializing OpenGrok theme system...");

    if (!isCodeView()) {
      console.log("ℹ️ Not a code view, skipping theme system");
      return;
    }

    // Create UI elements
    createThemeButton();
    createThemeSelector();

    // Apply saved theme
    const savedTheme = Settings.get("theme", "opengrok-default");
    applyTheme(savedTheme);

    // Keyboard shortcut
    document.addEventListener("keydown", (e) => {
      if (
        e.key.toLowerCase() === "t" &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.target.matches("input, textarea, select")
      ) {
        e.preventDefault();
        document.getElementById("og-theme-btn")?.click();
      }
    });

    // Close panel when clicking outside
    document.addEventListener("click", (e) => {
      const panel = document.getElementById("og-theme-panel");
      const btn = document.getElementById("og-theme-btn");

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

    console.log("✨ OpenGrok theme system loaded");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();