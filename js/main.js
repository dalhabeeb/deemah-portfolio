(function () {
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---- scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduced) {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      observer.observe(el);
    });
  }

  /* ---- path stops light up as they're reached ---- */
  var stops = document.querySelectorAll("[data-stop]");
  if (stops.length) {
    if (!("IntersectionObserver" in window) || reduced) {
      stops.forEach(function (el) { el.classList.add("in-view"); });
    } else {
      var stopObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              stopObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35, rootMargin: "0px 0px -15% 0px" }
      );
      stops.forEach(function (el) { stopObserver.observe(el); });
    }
  }

  /* ---- custom cursor ---- */
  if (!isTouch && !reduced) {
    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    var ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
    });

    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    var hoverables = document.querySelectorAll("a, button, .link-card, .embed-frame");
    hoverables.forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("is-hover"); });
    });
  }
})();
