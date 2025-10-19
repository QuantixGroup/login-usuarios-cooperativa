(function () {
  "use strict";

  const API_BASE =
    typeof API_USUARIOS !== "undefined"
      ? API_USUARIOS
      : "http://127.0.0.1:8000/api";

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    const esPrimerInicio = sessionStorage.getItem("primerInicio") === "true";
    const alerta = document.getElementById("primer-inicio-alerta");

    if (esPrimerInicio && alerta) {
      alerta.classList.remove("d-none");
    }

    document.addEventListener("click", function (e) {
      const toggleBtn = e.target.closest(".toggle-password");
      if (!toggleBtn) return;

      const targetId = toggleBtn.getAttribute("data-target");
      const input = document.querySelector(targetId);
      if (!input) return;

      input.type = input.type === "password" ? "text" : "password";

      const icon = toggleBtn.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }
    });

    const form = document.getElementById("form-change-password");
    if (form) {
      form.addEventListener("submit", handleSubmit);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const currentPassword = document
      .getElementById("currentPassword")
      .value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document
      .getElementById("confirmNewPassword")
      .value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      mostrarMensaje("error", "Todos los campos son obligatorios");
      return;
    }

    if (newPassword.length < 8) {
      mostrarMensaje(
        "error",
        "La nueva contraseña debe tener al menos 8 caracteres"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      mostrarMensaje("error", "Las contraseñas nuevas no coinciden");
      return;
    }

    const token =
      sessionStorage.getItem("tokenAcceso") || sessionStorage.getItem("token");
    if (!token) {
      mostrarMensaje("error", "Debe iniciar sesión");
      return;
    }

    const data = {
      contrasena_actual: currentPassword,
      contrasena_nueva: newPassword,
      contrasena_nueva_confirmation: confirmPassword,
    };

    const btn = document.getElementById("btn-cambiar-password");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "Procesando...";

    fetch(API_BASE + "/perfil/contrasena", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        return response
          .json()
          .then((data) => ({ status: response.status, body: data }));
      })
      .then((result) => {
        if (result.status === 200) {
          mostrarMensaje("exito", "Contraseña cambiada correctamente");
          document.getElementById("currentPassword").value = "";
          document.getElementById("newPassword").value = "";
          document.getElementById("confirmNewPassword").value = "";

          const esPrimerInicio =
            sessionStorage.getItem("primerInicio") === "true";
          if (esPrimerInicio) {
            sessionStorage.removeItem("primerInicio");
            setTimeout(() => {
              window.location.href = "index.html";
            }, 2000);
          }
        } else {
          const mensaje =
            result.body.error ||
            result.body.message ||
            "No se pudo cambiar la contraseña";
          mostrarMensaje("error", mensaje);
        }
      })
      .catch(() => {})
      .finally(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
      });
  }

  function mostrarMensaje(tipo, mensaje) {
    fetch("msj-alertas.html")
      .then((response) => response.text())
      .then((html) => {
        let temp = document.createElement("div");
        temp.innerHTML = html;
        let msg;
        if (tipo === "exito") {
          msg = temp.querySelector(".alert-success");
          if (mensaje) {
            const span = msg.querySelector(".alert-exito-text");
            if (span) span.textContent = mensaje;
          }
        } else {
          msg = temp.querySelector(".alert-danger");
          if (mensaje) {
            const span = msg.querySelector(".alert-error-text");
            if (span) span.textContent = mensaje;
          }
        }
        document.body.appendChild(msg);
        setTimeout(() => {
          msg.classList.add("fade-out");
          setTimeout(() => {
            msg.remove();
          }, 500);
        }, 5000);
      })
      .catch(() => {
        alert(mensaje);
      });
  }
})();
