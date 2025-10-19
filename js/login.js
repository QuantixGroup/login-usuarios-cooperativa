$(document).ready(function () {
  $("#form-login").on("submit", function (evento) {
    evento.preventDefault();

    const cedula = $("#documento").val().trim();
    const contrasena = $("#password").val();

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

        if (datos.primer_inicio === true || datos.primer_inicio === 1) {
          sessionStorage.setItem("primerInicio", "true");
          window.location.href = "cambiar-password.html";
        } else {
          window.location.href = "index.html";
        }

        mostrarMensajeOk("Sesión iniciada");
      },
      error: function (xhr) {
        const respuesta = xhr.responseJSON || {};
        mostrarMensajeError(respuesta.error || "No fue posible iniciar sesión");
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
    $("#mensaje").text(texto).css("color", "green");
  }
  function mostrarMensajeError(texto) {
    $("#mensaje").text(texto).css("color", "red");
  }
});
