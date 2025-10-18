document.addEventListener("DOMContentLoaded", function () {
  if (window.Dropzone) {
    Dropzone.autoDiscover = false;
  }

  var dropzoneInstance = null;

  function getAuthToken() {
    var token =
      sessionStorage.getItem("tokenAcceso") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("tokenAcceso") ||
      localStorage.getItem("token");

    return token;
  }

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

  function safeMostrarMensaje(type, message) {
    try {
      if (typeof mostrarMensajeAlerta === "function") {
        var tipo = type === "success" ? "exito" : "error";
        mostrarMensajeAlerta(tipo, message);
        return;
      }
    } catch (e) {}

    var alert = document.createElement("div");
    var alertClass =
      "alert alert-" +
      (type === "success" ? "success" : "danger") +
      " alert-dismissible fade show";
    alert.className = alertClass;
    alert.style.cssText =
      "position: fixed; top: 20px; right: 20px; z-index: 10000; min-width: 300px;";
    alert.innerText =
      message ||
      (type === "success" ? "Operación exitosa" : "Ocurrió un error");
    document.body.appendChild(alert);
    setTimeout(function () {
      alert.remove();
    }, 3000);
  }

  function openDropzoneModal() {
    var dropzoneEl = document.getElementById("fotoDropzone");
    if (!dropzoneEl) return;

    var backdrop = document.createElement("div");
    backdrop.id = "dropzone-backdrop";
    backdrop.style.cssText =
      "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9998;";
    document.body.appendChild(backdrop);

    dropzoneEl.style.cssText =
      "display: block; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); min-width: 400px;";

    backdrop.onclick = function () {
      closeDropzoneModal();
    };
  }

  function closeDropzoneModal() {
    var dropzoneEl = document.getElementById("fotoDropzone");
    var backdrop = document.getElementById("dropzone-backdrop");

    if (dropzoneEl) {
      dropzoneEl.style.display = "none";
    }
    if (backdrop) {
      backdrop.remove();
    }
  }

  document.addEventListener("click", function (e) {
    if (
      e.target.matches(".btn-foto-perfil") ||
      e.target.closest(".btn-foto-perfil")
    ) {
      e.preventDefault();

      var dropzoneEl = document.getElementById("fotoDropzone");
      if (!dropzoneEl) {
        return;
      }

      openDropzoneModal();

      var authToken = getAuthToken();
      if (!authToken) {
        showAlert(
          "error",
          "No se encontró token de autorización. Inicia sesión nuevamente."
        );
        closeDropzoneModal();
        return;
      }

      if (dropzoneEl.dropzone) {
        dropzoneEl.dropzone.destroy();
        dropzoneInstance = null;
      }

      if (!dropzoneInstance) {
        try {
          dropzoneInstance = new Dropzone(dropzoneEl, {
            url: "http://localhost:8000/api/perfil/foto",
            paramName: "foto",
            maxFiles: 1,
            acceptedFiles: "image/*",
            addRemoveLinks: true,
            dictDefaultMessage:
              "Arrastra una imagen aquí o haz click para seleccionar",
            dictRemoveFile: "Eliminar",
            headers: {
              Authorization: "Bearer " + authToken,
            },
            success: function (file, response) {
              var imageUrl = null;
              if (response) {
                imageUrl =
                  response.foto_perfil ||
                  response.url_foto ||
                  (response.data &&
                    (response.data.foto_perfil || response.data.url_foto));
              }

              if (imageUrl) {
                var resolved = resolveImageUrl(imageUrl);
                var withV = addCacheBuster(resolved);
                var fotoElem =
                  document.querySelector(".perfil-form .foto-img") ||
                  document.querySelector(".foto-img");
                if (fotoElem) {
                  fotoElem.src = withV;
                }

                try {
                  var cedula = document.getElementById("documento")
                    ? document.getElementById("documento").value
                    : null;
                  if (cedula) {
                    sessionStorage.setItem("fotoPerfilUrl_" + cedula, withV);
                  } else {
                    sessionStorage.setItem("fotoPerfilUrl", withV);
                  }
                } catch (e) {}
              }

              safeMostrarMensaje(
                "success",
                "Imagen de perfil actualizado correctamente"
              );
              setTimeout(closeDropzoneModal, 1500);
            },
            error: function (file, errorMessage) {
              safeMostrarMensaje(
                "error",
                "Error al subir la foto. Intenta de nuevo."
              );
            },
            removedfile: function (file) {
              file.previewElement.remove();
            },
          });
        } catch (error) {
          showAlert("error", "Error al inicializar el sistema de carga");
          return;
        }
      }

      setTimeout(function () {
        try {
          if (dropzoneInstance.hiddenFileInput) {
            dropzoneInstance.hiddenFileInput.click();
          }
        } catch (error) {}
      }, 100);
    }
  });
});
