Dropzone.options.fotoDropzone = {
  paramName: "foto",
  maxFiles: 1,
  acceptedFiles: "image/*",
  headers: { Authorization: "Bearer " + sessionStorage.getItem("tokenAcceso") },
  success: function (file, response) {
    alert("Foto subida correctamente");
  },
  error: function (file, response) {
    alert("Error al subir la foto");
  },
};
