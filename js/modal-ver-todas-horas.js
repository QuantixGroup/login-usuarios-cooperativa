document.addEventListener("DOMContentLoaded", function () {
  const FORM_URL = "modals/ver-todas-horas.html";

  function renderList(container, list) {
    container.innerHTML = "";
    if (!list || !list.length) {
      container.innerHTML = '<div class="text-muted">No hay registros.</div>';
      return;
    }

    const groups = {};
    for (const r of list) {
      const d = new Date(r.fecha + "T00:00:00");
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (!groups[key]) groups[key] = { date: d, items: [] };
      groups[key].items.push(r);
    }

    const keys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));
    for (const key of keys) {
      const g = groups[key];
      const label = new Intl.DateTimeFormat("es-ES", {
        month: "long",
        year: "numeric",
      }).format(g.date);
      const header = document.createElement("div");
      header.className = "mt-3 mb-1";
      header.innerHTML = `<strong>${label}</strong>`;
      container.appendChild(header);

      g.items.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
      for (const r of g.items) {
        const item = document.createElement("div");
        item.className = "list-group-item";
        item.innerHTML = `
          <div>
            <div><strong>${r.fecha}</strong></div>
            <div class="small text-muted">${(Number(r.horas) || 0).toFixed(
              2
            )} h ${r.descripcion ? "— " + r.descripcion : ""}</div>
          </div>
        `;
        container.appendChild(item);
      }
    }
  }

  document.body.addEventListener("click", async function (e) {
    const t = e.target;
    if (
      !t ||
      !(
        t.id === "btn-ver-todas-horas" ||
        (t.closest && t.closest("#btn-ver-todas-horas"))
      )
    )
      return;
    let modalEl = null;
    let modalBody = null;
    let bs = null;
    try {
      const r = await fetch(FORM_URL);
      if (!r.ok) throw new Error("no form");
      const html = await r.text();

      if (
        html.includes('id="modalVerTodasHoras"') ||
        html.includes("id='modalVerTodasHoras'")
      ) {
        if (!document.getElementById("modalVerTodasHoras")) {
          document.body.insertAdjacentHTML("beforeend", html);
        }
        modalEl = document.getElementById("modalVerTodasHoras");
        modalBody = modalEl
          ? document.getElementById("modalVerTodasHorasBody")
          : null;
        bs = modalEl
          ? bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)
          : null;
      } else {
        const ensured = await ensureModalFragment(
          FORM_URL,
          "modalVerTodasHoras",
          "modalVerTodasHorasBody",
          `
          <div class="modal fade" id="modalVerTodasHoras" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content"><div id="modalVerTodasHorasBody"></div></div></div></div>`
        );
        modalEl = ensured.modalEl;
        modalBody = ensured.modalBody;
        bs = ensured.bs;
        if (modalBody) modalBody.innerHTML = html;
      }

      if (!modalBody || !bs) return;
      const listContainer = modalBody.querySelector("#ver-todas-horas-list");

      const base =
        typeof API_COOPERATIVA !== "undefined"
          ? API_COOPERATIVA
          : typeof API_USUARIOS !== "undefined"
          ? API_USUARIOS
          : "http://localhost:8000/api";
      const url = base + "/horas";
      const token =
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("tokenAcceso") ||
        "";
      const options = token
        ? { headers: { Authorization: "Bearer " + token } }
        : {};
      const res = await fetch(url, options);
      let arr = [];
      if (res.ok) {
        const data = await res.json();
        arr = Array.isArray(data) ? data : data.data || [];
      }
      renderList(listContainer, arr);
    } catch (err) {
      modalBody.innerHTML =
        '<div class="p-3 text-danger">No se pudo cargar la lista.</div>';
    }

    bs.show();
  });
});
