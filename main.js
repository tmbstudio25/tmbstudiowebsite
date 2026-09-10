/* ============================================================
   TMB STUDIO — main.js
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ----------------------------------------------------------
     LANDING PAGE — Video
  ---------------------------------------------------------- */
  // Find your video using its ID
  const landingVideo = document.getElementById("landingVideo");

  // Set your cooldown time in milliseconds (3500ms = 3.5 seconds)
  const cooldownTime = 1000;

  // ONLY add listener if the video element exists on the current page
  if (landingVideo) {
    landingVideo.addEventListener("ended", () => {
      // Wait for the cooldown time, then play it again
      setTimeout(() => {
        landingVideo.play();
      }, cooldownTime);
    });
  }

  /* ----------------------------------------------------------
     LANDING PAGE — Enter button
  ---------------------------------------------------------- */
  const landing = document.getElementById("landing");
  const enterBtn = document.getElementById("enterBtn");

  if (enterBtn && landing) {
    enterBtn.addEventListener("click", () => {
      landing.classList.add("hidden");
      // Re-enable body scroll
      document.body.style.overflow = "";
    });
    // Prevent scroll while landing is shown
    document.body.style.overflow = "hidden";
  }

  /* ----------------------------------------------------------
     NAVBAR — scroll class + mobile toggle
  ---------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  });

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
    // Close on link click
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => navLinks.classList.remove("open"));
    });
  }

  // Active nav link on scroll
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => {
            a.classList.toggle(
              "active",
              a.getAttribute("href") === "#" + entry.target.id,
            );
          });
        }
      });
    },
    { threshold: 0.4 },
  );

  sections.forEach((s) => observer.observe(s));

  /* ----------------------------------------------------------
     ABOUT CAROUSEL
  ---------------------------------------------------------- */
  initCarousel({
    trackSelector: "#aboutCarouselTrack",
    dotsSelector: "#aboutDots",
    prevBtn: "#aboutPrev",
    nextBtn: "#aboutNext",
    slideCount: 4,
  });

   /* ----------------------------------------------------------
    NGILAI CAROUSEL (ngilai.html)
---------------------------------------------------------- */
   initCarousel({
     trackSelector: "#game1CarouselTrack",
     dotsSelector: "#game1Dots",
     prevBtn: "#game1Prev",
     nextBtn: "#game1Next",
     slideCount: 2, // Automatically handles just 2 images!
   });

