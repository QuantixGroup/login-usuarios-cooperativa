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

  function showAlert(type, message) {
    var alert = document.createElement("div");
    var alertClass =
      "alert alert-" +
      (type === "success" ? "success" : "danger") +
      " alert-dismissible fade show";
    alert.className = alertClass;
    alert.style.cssText =
      "position: fixed; top: 20px; right: 20px; z-index: 10000; min-width: 300px;";

    var iconClass = type === "success" ? "check" : "xmark";
    alert.innerHTML =
      '<i class="fa-solid fa-' +
      iconClass +
      ' me-2"></i>' +
      message +
      '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';

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
              if (response && response.url_foto) {
                var profileImg = document.querySelector(".foto-img");
                if (profileImg) {
                  profileImg.src = response.url_foto;
                }

                try {
                  sessionStorage.setItem("fotoPerfilUrl", response.url_foto);
                } catch (e) {}
              }

              showAlert("success", "Foto subida correctamente");
              setTimeout(closeDropzoneModal, 1500);
            },
            error: function (file, errorMessage) {
              showAlert("error", "Error al subir la foto. Intenta de nuevo.");
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
