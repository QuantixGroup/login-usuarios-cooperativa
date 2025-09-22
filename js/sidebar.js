$(document).ready(function () {
  var faHref =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
  var faPresent = false;
  document.querySelectorAll('link[rel="stylesheet"]').forEach(function (link) {
    var href = link.getAttribute("href") || "";
    if (
      href.indexOf("font-awesome") !== -1 ||
      href.indexOf("all.min.css") !== -1 ||
      href.indexOf("fontawesome") !== -1
    ) {
      faPresent = true;
    }
  });
  if (!faPresent) {
    var linkEl = document.createElement("link");
    linkEl.rel = "stylesheet";
    linkEl.href = faHref;
    document.head.appendChild(linkEl);
  }

  $("#sidebar").load("sidebar.html", function () {
    var currentUrl = new URL(window.location.href);
    $(this)
      .find("a.nav-link")
      .each(function () {
        var link = $(this);
        var href = link.attr("href");
        if (!href) return;
        try {
          var resolved = new URL(href, window.location.href);
          var linkPath = resolved.pathname.replace(/\/+$/, "");
          var currentPath = currentUrl.pathname.replace(/\/+$/, "");
          var samePath = linkPath === currentPath;
          var sameBasename =
            linkPath.split("/").pop() === currentPath.split("/").pop();

          if (samePath || sameBasename) {
            link.addClass("active").attr("aria-current", "page");
          } else {
            link.removeClass("active").removeAttr("aria-current");
          }
        } catch (e) {
        }
      });
  });
});
