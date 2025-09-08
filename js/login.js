$(document).ready(function () {
  let tokenAcceso = null;

  $("#form-login").on("submit", function (evento) {
    evento.preventDefault();

    const cedula = $("#cedula").val().trim();
    const contrasena = $("#contrasena").val();

    $.ajax({
      url: API_USUARIOS + "/iniciar-sesion",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ cedula: cedula, password: contrasena }),
      success: function (datos) {
        tokenAcceso = datos.access_token || datos.token || datos.accessToken;
        cargarPerfil();
        mostrarMensajeOk("Sesión iniciada");
      },
      error: function (xhr) {
        const respuesta = xhr.responseJSON || {};
        mostrarMensajeError(respuesta.error || "No fue posible iniciar sesión");
      }
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
      }
    });
  }

  function mostrarMensajeOk(texto) { $("#mensaje").text(texto).css("color", "green"); }
  function mostrarMensajeError(texto) { $("#mensaje").text(texto).css("color", "red"); }

});