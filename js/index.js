$(document).ready(function () {
  const token = sessionStorage.getItem("tokenAcceso");
  if (!token) {
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
      sessionStorage.clear();
      window.location.href = "login.html";
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
      url: API_COOPERATIVA
        ? API_COOPERATIVA + "/horas/registro"
        : "http://127.0.0.1:8001/api/horas/registro",
      type: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      data: JSON.stringify({
        fecha: $("#fecha").val(),
        conteo_de_horas: parseFloat($("#cantidad").val() || 0),
        tipo_trabajo: $("#tipo").val(),
        descripcion: $("#motivo").val(),
      }),
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

  window.loadHorasResumen = async function () {
    try {
      const base =
        typeof API_COOPERATIVA !== "undefined"
          ? API_COOPERATIVA
          : typeof API_USUARIOS !== "undefined"
          ? API_USUARIOS
          : "http://localhost:8000/api";
      const url = base + "/horas";
      const token =
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("tokenAcceso") ||
        "";
      const options = token
        ? { headers: { Authorization: "Bearer " + token } }
        : {};
      const res = await fetch(url, options);
      let list = [];
      if (res.ok) {
        const data = await res.json();
        list = Array.isArray(data) ? data : data.data || [];
      } else {
      }

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      let total = 0;

      for (const r of list) {
        const d = new Date(r.fecha + "T00:00:00");
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          total += Number(r.horas) || 0;
        }
      }

      const card = $(".card").filter(function () {
        return (
          $(this).find("h5.card-title").first().text().trim() ===
          "Horas trabajadas"
        );
      });
      if (card.length) {
        const body = card.find(".card-body").first();
        let container = body.find(".horas-resumen");
        if (!container.length) {
          const title = body.find("h5.card-title").first();
          container = $('<div class="horas-resumen mt-2"></div>');
          title.after(container);
        }

        const groups = {};
        for (const r of list) {
          const d = new Date(r.fecha + "T00:00:00");
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          if (!groups[key])
            groups[key] = {
              label: new Intl.DateTimeFormat("es-ES", {
                month: "long",
                year: "numeric",
              }).format(d),
              items: [],
            };
          groups[key].items.push(r);
        }

        const keys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));
        const showKeys = keys.slice(0, 3);

        const out = [];
        out.push(
          `<p class="mb-1">Total este mes: <strong>${total.toFixed(
            2
          )} h</strong></p>`
        );
        if (!showKeys.length) {
          out.push('<div class="small text-muted">No hay registros aún.</div>');
        } else {
          for (const k of showKeys) {
            const g = groups[k];
            out.push(`<div class="mt-2"><strong>${g.label}</strong></div>`);
            for (const it of g.items.slice(0, 5)) {
              out.push(
                `<div class="hora-line small text-muted">${it.fecha} — ${Number(
                  it.horas
                ).toFixed(2)} h${
                  it.descripcion ? " — " + it.descripcion : ""
                }</div>`
              );
            }
          }
        }

        container.html(out.join("\n"));
      }
    } catch (e) {}
  };
});
