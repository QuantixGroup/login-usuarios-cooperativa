(() => {
  const STORAGE_KEY = "cooperativa_dark_mode";
  const html = document.documentElement;
  const TOGGLE_SELECTOR =
    '.dark-mode-toggle, #darkModeToggle, [data-toggle="dark-mode"]';

  const setTheme = (isDark) => {
    const theme = isDark ? "dark" : "light";
    html.setAttribute("data-bs-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);

    document.querySelectorAll(TOGGLE_SELECTOR).forEach((btn) => {
      const icon = btn.querySelector("i");
      if (icon) {
        icon.className = `bi ${isDark ? "bi-moon-fill" : "bi-sun-fill"}`;
      }
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
    });
  };

  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  setTheme(savedTheme === "dark" || (!savedTheme && prefersDark));

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(TOGGLE_SELECTOR);
    if (!btn) return;
    e.preventDefault();
    const currentlyDark = html.getAttribute("data-bs-theme") === "dark";
    setTheme(!currentlyDark);
  });

  window.cooperativaSetTheme = (theme) => setTheme(theme === "dark");
  window.cooperativaGetTheme = () =>
    html.getAttribute("data-bs-theme") || "light";
})();
