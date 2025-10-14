document.addEventListener("DOMContentLoaded", function () {
  function apiBase() {
    return (
      (typeof API_COOPERATIVA !== "undefined" && API_COOPERATIVA) ||
      (typeof API_USUARIOS !== "undefined" && API_USUARIOS) ||
      "http://localhost:8000/api"
    );
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
        }
      })
      .catch(() => alert(text));
  }

  async function submitForm(formData, btn) {
    const token =
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("tokenAcceso") ||
      "";
    const url = apiBase() + "/comprobantes";

    btn.disabled = true;
    btn.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> Subiendo...';

    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: "Bearer " + token } : {},
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        showAlert("success", json.message || "Recibo registrado correctamente");

        try {
          const modalNode = document.getElementById("modalVerRecibos");
          const bsInst = modalNode && bootstrap.Modal.getInstance(modalNode);
          if (bsInst) bsInst.hide();
        } catch (e) {}
      } else {
        throw new Error(json.message || res.statusText);
      }
    } catch (err) {
      showAlert("error", "Error al subir comprobante: " + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = "Subir y registrar pago";
    }
  }

  document.body.addEventListener("click", async function (e) {
    const t = e.target;
    if (
      t &&
      (t.id === "btn-registrar-pago" ||
        (t.closest && t.closest("#btn-registrar-pago")))
    ) {
      const { modalEl, modalBody, bs } = await ensureModalFragment(
        "modals/modal-registrar-pago.html",
        "modalVerRecibos",
        "modalVerRecibosBody"
      );

      if (!modalBody || !bs) return;

      const tpl = document.getElementById("pago-recibo-template");
      if (tpl) {
        modalBody.innerHTML = "";
        modalBody.appendChild(tpl.content.cloneNode(true));

        const now = new Date();
        const form = modalBody.querySelector("#form-subir-comprobante");

        if (form) {
          const dia = form.querySelector("#pago-dia");
          const mes = form.querySelector("#pago-mes");
          const anio = form.querySelector("#pago-anio");

          if (dia && mes && anio) {
            for (let d = 1; d <= 31; d++) {
              const opt = new Option(d, d.toString().padStart(2, "0"));
              dia.add(opt);
            }

            const meses = [
              "Enero",
              "Febrero",
              "Marzo",
              "Abril",
              "Mayo",
              "Junio",
              "Julio",
              "Agosto",
              "Septiembre",
              "Octubre",
              "Noviembre",
              "Diciembre",
            ];
            meses.forEach((m, i) => {
              const opt = new Option(m, (i + 1).toString().padStart(2, "0"));
              mes.add(opt);
            });

            for (
              let y = now.getFullYear() - 5;
              y <= now.getFullYear() + 2;
              y++
            ) {
              const opt = new Option(y, y);
              anio.add(opt);
            }

            dia.value = now.getDate().toString().padStart(2, "0");
            mes.value = (now.getMonth() + 1).toString().padStart(2, "0");
            anio.value = now.getFullYear();
          }

          form.addEventListener("submit", function (e) {
            e.preventDefault();

            const montoInput = form.querySelector("#monto");
            const monto = parseFloat(montoInput.value);
            const fileInput = form.querySelector("#comprobante");
            const file = fileInput.files[0];
            const submitBtn = form.querySelector('button[type="submit"]');
            const diaSelect = form.querySelector("#pago-dia");
            const mesSelect = form.querySelector("#pago-mes");
            const anioSelect = form.querySelector("#pago-anio");

            if (!monto || monto <= 0) {
              showAlert("error", "Ingrese un monto válido mayor a 0");
              return;
            }
            if (!file) {
              showAlert("error", "Seleccione un comprobante PDF");
              return;
            }
            if (file.type !== "application/pdf") {
              showAlert("error", "Solo se permiten archivos PDF");
              return;
            }
            if (file.size > 10 * 1024 * 1024) {
              showAlert("error", "El archivo no puede superar los 10MB");
              return;
            }

            const dia = diaSelect.value;
            const mes = mesSelect.value;
            const anio = anioSelect.value;
            const fechaComprobante = `${anio}-${mes}-${dia}`;

            const fd = new FormData();
            fd.append("monto", monto);
            fd.append("fecha_comprobante", fechaComprobante);
            fd.append("archivo", file);
            fd.append("mes", parseInt(mes));
            fd.append("anio", parseInt(anio));

            submitForm(fd, submitBtn);
          });
        }

        const btnCancel = modalBody.querySelector("#btn-cancel-pago");
        if (btnCancel) {
          btnCancel.addEventListener("click", () => bs.hide());
        }
      }

      bs.show();
    }
  });
});