/* ----------------------------------------------------------
    LIFE GACHA CAROUSEL (lifegacha.html)
---------------------------------------------------------- */
   initCarousel({
     trackSelector: "#game2CarouselTrack",
     dotsSelector: "#game2Dots",
     prevBtn: "#game2Prev",
     nextBtn: "#game2Next",
     slideCount: 2, // Automatically handles just 3 images!
   });

  /* ----------------------------------------------------------
     PROJECTS CAROUSEL
  ---------------------------------------------------------- */
  initProjectCarousel();

  /* ----------------------------------------------------------
     FEATURED PROJECT VIDEO — cooldown replay
     NOTE: The video must NOT have the `loop` attribute in HTML.
     `loop` makes the browser restart the video itself, which
     never fires the `ended` event, so the cooldown never runs.
     We handle looping here in JS instead, with a delay.
  ---------------------------------------------------------- */
  const featuredprojectVideo = document.getElementById("featuredprojectVideo");
  const projectCooldownTime = 4000; // milliseconds to pause between replays

  if (featuredprojectVideo) {
    featuredprojectVideo.addEventListener("ended", () => {
      setTimeout(() => {
        featuredprojectVideo.currentTime = 0;
        featuredprojectVideo.play();
      }, projectCooldownTime);
    });
  }

  /* ----------------------------------------------------------
     SCROLL REVEAL
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealEls.forEach((el) => revealObs.observe(el));
});

/* ----------------------------------------------------------
   Generic Carousel Factory
   Slides are a fixed 16:9 (1920x1080) ratio via CSS
   (.carousel-wrap { aspect-ratio: 16/9 }), so no JS height
   measuring is needed — every image crops to the same frame.
---------------------------------------------------------- */
function initCarousel({
  trackSelector,
  dotsSelector,
  prevBtn,
  nextBtn,
  slideCount,
}) {
  const track = document.querySelector(trackSelector);
  const dotsEl = document.querySelector(dotsSelector);
  const prev = document.querySelector(prevBtn);
  const next = document.querySelector(nextBtn);

  if (!track) return;

  let current = 0;

  // Build dots
  if (dotsEl) {
    dotsEl.innerHTML = "";
    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement("button");
      dot.className = "carousel-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", `Slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsEl.appendChild(dot);
    }
  }

  function goTo(n) {
    current = (n + slideCount) % slideCount;
    track.style.transform = `translateX(-${current * 100}%)`;
    if (dotsEl) {
      dotsEl
        .querySelectorAll(".carousel-dot")
        .forEach((d, i) => d.classList.toggle("active", i === current));
    }
  }

  prev && prev.addEventListener("click", () => goTo(current - 1));
  next && next.addEventListener("click", () => goTo(current + 1));

  // Auto-advance every 5s
  setInterval(() => goTo(current + 1), 5000);
}

/* ----------------------------------------------------------
   Projects Carousel (2 cards visible)
---------------------------------------------------------- */
function initProjectCarousel() {
  const track = document.getElementById("projectTrack");
  const dotsEl = document.getElementById("projectDots");
  const prevBtn = document.getElementById("projectPrev");
  const nextBtn = document.getElementById("projectNext");

  if (!track) return;

  const cards = track.querySelectorAll(".project-card");
  const total = Math.ceil(cards.length / 2); // pages of 2
  let page = 0;

  // Build dots
  if (dotsEl) {
    dotsEl.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const dot = document.createElement("button");
      dot.className = "project-dot" + (i === 0 ? " active" : "");
      dot.addEventListener("click", () => goTo(i));
      dotsEl.appendChild(dot);
    }
  }

  function goTo(n) {
    page = (n + total) % total;
    const cardW = cards[0].offsetWidth + 32; // 32 = gap
    track.style.transform = `translateX(-${page * cardW * 2}px)`;
    if (dotsEl) {
      dotsEl
        .querySelectorAll(".project-dot")
        .forEach((d, i) => d.classList.toggle("active", i === page));
    }
  }

  prevBtn && prevBtn.addEventListener("click", () => goTo(page - 1));
  nextBtn && nextBtn.addEventListener("click", () => goTo(page + 1));
}

/* ----------------------------------------------------------
   PEEK CAROUSEL — Framer-style, one card centered at a time
---------------------------------------------------------- */
function initPeekCarousel() {
  const track   = document.getElementById('peekTrack');
  const dotsEl  = document.getElementById('peekDots');
  const prevBtn = document.getElementById('peekPrev');
  const nextBtn = document.getElementById('peekNext');

  if (!track) return;

  const cards   = Array.from(track.querySelectorAll('.peek-card'));
  const total   = cards.length;
  let current   = 0;

  // Build dots
  if (dotsEl) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'peek-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Project ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });
  }

  // Clicking a non-active card navigates to it
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (i !== current) goTo(i);
    });
  });

  function goTo(n) {
    current = (n + total) % total;

    // Update active class
    cards.forEach((c, i) => c.classList.toggle('active', i === current));

    // Slide the track so current card is centered
    const cardW  = cards[0].offsetWidth;
    const gap    = 32; // matches CSS gap: 2rem
    const offset = current * (cardW + gap);
    track.style.transform = `translateX(-${offset}px)`;

    // Dots
    if (dotsEl) {
      dotsEl.querySelectorAll('.peek-dot')
        .forEach((d, i) => d.classList.toggle('active', i === current));
    }

    // Arrow disabled state
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;
  }

  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));

  // Initialise arrow states
  goTo(0);
}

// Call it on DOM ready (append to existing listener)
document.addEventListener('DOMContentLoaded', () => {
  initPeekCarousel();
});
