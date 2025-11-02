$(document).ready(function () {
  const cedulaRecordada = localStorage.getItem("cedula_recordada");
  if (cedulaRecordada) {
    $("#documento").val(cedulaRecordada);
    $("#recordar").prop("checked", true);
  }

  $("#form-login").on("submit", function (evento) {
    evento.preventDefault();

    const cedula = $("#documento").val().trim();
    const contrasena = $("#password").val();
    const recordar = $("#recordar").is(":checked");

    $.ajax({
      url: API_USUARIOS + "/iniciar-sesion",
      method: "POST",
      headers: { Accept: "application/json" },
      contentType: "application/json",
      data: JSON.stringify({ cedula, contrasena }),
      success: function (datos) {
        const token = datos.access_token;
        if (!token) {
          return;
        }

        sessionStorage.setItem("tokenAcceso", token);
        if (recordar) {
          localStorage.setItem("cedula_recordada", cedula);
        } else {
          localStorage.removeItem("cedula_recordada");
        }

        if (datos.primer_inicio === true || datos.primer_inicio === 1) {
          sessionStorage.setItem("primerInicio", "true");
          window.location.href = "cambiar-password.html";
        } else {
          window.location.href = "index.html";
        }
      },
      error: function (xhr) {
        const respuesta = xhr.responseJSON || {};
        let mensajeError = "No fue posible iniciar sesión";
        if (xhr.status === 401 || xhr.status === 400) {
          mensajeError = "Contraseña incorrecta";
        } else if (xhr.status === 403) {
          mensajeError = "Usuario no aprobado o sin acceso";
        } else if (respuesta.error) {
          mensajeError = respuesta.error;
        }

        mostrarMensajeError(mensajeError);
      },
    });
  });

  function cargarPerfil() {
    $.ajax({
      url: API_USUARIOS + "/perfil",
      method: "GET",
      headers: { Authorization: "Bearer " + tokenAcceso },
      success: function (perfil) {
        $("#info-perfil").html(`
          <p><strong>Nombre:</strong> ${perfil.nombre ?? "-"}</p>
          <p><strong>Cédula:</strong> ${perfil.cedula ?? "-"}</p>
          <p><strong>Email:</strong> ${perfil.email ?? "-"}</p>
        `);
      },
      error: function () {
        mostrarMensajeError("No se pudo cargar el perfil");
      },
    });
  }

  function mostrarMensajeOk(texto) {
    $("#error").html(
      `<div class="alert alert-success" role="alert">${texto}</div>`
    );
  }
  function mostrarMensajeError(texto) {
    $("#error").html(
      `<div class="alert alert-danger" role="alert">${texto}</div>`
    );
  }

  $(document).on("click", "#togglePassword", function () {
    const $pwd = $("#password");
    const $icon = $(this).find("i");

    if ($pwd.attr("type") === "password") {
      $pwd.attr("type", "text");
      if ($icon.length) {
        $icon.removeClass("bi-eye-slash-fill").addClass("bi-eye-fill");
      }
      $(this).attr("aria-label", "Ocultar contraseña");
    } else {
      $pwd.attr("type", "password");
      if ($icon.length) {
        $icon.removeClass("bi-eye-fill").addClass("bi-eye-slash-fill");
      }
      $(this).attr("aria-label", "Mostrar contraseña");
    }
  });
});
