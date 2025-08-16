$(document).ready(function () {
    const token = localStorage.getItem("access_token");
    if (!token) return mostrarMensaje("Acceso no autorizado.");

    $.ajax({
        url: "http://localhost:8000/api/validate",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token,
            "Accept": "application/json"
        },
        success: mostrarBienvenida,
        error: () => mostrarMensaje("Sesión inválida. Iniciá sesión de nuevo.")
    });

    function mostrarBienvenida(user) {
        $("#bienvenida").text("Bienvenido, " + user.nombre);
    }

    function mostrarMensaje(msg) {
        $("#bienvenida").text(msg);
    }
});
