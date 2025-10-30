document.addEventListener("DOMContentLoaded", function () {
  function resolveImageUrl(path) {
    if (!path) return path;
    if (/^https?:\/\//i.test(path)) return path;
    try {
      if (typeof API_USUARIOS !== "undefined" && API_USUARIOS) {
        return (
          API_USUARIOS.replace(/\/api\/?$/, "") + "/" + path.replace(/^\//, "")
        );
      }
    } catch (e) {}
    return window.location.origin + "/" + path.replace(/^\//, "");
  }

  function addCacheBuster(url) {
    if (!url) return url;
    return url + (url.includes("?") ? "&" : "?") + "v=" + Date.now();
  }
  fetch("http://localhost:8000/api/perfil", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("tokenAcceso"),
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data) {
        document.getElementById("nombre").value = data.nombre || "";
        document.getElementById("apellido").value = data.apellido || "";
        document.getElementById("email").value = data.email || "";
        document.getElementById("departamento").value = data.departamento || "";
        document.getElementById("ciudad").value = data.ciudad || "";
        document.getElementById("ingresos").value =
          data.ingresos_mensuales || "";
        document.getElementById("estadoCivil").value = data.estado_civil || "";
        document.getElementById("documento").value = data.cedula || "";
        document.getElementById("fechaNacimiento").value =
          data.fecha_nacimiento || "";
        document.getElementById("telefono").value = data.telefono || "";
        document.getElementById("situacionLaboral").value =
          data.situacion_laboral || "";
        document.getElementById("cantidadIntegrantes").value =
          data.cantidad_integrantes || "";
        var img =
          document.querySelector(".perfil-form .foto-img") ||
          document.querySelector(".foto-img");
        if (data.foto_perfil) {
          if (img) {
            var resolved = resolveImageUrl(data.foto_perfil);
            var withV = addCacheBuster(resolved);
            img.src = withV;
            try {
              if (data.cedula) {
                sessionStorage.setItem("fotoPerfilUrl_" + data.cedula, withV);
              } else {
                sessionStorage.setItem("fotoPerfilUrl", withV);
              }
            } catch (e) {}
          }
        } else {
          if (img) {
            img.src = "src/img/user-placeholder.png";
          }
          try {
            if (data && data.cedula) {
              sessionStorage.removeItem("fotoPerfilUrl_" + data.cedula);
            }
          } catch (e) {}
        }
      }
    })
    .catch((error) => {});

  const form = document.querySelector(".perfil-form");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const ingresos = document.getElementById("ingresos").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const situacionLaboral = document
        .getElementById("situacionLaboral")
        .value.trim();
      const cantidadIntegrantes = document
        .getElementById("cantidadIntegrantes")
        .value.trim();
      const estadoCivil = document.getElementById("estadoCivil").value.trim();

      if (
        !email ||
        !ingresos ||
        !telefono ||
        !situacionLaboral ||
        !cantidadIntegrantes ||
        !estadoCivil
      ) {
        mostrarMensajeAlerta("error");
        return;
      }

      const payload = {
        email,
        ingresos_mensuales: ingresos,
        telefono,
        situacion_laboral: situacionLaboral,
        cantidad_integrantes: cantidadIntegrantes,
        estado_civil: estadoCivil,
      };

      fetch("http://localhost:8000/api/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("tokenAcceso"),
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          mostrarMensajeAlerta("exito");
        })
        .catch((err) => {
          mostrarMensajeAlerta("error");
        });
    });
  } else {
  }
});

function mostrarMensajeAlerta(tipo, mensaje) {
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
        }, 5000);
      }, 5000);
    });
}
