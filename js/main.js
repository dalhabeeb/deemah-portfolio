(function () {
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)").matches;

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      var args = arguments;
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

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

  /* ---- starfield: layered canvas, slow parallax, gentle twinkle ---- */
  (function starfield() {
    var canvas = document.getElementById("starfield");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, layers = [], scrollY = window.scrollY || 0;
    var running = true, rafId = null;

    function makeStars(n) {
      var arr = [];
      for (var i = 0; i < n; i++) {
        arr.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0,
          phase: Math.random() * Math.PI * 2
        });
      }
      return arr;
    }

    function buildLayers() {
      var mobile = window.innerWidth < 720;
      var counts = mobile ? [36, 18, 9] : [110, 55, 24];
      var specs = [
        { depth: 0.02, rMin: 0.5, rMax: 1.1, aMin: 0.2, aMax: 0.45, speed: 0.0006 },
        { depth: 0.05, rMin: 0.8, rMax: 1.5, aMin: 0.3, aMax: 0.6, speed: 0.0009 },
        { depth: 0.09, rMin: 1.2, rMax: 2.1, aMin: 0.45, aMax: 0.85, speed: 0.0013 }
      ];
      layers = specs.map(function (spec, i) {
        var stars = makeStars(counts[i]);
        stars.forEach(function (s) {
          s.r = spec.rMin + Math.random() * (spec.rMax - spec.rMin);
          s.aBase = spec.aMin + Math.random() * (spec.aMax - spec.aMin);
        });
        return { stars: stars, depth: spec.depth, speed: spec.speed };
      });
    }

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildLayers();
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      layers.forEach(function (layer) {
        var dy = scrollY * layer.depth;
        layer.stars.forEach(function (s) {
          var y = ((s.y - dy) % h + h) % h;
          var a = s.aBase;
          if (!reduced) {
            a += Math.sin(t * layer.speed + s.phase) * 0.18;
          }
          a = Math.max(0, Math.min(1, a));
          ctx.beginPath();
          ctx.fillStyle = "rgba(255,255,255," + a + ")";
          ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      if (running) rafId = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", debounce(resize, 220));
    window.addEventListener("scroll", function () {
      scrollY = window.scrollY || window.pageYOffset;
    }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running && !rafId) rafId = requestAnimationFrame(draw);
      else if (!running && rafId) { cancelAnimationFrame(rafId); rafId = null; }
    });

    resize();
    rafId = requestAnimationFrame(draw);
  })();

  /* ---- custom cursor: glowing star dot with eased trail ---- */
  if (!isTouch) {
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
      if (reduced) {
        rx = mx; ry = my;
      } else {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
      }
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    var hoverables = document.querySelectorAll("a, button, .embed-frame, .link-card");
    hoverables.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        dot.classList.add("is-hover");
        ring.classList.add("is-hover");
      });
      el.addEventListener("mouseleave", function () {
        dot.classList.remove("is-hover");
        ring.classList.remove("is-hover");
      });
    });
  }

  /* ---- Sirius: brightens as the cursor approaches ---- */
  if (!isTouch) {
    var siriusCore = document.querySelector(".sirius-core");
    if (siriusCore) {
      window.addEventListener("mousemove", function (e) {
        var rect = siriusCore.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        var proximity = Math.max(0, 1 - dist / 420);
        var glow = 0.16 + proximity * 0.4;
        siriusCore.style.setProperty("--sirius-glow", glow.toFixed(2));
      }, { passive: true });
    }
  }

  /* ---- constellation: thin lines connecting the project numbers ---- */
  (function constellation() {
    var svg = document.querySelector(".constellation-svg");
    var list = document.querySelector(".projects-list");
    if (!svg || !list) return;

    function draw() {
      var indices = list.querySelectorAll(".project-index");
      if (!indices.length) return;
      var listRect = list.getBoundingClientRect();
      svg.setAttribute("height", listRect.height);

      var pts = [];
      indices.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var x = r.left - listRect.left + r.width / 2;
        var y = r.top - listRect.top + r.height / 2;
        pts.push([x, y]);
      });

      var d = pts.map(function (p, i) {
        return (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1);
      }).join(" ");

      var ns = "http://www.w3.org/2000/svg";
      svg.innerHTML = "";
      var path = document.createElementNS(ns, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);

      pts.forEach(function (p) {
        var c = document.createElementNS(ns, "circle");
        c.setAttribute("cx", p[0]);
        c.setAttribute("cy", p[1]);
        c.setAttribute("r", 3);
        svg.appendChild(c);
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(draw);
    }
    window.addEventListener("load", draw);
    window.addEventListener("resize", debounce(draw, 200));
    draw();
  })();
})();
