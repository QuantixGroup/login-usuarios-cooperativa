document.addEventListener("DOMContentLoaded", () => {
  const t = document.getElementById("pagos-tbody");
  if (!t) return;
  const API_COOP =
    (typeof API_COOPERATIVA !== "undefined" && API_COOPERATIVA) ||
    "http://localhost:8001/api";
  const API_USERS =
    (typeof API_USUARIOS !== "undefined" && API_USUARIOS) ||
    "http://localhost:8000/api";
  const token =
    sessionStorage.getItem("token") || sessionStorage.getItem("tokenAcceso");
  const tpl = document.getElementById("pagos-template");
  const getCedula = async () => {
    try {
      const r = await fetch(API_USERS + "/perfil", {
        headers: token ? { Authorization: "Bearer " + token } : {},
      });
      if (!r.ok) return null;
      const d = await r.json();
      return d.cedula || null;
    } catch {
      return null;
    }
  };
  const mkBadge = (s) => {
    const k = (s || "").toString().trim().toLowerCase();
    return k === "aceptado"
      ? "bg-success text-white"
      : k === "pendiente"
      ? "bg-warning text-white"
      : k === "rechazado"
      ? "bg-danger text-white"
      : "bg-secondary text-white";
  };
  const addRow = (it) => {
    const id = it.id_pago || it.id || "";
    const estado = it.estado || "";
    const mes = it.mes || it.mes_pago || "";
    const anio = it.anio || "";
    const monto =
      it.monto != null
        ? Number(it.monto)
        : it.total != null
        ? Number(it.total)
        : "";
    const montoStr = monto === "" ? "" : Number(monto).toFixed(2);
    const obs = it.observacion || "";
    if (!tpl) {
      t.insertAdjacentHTML(
        "beforeend",
        `<tr data-recibo-id="${id}"><td>${id}</td><td><span class="estado-badge badge ${mkBadge(
          estado
        )}">${estado}</span></td><td>${mes}</td><td>${anio}</td><td>${montoStr}</td><td>${obs}</td><td><button class="btn-ver-recibo btn btn-sm" data-id="${id}">Abrir</button></td></tr>`
      );
      return;
    }
    const c = tpl.content.firstElementChild.cloneNode(true);
    c.dataset.reciboId = id;
    c.querySelector(".td-id").textContent = id;
    const eb = c.querySelector(".td-estado .estado-badge");
    eb.className =
      "estado-badge badge " + mkBadge(estado) + " rounded-pill px-2 py-1";
    eb.textContent = estado;
    c.querySelector(".td-mes").textContent = mes;
    c.querySelector(".td-anio").textContent = anio;
    c.querySelector(".td-monto").textContent = montoStr;
    c.querySelector(".td-observacion").textContent = obs;
    c.querySelector(".btn-ver-recibo").dataset.id = id;
    t.appendChild(c);
  };
  t.addEventListener("click", async (e) => {
    const b = e.target.closest && e.target.closest(".btn-ver-recibo");
    if (!b) return;
    e.preventDefault();
    const id = b.dataset.id;
    if (!id) return;
    try {
      const r = await fetch(
        `${API_COOP}/recibos/${encodeURIComponent(id)}/pdf`,
        { headers: token ? { Authorization: "Bearer " + token } : {} }
      );
      if (!r.ok) throw 1;
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 6e4);
    } catch {
      alert("No se pudo abrir el recibo");
    }
  });
  window.loadPagosFromApi = async () => {
    const ced = await getCedula();
    if (!ced) return;
    t.innerHTML = "";
    try {
      const r = await fetch(`${API_COOP}/recibos/${encodeURIComponent(ced)}`, {
        headers: token ? { Authorization: "Bearer " + token } : {},
      });
      if (!r.ok) {
        t.insertAdjacentHTML(
          "beforeend",
          '<tr><td colspan="7">No hay registros</td></tr>'
        );
        return;
      }
      const d = await r.json();
      const list = Array.isArray(d) ? d : d.data || [];
      if (!list.length) {
        t.insertAdjacentHTML(
          "beforeend",
          '<tr><td colspan="7">No hay registros</td></tr>'
        );
        return;
      }
      list.forEach(addRow);
    } catch {
      t.insertAdjacentHTML(
        "beforeend",
        '<tr><td colspan="7">No hay registros</td></tr>'
      );
    }
  };
  window.loadPagosFromApi().catch(() => {});
});
