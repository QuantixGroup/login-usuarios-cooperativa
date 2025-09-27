document.addEventListener("DOMContentLoaded", function () {
  try {
    var fotoUrlSession = sessionStorage.getItem("fotoPerfilUrl");
    if (fotoUrlSession) {
      var imgSess = document.querySelector(".foto-img");
      if (imgSess) imgSess.src = fotoUrlSession;
    }
  } catch (e) {}
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
        if (data.foto_url) {
          var img = document.querySelector(".foto-img");
          if (img) img.src = data.foto_url;
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

function mostrarMensajeAlerta(tipo) {
  fetch("msj-alertas.html")
    .then((response) => response.text())
    .then((html) => {
      let temp = document.createElement("div");
      temp.innerHTML = html;
      let msg;
      if (tipo === "exito") {
        msg = temp.querySelector(".alert-success");
      } else {
        msg = temp.querySelector(".alert-danger");
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
