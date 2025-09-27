(function (global) {
  async function ensureModalFragment(
    fragmentUrl,
    modalId,
    modalBodyId,
    fallbackHtml
  ) {
    let modalEl = document.getElementById(modalId);
    if (modalEl) {
      return {
        modalEl,
        modalBody: document.getElementById(modalBodyId),
        bs:
          bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl),
      };
    }

    try {
      const res = await fetch(fragmentUrl);
      if (res && res.ok) {
        const html = await res.text();
        if (
          html.includes(`id="${modalId}"`) ||
          html.includes(`id='${modalId}'`)
        ) {
          document.body.insertAdjacentHTML("beforeend", html);
        }
      }
    } catch (e) {}

    modalEl = document.getElementById(modalId);
    if (!modalEl && fallbackHtml) {
      document.body.insertAdjacentHTML("beforeend", fallbackHtml);
      modalEl = document.getElementById(modalId);
    }

    return {
      modalEl,
      modalBody: modalEl ? document.getElementById(modalBodyId) : null,
      bs: modalEl
        ? bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)
        : null,
    };
  }
  global.ensureModalFragment = ensureModalFragment;
})(window);
