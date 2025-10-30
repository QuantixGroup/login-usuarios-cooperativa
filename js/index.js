$(document).ready(function () {
  const token = sessionStorage.getItem("tokenAcceso");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const esPrimerInicio = sessionStorage.getItem("primerInicio") === "true";
  if (esPrimerInicio) {
    window.location.href = "cambiar-password.html";
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

      try {
        if (typeof renderMeetings === "function") renderMeetings();
      } catch (e) {}
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
        try {
          if (typeof mostrarMensajeAlerta === "function")
            mostrarMensajeAlerta("exito", "Perfil actualizado correctamente");
          else alert("Perfil actualizado correctamente");
        } catch (e) {
          alert("Perfil actualizado correctamente");
        }
      },
      error: function () {
        try {
          if (typeof mostrarMensajeAlerta === "function")
            mostrarMensajeAlerta("error", "Error al actualizar perfil");
          else alert("Error al actualizar perfil");
        } catch (e) {
          alert("Error al actualizar perfil");
        }
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
        try {
          if (typeof mostrarMensajeAlerta === "function")
            mostrarMensajeAlerta("exito", "Contraseña cambiada con éxito");
          else alert("Contraseña cambiada con éxito");
        } catch (e) {
          alert("Contraseña cambiada con éxito");
        }
      },
      error: function () {
        try {
          if (typeof mostrarMensajeAlerta === "function")
            mostrarMensajeAlerta("error", "Error al cambiar la contraseña");
          else alert("Error al cambiar la contraseña");
        } catch (e) {
          alert("Error al cambiar la contraseña");
        }
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
        try {
          if (typeof mostrarMensajeAlerta === "function")
            mostrarMensajeAlerta("exito", "Horas registradas correctamente");
          else alert("Horas registradas correctamente");
        } catch (e) {
          alert("Horas registradas correctamente");
        }
      },
      error: function () {
        try {
          if (typeof mostrarMensajeAlerta === "function")
            mostrarMensajeAlerta("error", "Error al registrar horas");
          else alert("Error al registrar horas");
        } catch (e) {
          alert("Error al registrar horas");
        }
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
        try {
          if (typeof mostrarMensajeAlerta === "function")
            mostrarMensajeAlerta("exito", "Comprobante subido con éxito");
          else alert("Comprobante subido con éxito");
        } catch (e) {
          alert("Comprobante subido con éxito");
        }
      },
      error: function () {
        try {
          if (typeof mostrarMensajeAlerta === "function")
            mostrarMensajeAlerta("error", "Error al subir comprobante");
          else alert("Error al subir comprobante");
        } catch (e) {
          alert("Error al subir comprobante");
        }
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
        try {
          Object.keys(sessionStorage).forEach(function (k) {
            if (
              k &&
              (k === "fotoPerfilUrl" || k.indexOf("fotoPerfilUrl_") === 0)
            ) {
              sessionStorage.removeItem(k);
            }
          });
        } catch (e) {}
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

  function renderMeetings() {
    const meetings = [
      {
        title: "Asamblea General",
        date: "2025-11-14",
        time: "18:00",
        location: "Sede Central - Salón Principal",
        agenda: ["Informe de gestión", "Aprobación de estados financieros"],
      },
      {
        title: "Taller: Buenas Prácticas Cooperativas",
        date: "2025-12-01",
        time: "16:00",
        location: "Aula 3 - Centro Comunitario",
        agenda: ["Responsabilidades del socio", "Gestión participativa"],
      },
      {
        title: "Reunión Consejo Directivo y IAT",
        date: "2025-10-28",
        time: "19:30 – 21:00",
        location: "Sede Central - Sala de reuniones",
        agenda: [
          "Seguimiento del avance de la construcción",
          "Revisión del presupuesto de obra",
        ],
      },
      {
        title: "Taller de Rendición de Cuentas",
        date: "2025-11-05",
        time: "18:00 – 20:00",
        location: "Aula Magna - Centro Comunitario",
        agenda: [
          "Sesión informativa sobre la gestión de cuotas de amortización",
          "Presupuesto anual",
        ],
      },
      {
        title: "Debate: Derecho de Uso y Goce",
        date: "2025-11-12",
        time: "17:30 – 19:30",
        location: "Centro Cultural - Sala 1",
        agenda: [
          "Debates sobre el derecho de uso y goce de la vivienda",
          "Casos y experiencias en cooperativas de ayuda mutua",
        ],
      },
      {
        title: "Seminario: Financiamiento y Cupos",
        date: "2025-11-19",
        time: "10:00 – 12:00",
        location: "Salón de Actos - Centro Comunitario",
        agenda: [
          "Financiamiento y subsidios de permanencia",
          "Discusión sobre el llenado de cupos libres en cooperativas",
        ],
      },
    ];

    const $list = $("#meetings");
    if (!$list.length) return;
    $list.empty();

    meetings.forEach((m) => {
      const _d = new Date(m.date + "T00:00:00");
      const weekday = new Intl.DateTimeFormat("es-ES", { weekday: "short" })
        .format(_d)
        .replace(/\./g, "");
      const day = String(_d.getDate()).padStart(2, "0");
      const month = new Intl.DateTimeFormat("es-ES", { month: "short" })
        .format(_d)
        .replace(/\./g, "");
      const year = _d.getFullYear();
      const dateLabel = `${weekday}, ${day} ${month} ${year}`;

      const shortAgenda = m.agenda.slice(0, 2).map(escapeHtml).join(" • ");

      const $item = $(
        `<li class="list-group-item d-flex justify-content-between align-items-start">
            <div>
              <div class="fw-bold">${escapeHtml(m.title)}</div>
              <div class="small text-muted">${dateLabel} • ${escapeHtml(
          m.time
        )} — ${escapeHtml(m.location)}</div>
              <div class="mt-1 small">${shortAgenda}</div>
            </div>
            <div class="text-end">
              <button class="btn btn-sm btn-outline-primary btn-meeting-details" data-title="${escapeHtml(
                m.title
              )}">Ver detalles</button>
            </div>
          </li>`
      );

      $list.append($item);
    });

    $(document)
      .off("click", ".btn-meeting-details")
      .on("click", ".btn-meeting-details", function () {
        const title = $(this).data("title");
        const meeting = meetings.find((x) => x.title === title);
        if (!meeting) return;

        const agendaHtml = meeting.agenda
          .map((a) => `<li>${escapeHtml(a)}</li>`)
          .join("");
        const html = `
          <div><strong>${escapeHtml(meeting.title)}</strong></div>
          <div class="small text-muted">${escapeHtml(
            meeting.date
          )} • ${escapeHtml(meeting.time)} — ${escapeHtml(
          meeting.location
        )}</div>
          <div class="mt-2"><strong>Agenda:</strong><ul>${agendaHtml}</ul></div>
        `;

        if (typeof bootstrap !== "undefined") {
          const modalEl =
            document.getElementById("meetingDetailsModal") ||
            document.getElementById("_meetingDetailsModal");
          if (modalEl) {
            const titleEl = modalEl.querySelector(".modal-title");
            const bodyEl = modalEl.querySelector(".modal-body");
            if (titleEl) titleEl.textContent = meeting.title;
            if (bodyEl) bodyEl.innerHTML = html;
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
          } else {
            alert(
              `${escapeHtml(meeting.title)}\n\nAgenda:\n- ${meeting.agenda
                .map((a) => escapeHtml(a))
                .join("\n- ")}`
            );
          }
        } else {
          alert(
            `${escapeHtml(meeting.title)}\n\nAgenda:\n- ${meeting.agenda
              .map((a) => escapeHtml(a))
              .join("\n- ")}`
          );
        }
      });
  }

  function escapeHtml(unsafe) {
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
