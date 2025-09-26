try {
  document.addEventListener("DOMContentLoaded", function () {
    if (window.Dropzone) {
      Dropzone.autoDiscover = false;
    } else {
      console.warn("Dropzone no está disponible (window.Dropzone undefined)");
    }
    var btnFoto = document.querySelector(".btn-foto");
    var dropzoneFoto = document.getElementById("fotoDropzone");
    function showAlert(type, message, timeoutMs) {
      timeoutMs = timeoutMs || 4000;
      var wrapper = document.createElement("div");
      var baseClass =
        type === "success" ? "alert alert-success" : "alert alert-danger";
      wrapper.className =
        baseClass +
        " d-flex align-items-center shadow-lg p-3 fade show alert-" +
        (type === "success" ? "exito" : "error");
      wrapper.setAttribute("role", "alert");

      var iconSpan = document.createElement("span");
      iconSpan.className =
        "d-flex align-items-center justify-content-center me-3";
      var icon = document.createElement("i");
      icon.className =
        type === "success"
          ? "fa-solid fa-check icon"
          : "fa-solid fa-xmark icon";
      iconSpan.appendChild(icon);

      var textSpan = document.createElement("span");
      textSpan.className =
        "fw-semibold " +
        (type === "success" ? "alert-exito-text" : "alert-error-text");
      textSpan.textContent = message;

      wrapper.appendChild(iconSpan);
      wrapper.appendChild(textSpan);
      document.body.appendChild(wrapper);

      setTimeout(function () {
        wrapper.classList.remove("show");
        setTimeout(function () {
          try {
            wrapper.remove();
          } catch (e) {}
        }, 350);
      }, timeoutMs);
    }
    var dz = null;
    if (btnFoto && dropzoneFoto) {
      dropzoneFoto.style.display = "none";

      function createBackdrop() {
        var b = document.createElement("div");
        b.id = "dzBackdrop";
        Object.assign(b.style, {
          position: "fixed",
          inset: "0",
          background: "rgba(0,0,0,0.45)",
          zIndex: 9998,
        });
        return b;
      }

      function openModal() {
        var existing = document.getElementById("dzBackdrop");
        if (!existing) document.body.appendChild(createBackdrop());

        dropzoneFoto._prevStyles = {
          display: dropzoneFoto.style.display || "",
          position: dropzoneFoto.style.position || "",
          left: dropzoneFoto.style.left || "",
          top: dropzoneFoto.style.top || "",
          transform: dropzoneFoto.style.transform || "",
          zIndex: dropzoneFoto.style.zIndex || "",
        };
        Object.assign(dropzoneFoto.style, {
          display: "block",
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          minWidth: "340px",
        });
      }

      function closeModal() {
        var b = document.getElementById("dzBackdrop");
        if (b) b.remove();
        if (dropzoneFoto._prevStyles) {
          Object.assign(dropzoneFoto.style, dropzoneFoto._prevStyles);
          delete dropzoneFoto._prevStyles;
        }
        dropzoneFoto.style.display = "none";
      }

      document.addEventListener("click", function (e) {
        var b = document.getElementById("dzBackdrop");
        if (b && e.target === b) closeModal();
      });

      document.addEventListener("click", function (e) {
        var btn = e.target.closest && e.target.closest(".btn-foto");
        if (!btn) return;
        dropzoneFoto = document.getElementById("fotoDropzone");
        if (!dropzoneFoto) {
          console.warn(
            "dropzone.js: no se encontró #fotoDropzone al abrir modal"
          );
          return;
        }
        openModal();
        if (!dz) {
          try {
            dz = new Dropzone(dropzoneFoto, {
              url: "http://localhost:8000/api/perfil/foto",
              paramName: "foto",
              maxFiles: 1,
              acceptedFiles: "image/*",
              headers: {
                Authorization:
                  "Bearer " + sessionStorage.getItem("tokenAcceso"),
              },
              clickable: true,
              init: function () {
                try {
                  if (this.hiddenFileInput) this.hiddenFileInput.click();
                  else {
                    var input =
                      dropzoneFoto.querySelector("input[type='file']");
                    if (input) input.click();
                  }
                } catch (err) {
                  console.warn(
                    "No se pudo abrir el selector automáticamente",
                    err
                  );
                }
              },
              success: function (file, response) {
                if (response && response.url_foto) {
                  var img = document.querySelector(".foto-img");
                  if (img) img.src = response.url_foto;
                  try {
                    sessionStorage.setItem("fotoPerfilUrl", response.url_foto);
                  } catch (e) {}
                }
                showAlert("success", "Foto subida correctamente");
                closeModal();
              },
              error: function (file, response) {
                showAlert("error", "Error al subir la foto");
              },
              autoProcessQueue: true,
            });
          } catch (initErr) {
            console.error(
              "dropzone.js: fallo al inicializar Dropzone",
              initErr
            );
            return;
          }
        } else {
          try {
            if (dz.hiddenFileInput) dz.hiddenFileInput.click();
            else {
              var input = dropzoneFoto.querySelector("input[type='file']");
              if (input) input.click();
            }
          } catch (err) {
            console.warn("No se pudo abrir el selector automáticamente", err);
          }
        }
      });
    }
  });
} catch (e) {
  console.error("Error en dropzone.js:", e);
}
