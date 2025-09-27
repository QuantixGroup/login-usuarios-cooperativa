document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("btn-ver-recibos");

  function showAlert(type, text) {
    fetch("msj-alertas.html")
      .then((r) => r.text())
      .then((html) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        const node =
          type === "success"
            ? tmp.querySelector(".alert-exito")
            : tmp.querySelector(".alert-error");
        if (node) {
          const txt = node.querySelector(
            type === "success" ? ".alert-exito-text" : ".alert-error-text"
          );
          if (txt) txt.textContent = text;
          document.body.appendChild(node);
          setTimeout(() => node.classList.add("fade-out"), 3500);
          return;
        }
        alert(text);
      })
      .catch(() => alert(text));
  }

  async function loadRecibos(modalBody) {
    if (!modalBody) return;
    const base =
      typeof API_COOPERATIVA !== "undefined"
        ? API_COOPERATIVA
        : typeof API_USUARIOS !== "undefined"
        ? API_USUARIOS
        : "http://localhost:8000/api";
    const url = base + "/pagos/resumen-por-mes";
    try {
      const token = sessionStorage.getItem("token") || "";
      const options = token
        ? { headers: { Authorization: "Bearer " + token } }
        : {};
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      renderRecibos(data, modalBody);
    } catch (err) {
      console.error(err);
      modalBody.innerHTML =
        '<p class="text-danger">No se pudieron cargar los recibos.</p>';
    }
  }

  function renderRecibos(list, modalBody) {
    if (!modalBody) return;
    modalBody.innerHTML = "";
    if (!Array.isArray(list) || list.length === 0) {
      modalBody.innerHTML = "<p>No hay recibos disponibles</p>";
      return;
    }

    const container = document.createElement("div");
    container.className = "list-group";
    list.forEach((r) => {
      const item = document.createElement("div");
      item.className =
        "list-group-item d-flex justify-content-between align-items-center";
      const left = document.createElement("div");
      left.innerHTML = `<strong>${
        r.mes || r.fecha || "---"
      }</strong><br><small>Monto: ${r.total || "0"}</small>`;
      const right = document.createElement("div");
      const estado = (r.estado || "pendiente").toLowerCase();
      const badge = document.createElement("span");
      badge.className =
        "badge rounded-pill " +
        (estado === "pagado" ? "bg-success" : "bg-warning");
      badge.textContent = estado === "pagado" ? "Pagado" : "Pendiente";
      right.appendChild(badge);

      if (estado !== "pagado") {
        const btnPagar = document.createElement("button");
        btnPagar.className = "btn btn-sm btn-outline-primary ms-2";
        btnPagar.textContent = "Marcar como pagado / Subir comprobante";
        btnPagar.addEventListener("click", () => openPagoModal(r));
        right.appendChild(btnPagar);
      } else if (r.comprobante_url) {
        const a = document.createElement("a");
        a.href = r.comprobante_url;
        a.target = "_blank";
        a.className = "btn btn-sm btn-outline-success ms-2";
        a.textContent = "Ver comprobante";
        right.appendChild(a);
      }

      item.appendChild(left);
      item.appendChild(right);
      container.appendChild(item);
    });
    modalBody.appendChild(container);
  }

  function openPagoModal(recibo, modalBody) {
    if (!modalBody) return;
    fetch("modals/pago-recibo-form.html")
      .then((r) => r.text())
      .then((html) => {
        modalBody.innerHTML = html;
        const label = modalBody.querySelector("#pago-recibo-label");
        if (label) label.textContent = recibo.mes || recibo.fecha || "---";
        attachPagoFormHandlers(recibo, modalBody);
      })
      .catch(() => {
        modalBody.innerHTML =
          '<p class="text-danger">No se pudo cargar el formulario.</p>';
      });
  }

  function attachPagoFormHandlers(recibo, modalBody) {
    const form = modalBody.querySelector("#form-subir-comprobante");
    const btnCancel = modalBody.querySelector("#btn-cancel-pago");
    if (btnCancel)
      btnCancel.addEventListener("click", () => loadRecibos(modalBody));
    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const f = form.querySelector("#comprobante").files[0];
      if (!f) {
        showAlert("error", "Seleccione un comprobante PDF");
        return;
      }
      if (f.type !== "application/pdf") {
        showAlert("error", "Solo se permiten PDFs");
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        showAlert("error", "El archivo supera 10MB");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Subiendo...';

      const fd = new FormData();
      fd.append("mes", recibo.mes || recibo.fecha);
      fd.append("comprobante", f);
      const base =
        typeof API_COOPERATIVA !== "undefined"
          ? API_COOPERATIVA
          : typeof API_USUARIOS !== "undefined"
          ? API_USUARIOS
          : "http://localhost:8000/api";
      const url = base + "/recibos/comprobar";
      const token = sessionStorage.getItem("token") || "";

      try {
        const options = { method: "POST", body: fd };
        if (token) options.headers = { Authorization: "Bearer " + token };
        const res = await fetch(url, options);
        const text = await res.text();
        let json = {};
        try {
          json = JSON.parse(text);
        } catch (e) {}
        if (!res.ok) {
          const errMsg =
            json && json.message ? json.message : text || res.statusText;
          throw new Error(errMsg);
        }

        showAlert("success", json.message || "Recibo actualizado");
        if (window.loadHorasResumen) window.loadHorasResumen();
        await loadRecibos();
      } catch (err) {
        console.error(err);
        showAlert(
          "error",
          "Error al subir comprobante: " + (err.message || err)
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  if (btn) {
    btn.addEventListener("click", async function () {
      const { modalEl, modalBody, bs } = await ensureModalFragment(
        "modals/modal-ver-recibos.html",
        "modalVerRecibos",
        "modalVerRecibosBody",
        `
        <div class="modal fade" id="modalVerRecibos" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Recibos mensuales</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button></div><div class="modal-body" id="modalVerRecibosBody"></div></div></div></div>`
      );
      if (!modalBody || !bs) return;
      modalBody.innerHTML = "<p>Cargando recibos...</p>";
      bs.show();
      await loadRecibos(modalBody);
    });
  }
});
