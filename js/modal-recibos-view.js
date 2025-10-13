document.addEventListener("DOMContentLoaded", function () {
  function apiBase() {
    return (
      (typeof API_COOPERATIVA !== "undefined" && API_COOPERATIVA) ||
      (typeof API_USUARIOS !== "undefined" && API_USUARIOS) ||
      "http://localhost:8000/api"
    );
  }

  function getAuthHeaders() {
    const token =
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("tokenAcceso") ||
      "";
    return token ? { Authorization: "Bearer " + token } : {};
  }

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
    const url = apiBase() + "/pagos/resumen-por-mes";
    try {
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      renderRecibos(data, modalBody);
    } catch (err) {
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

    list.forEach((recibo) => {
      const estado = (recibo.estado || "pendiente").toLowerCase();
      const isPagado = estado === "pagado";

      const item = document.createElement("div");
      item.className =
        "list-group-item d-flex justify-content-between align-items-center";
      item.innerHTML = `
        <div>
          <strong>${recibo.mes || recibo.fecha || "---"}</strong><br>
          <small>Monto: ${recibo.total || "0"}</small>
        </div>
        <div>
          <span class="badge rounded-pill ${
            isPagado ? "bg-success" : "bg-warning"
          }">
            ${isPagado ? "Pagado" : "Pendiente"}
          </span>
        </div>
      `;

      const rightDiv = item.querySelector("div:last-child");

      if (!isPagado) {
        const btnPagar = document.createElement("button");
        btnPagar.className = "btn btn-sm btn-outline-primary ms-2";
        btnPagar.textContent = "Marcar como pagado / Subir comprobante";
        btnPagar.addEventListener("click", () =>
          openPagoModal(recibo, modalBody)
        );
        rightDiv.appendChild(btnPagar);
      } else if (recibo.comprobante_url) {
        const linkVer = document.createElement("a");
        linkVer.href = recibo.comprobante_url;
        linkVer.target = "_blank";
        linkVer.className = "btn btn-sm btn-outline-success ms-2";
        linkVer.textContent = "Ver comprobante";
        rightDiv.appendChild(linkVer);
      }

      container.appendChild(item);
    });

    modalBody.appendChild(container);
  }

  function openPagoModal(recibo, modalBody) {
    if (!modalBody) return;

    if (window.RegistrarPago) {
      window.RegistrarPago.openPagoModal(recibo, modalBody, () =>
        loadRecibos(modalBody)
      );
    } else {
      modalBody.innerHTML = `
        <div class="alert alert-warning" role="alert">
          <h6>Módulo no disponible</h6>
          <p class="mb-0">El módulo de registro de pagos no está cargado.</p>
          <p class="mb-0">Verifique que el archivo modal-registrar-pago.js esté incluido.</p>
        </div>
      `;
    }
  }

  document.body.addEventListener("click", async function (e) {
    const target = e.target;
    if (
      target &&
      (target.id === "btn-ver-recibos" ||
        (target.closest && target.closest("#btn-ver-recibos")))
    ) {
      const { modalEl, modalBody, bs } = await ensureModalFragment(
        "modals/modal-ver-recibos.html",
        "modalVerRecibos",
        "modalVerRecibosBody"
      );

      if (!modalBody || !bs) return;

      modalBody.innerHTML = "<p>Cargando recibos...</p>";
      bs.show();
      await loadRecibos(modalBody);
    }
  });
});
