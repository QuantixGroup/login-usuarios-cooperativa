$(document).ready(function () {
    $('#form-login').on('submit', function (e) {
        e.preventDefault();

        const usuario = $('#documento').val();
        const password = $('#password').val();

        const data = {
            username: usuario,
            password: password,
            grant_type: "password",
            client_id: "2",
            client_secret: "gS2eYvsclkI1AGB0d9FAHTZK9stZXfczPsSMtfmj"
        };

        solicitarToken(data);
    });

    function solicitarToken(data) {
        $.ajax({
            url: "http://localhost:8000/oauth/token/",
            type: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify(data),
            success: manejarLoginExitoso,
            error: () => mostrarError("Credenciales incorrectas o cuenta no aprobada.")
        });
    }

    function manejarLoginExitoso(response) {
        localStorage.setItem("access_token", response.access_token);
        obtenerUsuario(response.access_token);
    }

    function obtenerUsuario(token) {
        $.ajax({
            url: "http://localhost:8000/api/validate",
            type: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Accept": "application/json"
            },
            success: redirigirPorRol,
            error: () => mostrarError("No se pudo validar al usuario.")
        });
    }

    function redirigirPorRol(user) {
        localStorage.setItem("usuario", user.nombre);
        if (user.rol === "admin") return redirigirAdmin();
        if (user.rol === "socio") return redirigirSocio();
        mostrarError("Rol desconocido.");
    }

    function redirigirAdmin() {
        window.location.href = "http://localhost:8001/socios";
    }

    function redirigirSocio() {
        window.location.href = "index.html";
    }

    function mostrarError(msg) {
        $('#error').html(`<div class="alert alert-danger">${msg}</div>`);
    }
});
