$(document).ready(function () {
  const token = sessionStorage.getItem("tokenAcceso");
  if (!token) {
    alert("Debes iniciar sesión primero");
    window.location.href = "login.html";
    return;
  }

  $.ajax({
    url: API_USUARIOS + "/perfil",
    type: "GET",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + token,
    },
    success: function (data) {
      $("#nombre").val(data.nombre);
      $("#apellido").val(data.apellido);
      $("#telefono").val(data.telefono);
      $("#direccion").val(data.direccion);
      const nombreCompleto = [data.nombre, data.apellido]
        .filter(Boolean)
        .join(" ");
      if (nombreCompleto) {
        $("#user-nombre").text(nombreCompleto);
      }
    },
    error: function () {
      alert("Error al cargar perfil");
    },
  });

  $("#formPerfil").submit(function (e) {
    e.preventDefault();
    $.ajax({
      url: API_USUARIOS + "/perfil",
      type: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      data: {
        nombre: $("#nombre").val(),
        apellido: $("#apellido").val(),
        telefono: $("#telefono").val(),
        direccion: $("#direccion").val(),
      },
      success: function () {
        alert("Perfil actualizado correctamente");
      },
      error: function () {
        alert("Error al actualizar perfil");
      },
    });
  });

  $("#formContrasena").submit(function (e) {
    e.preventDefault();
    $.ajax({
      url: API_USUARIOS + "/perfil/contrasena",
      type: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      data: {
        contrasena_actual: $("#actual").val(),
        contrasena_nueva: $("#nueva").val(),
        contrasena_nueva_confirmation: $("#confirmar").val(),
      },
      success: function () {
        alert("Contraseña cambiada con éxito");
      },
      error: function () {
        alert("Error al cambiar la contraseña");
      },
    });
  });

  $("#formHoras").submit(function (e) {
    e.preventDefault();
    $.ajax({
      url: "http://127.0.0.1:8001/api/horas",
      type: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      data: {
        fecha: $("#fecha").val(),
        cantidad: $("#cantidad").val(),
        tipo: $("#tipo").val(),
        motivo: $("#motivo").val(),
      },
      success: function () {
        alert("Horas registradas correctamente");
      },
      error: function () {
        alert("Error al registrar horas");
      },
    });
  });

  $("#formComprobante").submit(function (e) {
    e.preventDefault();
    let formData = new FormData(this);
    $.ajax({
      url: "http://127.0.0.1:8001/api/comprobantes",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      processData: false,
      contentType: false,
      data: formData,
      success: function () {
        alert("Comprobante subido con éxito");
      },
      error: function () {
        alert("Error al subir comprobante");
      },
    });
  });

  $("#btnSalir").click(function () {
    $.ajax({
      url: API_USUARIOS + "/cerrar-sesion",
      type: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      complete: function () {
        sessionStorage.removeItem("tokenAcceso");
        window.location.href = "login.html";
      },
    });
  });
});
