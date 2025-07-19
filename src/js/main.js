document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("password");
  const togglePasswordButton = document.getElementById("togglePassword");
  if (togglePasswordButton && passwordInput) {
    const eyeIcon = togglePasswordButton.querySelector("i");
    togglePasswordButton.addEventListener("click", function () {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      eyeIcon.classList.toggle("bi-eye-slash-fill");
      eyeIcon.classList.toggle("bi-eye-fill");
    });
  }

  const recordarCheckbox = document.getElementById("recordar");
  const documentoInput = document.getElementById("documento");
  const loginForm = document.querySelector("form");

  const documentoGuardado = localStorage.getItem("documentoUsuario");
  if (documentoGuardado) {
    documentoInput.value = documentoGuardado;
    recordarCheckbox.checked = true;
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function () {
      if (recordarCheckbox.checked) {
        localStorage.setItem("documentoUsuario", documentoInput.value);
      } else {
        localStorage.removeItem("documentoUsuario");
      }
    });
  }
});
