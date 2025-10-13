(async function () {
  const container = document.getElementById("footer");
  if (!container) return;
  try {
    const res = await fetch("footer.html");
    container.innerHTML = await res.text();
    const y = container.querySelector("#current-year");
    if (y) y.textContent = new Date().getFullYear();
  } catch (err) {
  }
})();
