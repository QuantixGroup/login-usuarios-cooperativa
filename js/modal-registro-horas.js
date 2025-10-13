document.addEventListener("DOMContentLoaded", function () {
  function apiBase() {
    return (
      (typeof API_COOPERATIVA !== "undefined" && API_COOPERATIVA) ||
      (typeof API_USUARIOS !== "undefined" && API_USUARIOS) ||
      "http://localhost:8000/api"
    );
  }

  async function fetchHoras() {
    const base = apiBase();
    const url = base + "/horas";
    const token =
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("tokenAcceso") ||
      "";
    const options = token
      ? { headers: { Authorization: "Bearer " + token } }
      : {};
    try {
      const res = await fetch(url, options);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch (e) {
      return [];
    }
  }

  const VER_TODAS_FRAGMENT = "modals/ver-todas-horas.html";

  function renderHorasPorMes(container, list) {
    container.innerHTML = "";
    if (!list || !list.length) {
      container.innerHTML =
        '<div class="text-muted p-3">No hay registros.</div>';
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
      t &&
      (t.id === "btn-abrir-registro-horas" ||
        (t.closest && t.closest("#btn-abrir-registro-horas")))
    ) {
      let modalEl = document.getElementById("modalRegistroHoras");
      if (!modalEl) {
        try {
          const response = await fetch("modals/modal-registro-horas.html");
          if (response.ok) {
            const modalHtml = await response.text();
            document.body.insertAdjacentHTML("beforeend", modalHtml);
            modalEl = document.getElementById("modalRegistroHoras");
          }
        } catch (error) {
          showAlert("error", "Error al cargar el modal");
          return;
        }
      }

      const modalBody = document.getElementById("modalRegistroHorasBody");
      const bs =
        bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);

      if (!modalBody || !bs) {
        return;
      }

      const form = modalBody.querySelector("#form-registro-horas");
      const submitBtn = form
        ? form.querySelector('button[type="submit"]')
        : null;
      try {
        if (form) {
          const dateInput = form.querySelector("#fecha");
          if (dateInput) {
            const d = new Date();
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            dateInput.value = d.toISOString().split("T")[0];
          }
          const hoursInput = form.querySelector("#horas");
          if (hoursInput) {
            hoursInput.value = "0";
            let feedback = form.querySelector(".horas-feedback");
            if (!feedback) {
              feedback = document.createElement("div");
              feedback.className = "invalid-feedback horas-feedback";
              feedback.textContent = "Ingrese un valor mayor que 0";
              hoursInput.insertAdjacentElement("afterend", feedback);
            }
            const validateHours = () => {
              const v = parseFloat(hoursInput.value || "0");
              if (!(v > 0)) {
                hoursInput.classList.add("is-invalid");
                if (submitBtn) submitBtn.disabled = true;
              } else {
                hoursInput.classList.remove("is-invalid");
                if (submitBtn) submitBtn.disabled = false;
              }
            };
            hoursInput.addEventListener("input", validateHours);
            validateHours();
          }
        }
      } catch (e) {}

      if (form) {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          const fecha = form.querySelector("#fecha").value;
          const horas = parseFloat(form.querySelector("#horas").value || 0);
          const tipoTrabajo = form.querySelector("#tipo_trabajo").value;

          if (!fecha) {
            showAlert("error", "Seleccione una fecha");
            return;
          }
          const hoy = new Date();
          const f = new Date(fecha + "T00:00:00");
          if (f > hoy) {
            showAlert("error", "La fecha no puede ser mayor al día de hoy");
            return;
          }
          if (!(horas > 0)) {
            showAlert("error", "Ingrese la cantidad de horas (mayor a 0)");
            return;
          }
          if (!tipoTrabajo) {
            showAlert("error", "Seleccione el tipo de trabajo");
            return;
          }
          const fd = new FormData(form);
          submitForm(fd, submitBtn);
        });
      }

      bs.show();
    }
  });

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

  async function submitForm(fd, submitBtn) {
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...`;

    const base = apiBase();
    const url = base + "/horas/registro";
    const token =
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("tokenAcceso") ||
      "";

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

      showAlert("success", json.message || "Horas registradas");
      try {
        const modalNode = document.getElementById("modalRegistroHoras");
        const bsInst = modalNode && bootstrap.Modal.getInstance(modalNode);
        if (bsInst) bsInst.hide();
      } catch (e) {}
      if (window.loadHorasResumen) window.loadHorasResumen();
    } catch (err) {
      showAlert("error", "Error al guardar: " + (err.message || err));
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  document.addEventListener("shown.bs.modal", function (ev) {
    try {
      const target = ev && ev.target;
      if (!target || target.id !== "modalRegistroHoras") return;
      const form = target.querySelector("#form-registro-horas");
      if (!form) return;
      const hoursInput = form.querySelector("#horas");
      if (hoursInput) {
        hoursInput.focus();
        if (hoursInput.select) hoursInput.select();
      }
    } catch (e) {}
  });
});
