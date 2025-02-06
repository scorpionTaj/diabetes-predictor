document.addEventListener("DOMContentLoaded", function () {
  const themeModeSelect = document.getElementById("theme-mode");
  const accentColorSelect = document.getElementById("accent-color");
  // Default values (Dark mode with Mauve accent)
  const defaultDark = {
    bgColor: "#1e1e2e", // Base
    mantle: "#181825", // Mantle
    surface0: "#313244", // Surface 0 (container background)
    textColor: "#cdd6f4", // Light text
    overlayColor: "#6c7086", // Overlay
    accent: "#cba6f7", // Mauve (default accent)
  };

  // Light mode values (using Rosewater, etc.)
  const defaultLight = {
    bgColor: "#f5e0dc", // Rosewater
    mantle: "#f2cdcd", // Flamingo
    surface0: "#f5c2e7", // Pink
    textColor: "#1e1e2e", // Dark text for light mode
    overlayColor: "#a6adc8", // Subtext 0
    accent: "#cba6f7", // Default accent remains Mauve unless changed
  };

  // Retrieve saved preferences or default to dark mode
  const savedMode = localStorage.getItem("theme-mode") || "dark";
  const savedAccent =
    localStorage.getItem("accent-color") || defaultDark.accent;

  // Set initial values in the controls
  themeModeSelect.value = savedMode;
  accentColorSelect.value = savedAccent;

  // Apply the theme on load
  applyTheme(savedMode, savedAccent);

  // Listen for changes in theme mode
  themeModeSelect.addEventListener("change", function () {
    const mode = this.value;
    const accent = accentColorSelect.value;
    localStorage.setItem("theme-mode", mode);
    applyTheme(mode, accent);
  });

  // Listen for changes in accent color
  accentColorSelect.addEventListener("change", function () {
    const accent = this.value;
    const mode = themeModeSelect.value;
    localStorage.setItem("accent-color", accent);
    applyTheme(mode, accent);
  });

  function applyTheme(mode, accent) {
    const root = document.documentElement;
    if (mode === "light") {
      root.style.setProperty("--bg-color", defaultLight.bgColor);
      root.style.setProperty("--mantle", defaultLight.mantle);
      root.style.setProperty("--surface0", defaultLight.surface0);
      root.style.setProperty("--text-color", defaultLight.textColor);
      root.style.setProperty("--overlay-color", defaultLight.overlayColor);
    } else {
      root.style.setProperty("--bg-color", defaultDark.bgColor);
      root.style.setProperty("--mantle", defaultDark.mantle);
      root.style.setProperty("--surface0", defaultDark.surface0);
      root.style.setProperty("--text-color", defaultDark.textColor);
      root.style.setProperty("--overlay-color", defaultDark.overlayColor);
    }
    // Update accent color (for primary and accent)
    root.style.setProperty("--primary-color", accent);
    root.style.setProperty("--accent-color", accent);
  }

  // Handle form submission to show loading spinner
  const form = document.querySelector("form");
  form.addEventListener("submit", function (e) {
    const loadingModal = document.getElementById("loading-modal");
    // Show the loading spinner
    if (loadingModal) {
      loadingModal.style.display = "flex";
    }
  });

  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "scale(1.02)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "scale(1)";
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.classList.add("clicked");
        setTimeout(() => btn.classList.remove("clicked"), 200);
      });
    });
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/static/sw.js").then(
      function (registration) {
        console.log(
          "Service Worker registration successful with scope: ",
          registration.scope
        );
      },
      function (err) {
        console.log("Service Worker registration failed: ", err);
      }
    );
  });
}
