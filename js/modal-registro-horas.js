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
    const originalText = submitBtn ? submitBtn.innerHTML : "Guardar";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...`;
    }

    const base = apiBase();
    const url = base + "/horas/registro";
    const token =
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("tokenAcceso") ||
      "";

    try {
      const data = {};
      for (const [key, value] of fd.entries()) {
        if (value && value.trim && value.trim() !== "") data[key] = value;
      }
      if (data.horas) {
        data.conteo_de_horas = parseInt(data.horas);
        delete data.horas;
      }

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      };
      if (token) options.headers.Authorization = "Bearer " + token;

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

      showAlert("success", json.message || "Horas registradas correctamente");
      try {
        const modalNode = document.getElementById("modalRegistroHoras");
        const bsInst = modalNode && bootstrap.Modal.getInstance(modalNode);
        if (bsInst) bsInst.hide();
      } catch (e) {}
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      showAlert("error", "Error al guardar: " + msg);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }
  }

  document.body.addEventListener("click", async function (e) {
    const t = e.target;
    if (!t) return;
    const opener =
      t.id === "btn-abrir-registro-horas" ||
      (t.closest && t.closest("#btn-abrir-registro-horas"));
    if (!opener) return;

    let modalEl = document.getElementById("modalRegistroHoras");
    if (!modalEl) {
      try {
        const response = await fetch("modals/modal-registro-horas.html");
        if (response.ok) {
          const modalHtml = await response.text();
          document.body.insertAdjacentHTML("beforeend", modalHtml);
          modalEl = document.getElementById("modalRegistroHoras");
        }
      } catch (err) {
        showAlert("error", "Error al cargar el modal");
        return;
      }
    }

    const form = modalEl && modalEl.querySelector("#form-registro-horas");
    const submitBtn = form && form.querySelector("button[type=submit]");
    const hoursInput = form && form.querySelector("#horas");

    if (hoursInput) {
      const feedback = document.createElement("div");
      feedback.className = "invalid-feedback";
      const validateHours = () => {
        const v = parseFloat(hoursInput.value || "0");
        if (!(v > 0)) {
          hoursInput.classList.add("is-invalid");
          if (submitBtn) submitBtn.disabled = true;
          if (
            !hoursInput.nextElementSibling ||
            !hoursInput.nextElementSibling.classList.contains(
              "invalid-feedback"
            )
          ) {
            hoursInput.insertAdjacentElement("afterend", feedback);
            feedback.textContent = "Ingrese un valor mayor que 0";
          }
        } else {
          hoursInput.classList.remove("is-invalid");
          if (submitBtn) submitBtn.disabled = false;
          if (feedback && feedback.parentNode)
            feedback.parentNode.removeChild(feedback);
        }
      };
      hoursInput.addEventListener("input", validateHours);
      validateHours();
    }

    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        const fd = new FormData(form);
        submitForm(fd, submitBtn);
      });
    }

    try {
      const bs = bootstrap.Modal.getOrCreateInstance(modalEl);
      bs.show();
    } catch (e) {}
  });

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
