document.addEventListener("DOMContentLoaded", () => {
  const apiBase = () =>
    (typeof API_COOPERATIVA !== "undefined" && API_COOPERATIVA) ||
    (typeof API_USUARIOS !== "undefined" && API_USUARIOS) ||
    "http://localhost:8000/api";

  const getAuthHeaders = () => {
    const t =
      sessionStorage.getItem("token") || sessionStorage.getItem("tokenAcceso");
    return t ? { Authorization: "Bearer " + t } : {};
  };

  const showAlert = (type, text) => {
    try {
      if (typeof mostrarMensajeAlerta === "function")
        return mostrarMensajeAlerta(
          type === "success" ? "exito" : "error",
          text
        );
    } catch (e) {}
    fetch("msj-alertas.html")
      .then((r) => r.text())
      .then((html) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        const sel = type === "success" ? ".alert-exito" : ".alert-error";
        const node = tmp.querySelector(sel);
        if (!node) return alert(text);
        const txt = node.querySelector(
          type === "success" ? ".alert-exito-text" : ".alert-error-text"
        );
        if (txt) txt.textContent = text;
        document.body.appendChild(node);
        setTimeout(() => node.classList.add("fade-out"), 3500);
      })
      .catch(() => alert(text));
  };

  const loadRecibos = async (modalBody) => {
    if (!modalBody) return;
    try {
      const res = await fetch(`${apiBase()}/pagos/resumen-por-mes`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      renderRecibos(data, modalBody);
    } catch (err) {
      modalBody.innerHTML =
        '<p class="text-danger">No se pudieron cargar los recibos.</p>';
    }
  };

  const renderRecibos = (list, modalBody) => {
    if (!modalBody) return;
    if (!Array.isArray(list) || list.length === 0)
      return void (modalBody.innerHTML = "<p>No hay recibos disponibles</p>");

    const container = document.createElement("div");
    container.className = "list-group";
    list.forEach((r) => {
      const estado = (r.estado || "pendiente").toLowerCase();
      const isPagado = estado === "pagado";
      const item = document.createElement("div");
      item.className =
        "list-group-item d-flex justify-content-between align-items-center";
      item.innerHTML = `
        <div>
          <strong>${r.mes || r.fecha || "---"}</strong><br>
          <small>Monto: ${r.total || "0"}</small>
        </div>
        <div>
          <span class="badge rounded-pill ${
            isPagado ? "bg-success" : "bg-warning"
          }">${isPagado ? "Pagado" : "Pendiente"}</span>
        </div>`;

      const right = item.querySelector("div:last-child");
      if (!isPagado) {
        const btn = document.createElement("button");
        btn.className = "btn btn-sm btn-outline-primary ms-2";
        btn.textContent = "Marcar como pagado / Subir comprobante";
        btn.addEventListener("click", () => openPagoModal(r, modalBody));
        right.appendChild(btn);
      } else if (r.comprobante_url) {
        const a = document.createElement("a");
        a.href = r.comprobante_url;
        a.target = "_blank";
        a.className = "btn btn-sm btn-outline-success ms-2";
        a.textContent = "Ver comprobante";
        right.appendChild(a);
      }
      container.appendChild(item);
    });
    modalBody.innerHTML = "";
    modalBody.appendChild(container);
  };

  const openPagoModal = (recibo, modalBody) => {
    if (!modalBody) return;
    if (window.RegistrarPago)
      return window.RegistrarPago.openPagoModal(recibo, modalBody, () =>
        loadRecibos(modalBody)
      );
  };

  document.body.addEventListener("click", async (e) => {
    const t = e.target;
    if (!t) return;
    const isBtn =
      t.id === "btn-ver-recibos" ||
      (t.closest && t.closest("#btn-ver-recibos"));
    if (!isBtn) return;
    const { modalEl, modalBody, bs } = await ensureModalFragment(
      "modals/modal-ver-recibos.html",
      "modalVerRecibos",
      "modalVerRecibosBody"
    );
    if (!modalBody || !bs) return;
    modalBody.innerHTML = "<p>Cargando recibos...</p>";
    bs.show();
    await loadRecibos(modalBody);
  });
});
