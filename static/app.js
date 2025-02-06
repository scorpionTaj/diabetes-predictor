document.addEventListener("DOMContentLoaded", function () {
  const currentTheme = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("light-mode", currentTheme === "light");

  // When the theme control is changed:
  document.getElementById("theme-mode").addEventListener("change", (e) => {
    const theme = e.target.value;
    if (theme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
    localStorage.setItem("theme", theme);
  });

  // Also update the accent color selection if needed:
  document.getElementById("accent-color").addEventListener("change", (e) => {
    const accent = e.target.value;
    document.documentElement.style.setProperty("--primary-color", accent);
    document.documentElement.style.setProperty("--accent-color", accent);
    // Save preference if needed:
    localStorage.setItem("accent", accent);
  });

  // On page load, if an accent is saved, apply it.
  const savedAccent = localStorage.getItem("accent");
  if (savedAccent) {
    document.documentElement.style.setProperty("--primary-color", savedAccent);
    document.documentElement.style.setProperty("--accent-color", savedAccent);
    document.getElementById("accent-color").value = savedAccent;
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
