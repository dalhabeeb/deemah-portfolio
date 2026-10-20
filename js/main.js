(function () {
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- scroll reveal: soft fade, gentle upward drift ---- */
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
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      observer.observe(el);
    });
  }

  /* ---- atmosphere: a few pixels of scroll parallax, nothing more ---- */
  if (!reduced) {
    var atmosImgs = document.querySelectorAll(".atmosphere img");
    if (atmosImgs.length) {
      var ticking = false;
      function updateParallax() {
        var y = window.scrollY || window.pageYOffset;
        atmosImgs.forEach(function (img) {
          var offset = Math.max(-18, Math.min(18, y * 0.03));
          img.style.transform = "translateY(" + offset + "px)";
        });
        ticking = false;
      }
      window.addEventListener("scroll", function () {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      }, { passive: true });
    }
  }
})();
