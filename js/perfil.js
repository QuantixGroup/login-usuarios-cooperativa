document.addEventListener("DOMContentLoaded", function () {
  var btnFoto = document.querySelector(".btn-foto");
  var dropzoneFoto = document.getElementById("fotoDropzone");
  var dz = null;
  if (btnFoto && dropzoneFoto) {
    dropzoneFoto.style.display = "none";
    btnFoto.addEventListener("click", function () {
      dropzoneFoto.style.display = "block";
      if (!dz) {
        dz = new Dropzone(dropzoneFoto, {
          paramName: "foto",
          maxFiles: 1,
          acceptedFiles: "image/*",
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("tokenAcceso"),
          },
          success: function (file, response) {
            if (response && response.url) {
              var img = document.querySelector(".foto-img");
              if (img) img.src = response.url;
            }
            alert("Foto subida correctamente");
          },
          error: function (file, response) {
            alert("Error al subir la foto");
          },
          autoProcessQueue: true,
        });
      }
      setTimeout(function () {
        var dzInput = dropzoneFoto.querySelector("input[type='file']");
        if (dzInput) dzInput.click();
      }, 300);
    });
  }
});
