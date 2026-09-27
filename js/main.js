(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const backdrop = document.querySelector(".nav-backdrop");

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenuOpen = (open) => {
    if (!nav || !toggle) return;
    nav.classList.toggle("open", open);
    if (backdrop) {
      backdrop.classList.toggle("open", open);
      backdrop.hidden = !open;
    }
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setMenuOpen(!nav.classList.contains("open"));
    });
    if (backdrop) {
      backdrop.addEventListener("click", () => setMenuOpen(false));
    }
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setMenuOpen(false));
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setMenuOpen(false);
      }
    });
  }

  const video = document.querySelector(".hero-media video");
  if (video) {
    video.muted = true;
    video.playsInline = true;

    const showPosterFallback = () => {
      if (video.dataset.fallbackApplied === "1") return;
      video.dataset.fallbackApplied = "1";
      const poster = video.getAttribute("poster");
      if (!poster) return;
      const img = document.createElement("img");
      img.className = "poster-fallback";
      img.src = poster;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      video.replaceWith(img);
    };

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    const bootVideo = () => {
      if (video.dataset.booted === "1") return;
      video.dataset.booted = "1";
      const source = video.querySelector("source");
      const dataSrc = (source && source.getAttribute("data-src")) || video.getAttribute("data-src");
      if (dataSrc && source) {
        source.setAttribute("src", dataSrc);
      }
      video.addEventListener("error", showPosterFallback);
      if (source) source.addEventListener("error", showPosterFallback);
      if (typeof video.load === "function") video.load();
      tryPlay();
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          bootVideo();
        }
      }, { rootMargin: "200px" });
      io.observe(video);
    } else {
      bootVideo();
    }

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && video.dataset.booted === "1") tryPlay();
    });
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    nodes.forEach((n) => io.observe(n));
  }
})();
