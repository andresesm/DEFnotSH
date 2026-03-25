(function () {
  const DATA_URL = "data/creators.json";
  const STORAGE_KEY = "vsd-theme";

  function fetchCreators() {
    return fetch(DATA_URL)
      .then(r => r.json())
      .catch(err => {
        console.error("Error loading creators.json", err);
        return [];
      });
  }

  function applyTheme(mode) {
    const root = document.documentElement;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const isNight = mode === "night";

    if (isNight) root.setAttribute("data-theme", "night");
    else root.removeAttribute("data-theme");

    if (metaTheme) {
      metaTheme.setAttribute("content", isNight ? "#0f172a" : "#ffffff");
    }
  }

  function initThemeToggle() {
    const btn = document.getElementById("themeToggle");

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      applyTheme(saved === "night" ? "night" : "day");
    } catch (_) {
      applyTheme("day");
    }

    if (!btn) return;

    btn.addEventListener("click", function () {
      const nextNight = document.documentElement.getAttribute("data-theme") !== "night";
      applyTheme(nextNight ? "night" : "day");

      try {
        localStorage.setItem(STORAGE_KEY, nextNight ? "night" : "day");
      } catch (_) {}
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initThemeToggle();

    fetchCreators().then(creators => {
      if (window.TwitchIntegration && typeof window.TwitchIntegration.init === "function") {
        window.TwitchIntegration.init(creators);
      }

      if (window.VSDFilters && typeof window.VSDFilters.init === "function") {
        window.VSDFilters.init(creators);
      }

      if (window.VSDInfiniteScroll && typeof window.VSDInfiniteScroll.init === "function") {
        window.VSDInfiniteScroll.init(creators);
      }
    });

    const footerCreditsBtn = document.getElementById("footerCreditsBtn");
    const creditsModal = document.getElementById("creditsModal");
    const creditsCloseBtn = document.getElementById("creditsCloseBtn");
    let creditsPushedState = false;

    function isCreditsOpen() {
      return creditsModal && creditsModal.classList.contains("is-visible");
    }

    function pushCreditsState() {
      if (creditsPushedState) return;
      history.pushState({ vsdCredits: true }, "", window.location.href);
      creditsPushedState = true;
    }

    if (creditsModal) {
      new MutationObserver(() => {
        if (isCreditsOpen()) pushCreditsState();
      }).observe(creditsModal, { attributes: true, attributeFilter: ["class", "aria-hidden"] });
    }

    window.addEventListener("popstate", function () {
      if (!isCreditsOpen()) return;
      creditsPushedState = false;

      const active = document.activeElement;
      if (active && creditsModal && creditsModal.contains(active) && footerCreditsBtn) {
        footerCreditsBtn.focus();
      }

      if (creditsCloseBtn) creditsCloseBtn.click();
    });
  });
})();
