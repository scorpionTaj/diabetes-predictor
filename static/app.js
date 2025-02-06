document.addEventListener("DOMContentLoaded", function () {
  // Theme mode toggle (already implemented)
  const themeModeEl = document.getElementById("theme-mode");
  themeModeEl.addEventListener("change", (e) => {
    const mode = e.target.value;
    if (mode === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
    localStorage.setItem("theme", mode);
  });

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

document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const rect = btn.getBoundingClientRect();
    // Calculate click position relative to the button
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    btn.style.setProperty("--ripple-x", x + "px");
    btn.style.setProperty("--ripple-y", y + "px");
  });
});
