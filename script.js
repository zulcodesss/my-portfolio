// Mobile navigation and its Escape-key behavior.
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Open navigation" : "Close navigation",
    );
    siteNav.classList.toggle("is-open", !isOpen);
  });
  siteNav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      siteNav.classList.remove("is-open");
    }),
  );
}

// Desktop navigation highlight pill. The Contact button is intentionally excluded.
if (siteNav) {
  const desktopNavLinks = Array.from(
    siteNav.querySelectorAll("a:not(.nav-contact)"),
  );
  const desktopNavQuery = window.matchMedia("(min-width: 761px)");
  let navPill = null;
  let activeNavLink = null;

  if (desktopNavLinks.length) {
    navPill = document.createElement("span");
    navPill.className = "nav-pill";
    navPill.setAttribute("aria-hidden", "true");
    siteNav.prepend(navPill);

    const positionPill = (link, fadeIn = false) => {
      if (!navPill || !link || !desktopNavQuery.matches) return;
      activeNavLink = link;
      navPill.style.width = `${link.offsetWidth}px`;
      navPill.style.transform = `translate(${link.offsetLeft}px, -50%)`;
      if (fadeIn) {
        navPill.classList.remove("is-visible");
        requestAnimationFrame(() => {
          if (activeNavLink === link && desktopNavQuery.matches)
            navPill.classList.add("is-visible");
        });
      } else {
        navPill.classList.add("is-visible");
      }
    };

    const hidePillIfIdle = () => {
      if (
        !siteNav.matches(":hover") &&
        !siteNav.contains(document.activeElement)
      ) {
        navPill?.classList.remove("is-visible");
        activeNavLink = null;
      }
    };

    desktopNavLinks.forEach((link) => {
      link.addEventListener("pointerenter", () => {
        if (desktopNavQuery.matches)
          positionPill(link, !navPill.classList.contains("is-visible"));
      });
      link.addEventListener("focusin", (event) => {
        if (desktopNavQuery.matches && event.target.matches(":focus-visible")) {
          positionPill(link, !navPill.classList.contains("is-visible"));
        }
      });
    });
    siteNav.addEventListener("pointerleave", hidePillIfIdle);
    siteNav.addEventListener("focusout", () =>
      requestAnimationFrame(hidePillIfIdle),
    );

    const resetForViewport = () => {
      if (!desktopNavQuery.matches) {
        navPill.classList.remove("is-visible");
        activeNavLink = null;
      } else if (activeNavLink) {
        positionPill(activeNavLink, false);
      }
    };
    window.addEventListener("resize", resetForViewport, { passive: true });
    if (document.fonts?.ready) document.fonts.ready.then(resetForViewport);
  }
}

// Wrap cards in stable, non-transformed perspective hit areas.
const initialWorkGrid = document.querySelector("#work .project-grid");
if (initialWorkGrid)
  initialWorkGrid.querySelectorAll(":scope > .project-card").forEach((card) => {
    if (card.parentElement.classList.contains("project-card-wrap")) return;
    const wrap = document.createElement("div");
    wrap.className = "project-card-wrap";
    if (card.classList.contains("reveal")) wrap.classList.add("reveal");
    card.classList.remove("reveal");
    card.before(wrap);
    wrap.appendChild(card);
  });

// Reusable decorative code-symbol layer, generated once at startup.
function initFloatSymbols(container, options = {}) {
  if (!container || container.dataset.floatSymbolsReady === "true") return;
  container.dataset.floatSymbolsReady = "true";
  const glyphs = [
    "</>",
    "{ }",
    ";",
    "#",
    "=>",
    "[ ]",
    "( )",
    "//",
    "&&",
    "::",
    "!=",
  ];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = window.matchMedia("(max-width: 760px)").matches;
  const tablet = window.matchMedia(
    "(min-width: 761px) and (max-width: 1024px)",
  ).matches;
  const count = options.count || (phone ? 10 : tablet ? 20 : 34);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const depth = i % 3 === 0 ? "far" : i % 3 === 1 ? "mid" : "near";
    const el = document.createElement("span");
    el.className = `float-symbol float-symbol-${depth}${Math.random() < 0.2 ? " is-accent" : ""}`;
    el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    const inSideMargin = Math.random() < 0.6;
    const x = inSideMargin
      ? Math.random() < 0.5
        ? Math.random() * 11
        : 89 + Math.random() * 10
      : Math.random() * 100;
    el.style.left = `${x}%`;
    el.style.top = `${Math.random() * 100}%`;
    el.style.setProperty(
      "--size",
      `${depth === "far" ? 48 + Math.random() * 24 : depth === "mid" ? 28 + Math.random() * 16 : 16 + Math.random() * 10}px`,
    );
    el.style.setProperty("--dx", `${Math.round(Math.random() * 140 - 70)}px`);
    el.style.setProperty("--dy", `${Math.round(Math.random() * 150 - 75)}px`);
    el.style.setProperty("--rot", `${Math.round(Math.random() * 50 - 25)}deg`);
    el.style.setProperty(
      "--dur",
      `${depth === "far" ? 40 + Math.random() * 15 : depth === "mid" ? 28 + Math.random() * 10 : 20 + Math.random() * 8}s`,
    );
    el.style.setProperty("--delay", `${-(Math.random() * 55)}s`);
    if (reduce) el.classList.add("is-static");
    frag.appendChild(el);
  }
  container.appendChild(frag);
  const section = container.closest("#work");
  if (section && "IntersectionObserver" in window && !reduce) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) =>
          section.classList.toggle("symbols-in-view", entry.isIntersecting),
        ),
      { threshold: 0.01 },
    );
    observer.observe(section);
  } else section?.classList.add("symbols-in-view");
}
const workDecorLayer = document.querySelector("#work .work-decor");
if (workDecorLayer) {
  const symbols = document.createElement("div");
  symbols.className = "float-symbols";
  symbols.setAttribute("aria-hidden", "true");
  workDecorLayer.appendChild(symbols);
  initFloatSymbols(symbols);
}

// Selected work: animated filters, colour-aware pointer effects, and local tag icons.
const filterButtons = [...document.querySelectorAll("#work [data-filter]")];
const projectCards = [...document.querySelectorAll("#work .project-card")];
const workSection = document.querySelector("#work");
const workGrid = document.querySelector("#work .project-grid");
const buildingStrip = document.querySelector("#work .currently-building");
const workDecor = document.querySelector("#work .work-decor");
const workPointerGlow = document.querySelector("#work .work-pointer-glow");
const workHeading = document.querySelector("#work .section-heading");
const projectCount = document.querySelector("#work .project-count-number");
const fineWorkPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const workReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Keep the decorative layer anchored to the full All work section height.
let workDecorMeasureTimer = 0;
function measureWorkDecorHeight() {
  if (
    !workSection ||
    !workDecor ||
    !filterButtons.some(
      (button) =>
        button.dataset.filter === "all" && button.classList.contains("active"),
    )
  )
    return;
  const height = workSection.getBoundingClientRect().height;
  if (height > 0)
    workSection.style.setProperty("--work-decor-h", `${Math.ceil(height)}px`);
}
function scheduleWorkDecorMeasure(delay = 0) {
  window.clearTimeout(workDecorMeasureTimer);
  workDecorMeasureTimer = window.setTimeout(measureWorkDecorHeight, delay);
}
const onWorkDecorResize = () => {
  if (
    filterButtons.some(
      (button) =>
        button.dataset.filter === "all" && button.classList.contains("active"),
    )
  )
    scheduleWorkDecorMeasure(150);
};
window.addEventListener("resize", onWorkDecorResize, { passive: true });
const measureAfterLoad = () => {
  if (document.fonts?.ready)
    document.fonts.ready.then(() => scheduleWorkDecorMeasure());
  else scheduleWorkDecorMeasure();
};
if (document.readyState === "complete") measureAfterLoad();
else window.addEventListener("load", measureAfterLoad, { once: true });

const tagIconPaths = {
  Kotlin: '<path d="M3 3h10L3 13zM8 8l5 5H3z"/>',
  Java: '<path d="M8 2c-2 2 2 2 0 4M5 6c-2 2 4 2 2 4M4 11c2 1 6 1 8 0M3 13c3 1 7 1 10 0"/>',
  Firebase: '<path d="M3 12 6 3l2 4 2-3 3 8-5 2z"/>',
  "Power Apps": '<path d="M3 3h4l6 10H9zM9 3h4L7 13H3z"/>',
  HTML: '<path d="m3 2 1 11 4 1 4-1 1-11zM5 5h6M5.5 8h5l-.4 3-2.1.6-2.1-.6"/>',
  CSS: '<path d="m3 2 1 11 4 1 4-1 1-11zM5 5h6M5 8h5l-.5 3-1.5.5-1.5-.5"/>',
  Bootstrap:
    '<rect x="2.5" y="2" width="11" height="12" rx="2"/><path d="M6 5h2.5a1.5 1.5 0 0 1 0 3H6zm0 3h3a1.5 1.5 0 0 1 0 3H6z"/>',
  PHP: '<path d="M2 8c2-3 10-3 12 0-2 3-10 3-12 0zM5 8h2m2 0h2"/>',
  MySQL: '<path d="M3 4c2-2 6-2 8 0v5c0 2-2 3-4 3M11 5c2 1 2 4 0 5M5 6h2"/>',
  JavaScript:
    '<rect x="2.5" y="2.5" width="11" height="11" rx="1"/><path d="M8 6v4c0 2-2 2-2 0M10 10c0 1 2 1 2 0 0-1-2-1-2-2s2-1 2 0"/>',
  "GitHub Pages": '<path d="M8 2 13 5v6l-5 3-5-3V5zM5 6l3 2 3-2M8 8v4"/>',
  Figma:
    '<path d="M6 2h4a2 2 0 0 1 0 4H6a2 2 0 0 1 0-4zm0 4h4a2 2 0 0 1 0 4H6a2 2 0 0 1 0-4zm0 4a2 2 0 1 0 0 4h2v-4zM10 6a2 2 0 1 0 0 4"/>',
};

function decorateTags(container = document.querySelector("#work")) {
  if (!container) return;
  const selector = container.matches?.(".project-tech-list, .skill-group-chips")
    ? "span"
    : ".tag-list span";
  container.querySelectorAll(selector).forEach((tag) => {
    if (tag.querySelector("svg")) return;
    const path = tagIconPaths[tag.textContent.trim()];
    if (!path) return;
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 16 16");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    icon.innerHTML = path;
    tag.prepend(icon);
  });
}
decorateTags();
document
  .querySelectorAll(".skill-group-chips")
  .forEach((container) => decorateTags(container));

let filterPill;
if (filterButtons.length) {
  const filterRow = filterButtons[0].parentElement;
  filterRow.classList.add("has-filter-pill");
  filterPill = document.createElement("span");
  filterPill.className = "filter-active-pill";
  filterPill.setAttribute("aria-hidden", "true");
  filterRow.prepend(filterPill);
}
function positionFilterPill(button, first = false) {
  if (!filterPill || !button) return;
  filterPill.style.width = `${button.offsetWidth}px`;
  filterPill.style.transform = `translate(${button.offsetLeft}px, ${button.offsetTop}px)`;
  filterPill.classList.add("is-ready");
  if (first) {
    filterPill.classList.add("is-instant");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => filterPill?.classList.remove("is-instant")),
    );
  }
}
if (filterButtons.length) {
  positionFilterPill(
    filterButtons.find((b) => b.classList.contains("active")),
    true,
  );
  window.addEventListener(
    "resize",
    () =>
      positionFilterPill(
        filterButtons.find((b) => b.classList.contains("active")),
      ),
    { passive: true },
  );
}

let filterChangeId = 0;
function animateFilter(selectedFilter) {
  const filterPass = ++filterChangeId;
  const visibleBefore = projectCards.filter(
    (card) => !card.classList.contains("is-hidden"),
  );
  const beforeRects = new Map(
    visibleBefore.map((card) => [card, card.getBoundingClientRect()]),
  );
  const leaving = projectCards.filter((card) => {
    const cats = (card.dataset.category || "").split(/\s+/);
    return (
      !card.classList.contains("is-hidden") &&
      selectedFilter !== "all" &&
      !cats.includes(selectedFilter)
    );
  });
  const entering = projectCards.filter((card) => {
    const cats = (card.dataset.category || "").split(/\s+/);
    return (
      card.classList.contains("is-hidden") &&
      (selectedFilter === "all" || cats.includes(selectedFilter))
    );
  });
  if (workReduceMotion.matches) {
    projectCards.forEach((card) => {
      const cats = (card.dataset.category || "").split(/\s+/);
      card.classList.toggle(
        "is-hidden",
        selectedFilter !== "all" && !cats.includes(selectedFilter),
      );
    });
  } else {
    leaving.forEach((card) => {
      card.classList.add("is-filter-leaving");
      card.closest(".project-card-wrap")?.classList.add("is-filter-leaving");
      card.style.pointerEvents = "none";
    });
    window.setTimeout(() => {
      if (filterPass !== filterChangeId) return;
      leaving.forEach((card) => {
        card.classList.add("is-hidden");
        card.classList.remove("is-filter-leaving");
        const wrap = card.closest(".project-card-wrap");
        wrap?.classList.add("is-hidden");
        wrap?.classList.remove("is-filter-leaving");
        card.style.pointerEvents = "";
      });
    }, 240);
    entering.forEach((card) => {
      card.classList.remove("is-hidden", "is-filter-leaving");
      card
        .closest(".project-card-wrap")
        ?.classList.remove("is-hidden", "is-filter-leaving");
      card.classList.add("is-filter-entering");
    });
    requestAnimationFrame(() => {
      projectCards
        .filter(
          (card) =>
            !card.classList.contains("is-hidden") && !entering.includes(card),
        )
        .forEach((card) => {
          const old = beforeRects.get(card);
          const next = card.getBoundingClientRect();
          if (!old) return;
          const dx = old.left - next.left,
            dy = old.top - next.top;
          if (dx || dy) {
            card.animate(
              [
                { transform: `translate(${dx}px, ${dy}px)` },
                { transform: "translate(0, 0)" },
              ],
              { duration: 300, easing: "cubic-bezier(.2,.75,.25,1)" },
            );
          }
        });
      entering.forEach((card) => {
        card.animate(
          [
            { opacity: 0, transform: "scale(.97)" },
            { opacity: 1, transform: "scale(1)" },
          ],
          { duration: 250, easing: "ease-out" },
        );
        card.classList.remove("is-filter-entering");
      });
    });
  }
  if (buildingStrip) {
    const show = selectedFilter === "all";
    buildingStrip.setAttribute("aria-hidden", String(!show));
    if (workReduceMotion.matches)
      buildingStrip.classList.toggle("is-hidden", !show);
    else if (show) {
      buildingStrip.classList.remove("is-hidden");
      requestAnimationFrame(() =>
        buildingStrip.classList.remove("is-filter-hidden"),
      );
    } else {
      buildingStrip.classList.add("is-filter-hidden");
      window.setTimeout(() => {
        if (buildingStrip.getAttribute("aria-hidden") === "true")
          buildingStrip.classList.add("is-hidden");
      }, 230);
    }
  }
  const count =
    selectedFilter === "all"
      ? projectCards.length
      : projectCards.filter((card) =>
          (card.dataset.category || "").split(/\s+/).includes(selectedFilter),
        ).length;
  const countLabel = document.querySelector('#work [data-filter="all"] span');
  if (countLabel) countLabel.textContent = String(count).padStart(2, "0");
}
filterButtons.forEach((button) =>
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;
    window.clearTimeout(workDecorMeasureTimer);
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    positionFilterPill(button);
    animateFilter(selectedFilter);
    if (selectedFilter === "all") scheduleWorkDecorMeasure(350);
  }),
);
filterButtons.forEach((button) =>
  button.addEventListener("focusin", () => {
    if (button.matches(":focus-visible")) positionFilterPill(button);
  }),
);

// Work section ambient effects pause when outside the viewport.
if (workSection && workDecor && "IntersectionObserver" in window) {
  const ambientObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) =>
        workSection.classList.toggle("work-in-view", entry.isIntersecting),
      ),
    { threshold: 0.02 },
  );
  ambientObserver.observe(workSection);
}

if (
  workSection &&
  workPointerGlow &&
  fineWorkPointer.matches &&
  !workReduceMotion.matches
) {
  let glowFrame = 0,
    pendingGlow = null;
  const setGlowFromCard = (card, event = null) => {
    const rect = card.getBoundingClientRect();
    const x = event ? event.clientX - rect.left : rect.width / 2;
    const y = event ? event.clientY - rect.top : rect.height / 2;
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
    workSection.style.setProperty(
      "--glow",
      card.dataset.glow || "var(--accent)",
    );
    const sectionRect = workSection.getBoundingClientRect();
    workSection.style.setProperty(
      "--glow-x",
      `${rect.left - sectionRect.left + rect.width / 2}px`,
    );
    workSection.style.setProperty(
      "--glow-y",
      `${rect.top - sectionRect.top + rect.height / 2}px`,
    );
    workSection.classList.add("has-card-glow");
  };
  projectCards.forEach((card) => {
    const hitArea = card.closest(".project-card-wrap") || card;
    hitArea.addEventListener("pointerenter", (event) =>
      setGlowFromCard(card, event),
    );
    hitArea.addEventListener(
      "pointermove",
      (event) => {
        pendingGlow = { card, event };
        if (glowFrame) return;
        glowFrame = requestAnimationFrame(() => {
          glowFrame = 0;
          if (pendingGlow) setGlowFromCard(pendingGlow.card, pendingGlow.event);
        });
      },
      { passive: true },
    );
    hitArea.addEventListener("pointerleave", () => {
      workSection.classList.remove("has-card-glow");
    });
    hitArea.addEventListener("focusin", () => setGlowFromCard(card));
    hitArea.addEventListener("focusout", (event) => {
      if (!hitArea.contains(event.relatedTarget))
        workSection.classList.remove("has-card-glow");
    });
  });
}

// Whole-card tilt uses a stable wrapper hit area; focus and touch do not tilt.
if (fineWorkPointer.matches && !workReduceMotion.matches)
  projectCards.forEach((card) => {
    const wrap = card.closest(".project-card-wrap");
    if (!wrap) return;
    let frame = 0,
      last = null;
    wrap.addEventListener(
      "pointermove",
      (event) => {
        last = event;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (!last || !wrap.matches(":hover") || workReduceMotion.matches)
            return;
          const rect = wrap.getBoundingClientRect();
          const nx = Math.max(
            -1,
            Math.min(1, ((last.clientX - rect.left) / rect.width) * 2 - 1),
          );
          const ny = Math.max(
            -1,
            Math.min(1, ((last.clientY - rect.top) / rect.height) * 2 - 1),
          );
          card.classList.add("is-tilting");
          card.style.setProperty("--tilt-x", `${-ny * 5}deg`);
          card.style.setProperty("--tilt-y", `${nx * 5}deg`);
          card.style.setProperty("--tilt-duration", "120ms");
          card.style.setProperty("--mx", `${last.clientX - rect.left}px`);
          card.style.setProperty("--my", `${last.clientY - rect.top}px`);
          wrap.classList.add("is-tilt-active");
        });
      },
      { passive: true },
    );
    const reset = () => {
      last = null;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      card.classList.remove("is-tilting");
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--tilt-duration", "500ms");
      wrap.classList.remove("is-tilt-active");
    };
    wrap.addEventListener("pointerleave", reset);
    wrap.addEventListener("focusin", reset);
  });

// Heading underline and project-count chip reveal when the heading enters view.
if (workHeading && projectCount) {
  const finishHeading = () => {
    workHeading.classList.add("work-heading-visible");
    if (workReduceMotion.matches) {
      projectCount.textContent = "04";
      return;
    }
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / 650);
      projectCount.textContent = String(Math.round(4 * progress)).padStart(
        2,
        "0",
      );
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (workReduceMotion.matches || !("IntersectionObserver" in window))
    finishHeading();
  else {
    const headingObserver = new IntersectionObserver(
      (entries, observer) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          finishHeading();
          observer.unobserve(entry.target);
        }),
      { threshold: 0.25 },
    );
    headingObserver.observe(workHeading);
  }
}

// Scroll-reveal animation is skipped for users who prefer reduced motion.
const revealItems = document.querySelectorAll(".reveal");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
if ("IntersectionObserver" in window && !reduceMotionQuery.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.12 },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Resume card: pointer state controls desktop; touch taps and keyboard focus are supported separately.
const flipCard = document.querySelector(".flip-card");
const frontFace = document.querySelector(".flip-card-front");
const backFace = document.querySelector(".flip-card-back");
const resumeOpenButton = document.querySelector(".resume-open-prompt");
const resumeModal = document.querySelector(".resume-modal");
const resumeClose = document.querySelector(".resume-close");
const resumePdf = "assets/Nik-Muhd-Zulkarnaiem-Resume.pdf";
const cardFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
let leaveTimer = 0;
let openedByKeyboard = false;
let resumeReturnFocus = null;
let lastOpenWasKeyboard = false;

function setCardSide(side) {
  if (!flipCard || !frontFace || !backFace) return;
  const showBack = side === "back";
  flipCard.dataset.side = showBack ? "back" : "front";
  flipCard.setAttribute(
    "aria-label",
    showBack
      ? "Resume preview. Use Click to open my resume to view the PDF."
      : "Flip to see my resume",
  );
  frontFace.setAttribute("aria-hidden", String(showBack));
  backFace.setAttribute("aria-hidden", String(!showBack));
  if (showBack) {
    frontFace.setAttribute("inert", "");
    backFace.removeAttribute("inert");
  } else {
    backFace.setAttribute("inert", "");
    frontFace.removeAttribute("inert");
  }
}

function syncCardAfterModalClose() {
  if (!flipCard || (resumeModal && resumeModal.open)) return;
  requestAnimationFrame(() => {
    if (!flipCard || (resumeModal && resumeModal.open)) return;
    setCardSide(flipCard.matches(":hover") ? "back" : "front");
  });
  // Some browsers update :hover only after the next pointer movement.
  const syncOnPointerMove = () => {
    if (resumeModal && resumeModal.open) return;
    setCardSide(flipCard.matches(":hover") ? "back" : "front");
    document.removeEventListener("pointermove", syncOnPointerMove);
  };
  document.addEventListener("pointermove", syncOnPointerMove, { once: true });
}

function openResume(event) {
  if (!flipCard || !resumeModal) return;
  const useNewTab =
    coarsePointer.matches || window.matchMedia("(max-width: 760px)").matches;
  lastOpenWasKeyboard = Boolean(event && event.detail === 0);
  openedByKeyboard = lastOpenWasKeyboard;
  if (useNewTab) {
    window.open(resumePdf, "_blank", "noopener,noreferrer");
    if (resumeOpenButton && !lastOpenWasKeyboard) resumeOpenButton.blur();
    return;
  }
  resumeReturnFocus = lastOpenWasKeyboard ? flipCard : null;
  flipCard.classList.add("modal-open");
  if (typeof resumeModal.showModal === "function") {
    resumeModal.showModal();
    if (resumeClose) resumeClose.focus();
  } else {
    window.open(resumePdf, "_blank", "noopener,noreferrer");
    flipCard.classList.remove("modal-open");
    syncCardAfterModalClose();
  }
  if (resumeOpenButton && !lastOpenWasKeyboard) resumeOpenButton.blur();
}

function closeResume() {
  if (resumeModal && resumeModal.open) resumeModal.close();
}

if (flipCard) {
  setCardSide("front");

  if (cardFinePointer.matches && !coarsePointer.matches) {
    flipCard.addEventListener("pointerenter", () => {
      window.clearTimeout(leaveTimer);
      if (
        !(resumeModal && resumeModal.open) &&
        !flipCard.classList.contains("modal-open")
      ) {
        setCardSide("back");
      }
    });
    flipCard.addEventListener("pointerleave", () => {
      window.clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(() => {
        if (
          !(resumeModal && resumeModal.open) &&
          !flipCard.classList.contains("modal-open")
        ) {
          setCardSide("front");
        }
      }, 80);
    });
  }

  // Keyboard focus only changes the card when focus is visibly keyboard-driven.
  flipCard.addEventListener("focusin", (event) => {
    if (
      event.target.matches(":focus-visible") &&
      !(resumeModal && resumeModal.open)
    ) {
      setCardSide("back");
    }
  });
  flipCard.addEventListener("focusout", (event) => {
    if (!flipCard.contains(event.relatedTarget)) {
      requestAnimationFrame(() => {
        if (
          cardFinePointer.matches &&
          !flipCard.matches(":hover") &&
          !(resumeModal && resumeModal.open)
        ) {
          setCardSide("front");
        } else if (
          !cardFinePointer.matches &&
          !flipCard.contains(document.activeElement)
        ) {
          setCardSide("front");
        }
      });
    }
  });

  // Touch: tapping the card toggles it, except the PDF button; outside taps return to the photo.
  if (coarsePointer.matches) {
    flipCard.addEventListener("click", (event) => {
      if (event.target.closest(".resume-open-prompt")) return;
      if (resumeModal && resumeModal.open) return;
      setCardSide(flipCard.dataset.side === "back" ? "front" : "back");
    });
    document.addEventListener("click", (event) => {
      if (
        !flipCard.contains(event.target) &&
        !(resumeModal && resumeModal.open)
      ) {
        setCardSide("front");
      }
    });
  }

  flipCard.addEventListener("click", (event) => {
    const button = event.target.closest(".resume-open-prompt");
    if (!button) return;
    event.stopPropagation();
    openResume(event);
  });

  window.addEventListener("focus", syncCardAfterModalClose);
}

if (resumeClose) resumeClose.addEventListener("click", closeResume);
if (resumeModal) {
  resumeModal.addEventListener("click", (event) => {
    if (event.target === resumeModal) closeResume();
  });
  // Native dialog Escape closes through the cancel event; the close event handles all close paths.
  resumeModal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeResume();
  });
  resumeModal.addEventListener("close", () => {
    if (flipCard) flipCard.classList.remove("modal-open");
    if (
      openedByKeyboard &&
      resumeReturnFocus &&
      resumeReturnFocus.isConnected
    ) {
      resumeReturnFocus.focus();
    }
    openedByKeyboard = false;
    resumeReturnFocus = null;
    syncCardAfterModalClose();
  });
}

// Desktop-only cursor spotlight: one paint update per animation frame, no work on touch devices.
const hero = document.querySelector(".hero");
const heroGrid = document.querySelector(".hero-grid-layer");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
if (hero && heroGrid && finePointer.matches && !reduceMotionQuery.matches) {
  let spotlightFrame = 0;
  let lastPointer = null;
  hero.addEventListener(
    "mousemove",
    (event) => {
      lastPointer = event;
      if (spotlightFrame) return;
      spotlightFrame = window.requestAnimationFrame(() => {
        spotlightFrame = 0;
        if (!lastPointer) return;
        const rect = hero.getBoundingClientRect();
        heroGrid.style.setProperty(
          "--mx",
          `${lastPointer.clientX - rect.left}px`,
        );
        heroGrid.style.setProperty(
          "--my",
          `${lastPointer.clientY - rect.top}px`,
        );
        heroGrid.classList.add("spotlight-active");
      });
    },
    { passive: true },
  );
  hero.addEventListener("mouseleave", () => {
    lastPointer = null;
    if (spotlightFrame) {
      cancelAnimationFrame(spotlightFrame);
      spotlightFrame = 0;
    }
    heroGrid.classList.remove("spotlight-active");
  });
}

// Escape closes an open resume dialog; otherwise it only closes the mobile navigation.
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (resumeModal && resumeModal.open) {
    event.preventDefault();
    closeResume();
    return;
  }
  if (menuToggle && siteNav) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    siteNav.classList.remove("is-open");
  }
});

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

// Selected work: project detail data, modal, grouped screenshot carousel and deep links.
const PROJECTS = [
  {
    id: "meeting-room",
    title: "Meeting Room Reservation System",
    kind: "browser",
    period: "2026 · Internship at MEF",
    glow: "#a7ee78",
    badge: "INTERNSHIP",
    facts: { type: "Internship", period: "2026", roleShort: "Developer" },
    role: "Sole developer over three months: Power Apps development, SharePoint lists, user and admin guides, and system maintenance SOP",
    roleLabel: "MY CONTRIBUTION",
    summary:
      "Built with Microsoft Power Apps during my internship at the Malaysian Employers Federation (MEF), this internal system lets staff check the daily room schedule, book rooms and request changes to approved bookings. Room managers approve or reject requests, and the system also supports Training Rooms with a shared pantry. I developed it independently over three months, across 10 app screens.",
    built: [
      "Daily room schedule with status and Lunch Break indicators; room cards show capacity and equipment",
      "Booking checks for room capacity, valid 30-minute time slots and overlapping bookings",
      "Manager approval workflow with required rejection remarks and email notifications for booking events",
      "My Bookings and Booking History",
      "Cancellation and reschedule requests for approved bookings, with up to two reschedules per booking; the room cannot be changed and the original booking stays active until approval",
      "Training Room bookings with administrator details, rules agreement and shared pantry conflict checks; if a reschedule clashes with the pantry but the room is free, the pantry selection changes to No",
      "Refined with guidance from MEF IT executives, early feedback from other departments and user acceptance testing (UAT)",
    ],
    tech: ["Power Apps", "Microsoft 365", "SharePoint", "Power Automate"],
    story: {
      why: "Before this system, room bookings were arranged by email with the responsible manager, so other staff couldn't see whether a room was already taken. I built the system on my own for MEF staff at the Petaling Jaya headquarters (about 60 people), and checked the finished functions and the interface with them as I went.",
      // Fill in after the V2 rework is finished and tested. Draft: "Late in the internship, about 70% of the core functions had to be reworked with only four days left. Keeping the system working while rewriting that much was the hardest part for me."
      challenge: "",
    },
    result: "",
    links: { demo: "", github: "" },
    groups: [
      {
        name: "Getting started",
        slides: [
          {
            src: "assets/projects/meeting-room/welcome.webp",
            caption: "Welcome screen and app entry",
          },
          {
            src: "assets/projects/meeting-room/book a room.webp",
            caption: "Book a room page with room cards and room selection",
          },
        ],
      },
      {
        name: "Booking",
        slides: [
          {
            src: "assets/projects/meeting-room/booking meeting room.webp",
            caption: "Meeting room booking form and booking summary",
          },
          {
            src: "assets/projects/meeting-room/booking training room.webp",
            caption: "Training Room booking form and booking summary",
          },
        ],
      },
      {
        name: "My bookings",
        slides: [
          {
            src: "assets/projects/meeting-room/my bookings.webp",
            caption: "My Bookings with current and upcoming requests",
          },
          {
            src: "assets/projects/meeting-room/history.webp",
            caption: "Booking History for past and completed bookings",
          },
          {
            src: "assets/projects/meeting-room/history popup.webp",
            caption: "History popup showing details for a selected booking",
          },
        ],
      },
      {
        name: "Rescheduling",
        slides: [
          {
            src: "assets/projects/meeting-room/reschedule.webp",
            caption: "Schedule screen",
          },
          {
            src: "assets/projects/meeting-room/reschedule meeting room.webp",
            caption: "Reschedule request for a meeting room",
          },
          {
            src: "assets/projects/meeting-room/reschedule training room.webp",
            caption: "Training Room reschedule with pantry preference",
          },
        ],
      },
      {
        name: "Manager",
        slides: [
          {
            src: "assets/projects/meeting-room/manager screen.webp",
            caption: "Manager view for reviewing and approving or rejecting requests",
          },
        ],
      },
    ],
  },
  {
    id: "studysync",
    title: "StudySync",
    kind: "phone",
    period: "Jan 2026 – Present",
    glow: "#5fd4d0",
    badge: "SILVER AWARD",
    facts: {
      type: "Android app",
      period: "Jan 2026 – Present",
      roleShort: "Android developer",
    },
    summary:
      "Created as my final-year project to address the problem of lecturers using different platforms to communicate and share study materials. StudySync brings those study activities into one place: students can store materials in a personal study space, upload files to the relevant group, create assignment groups, track tasks live, chat and collaborate. Built as an Android app with Kotlin, Java and Firebase, using Material Design principles.",
    built: [
      "Real-time chat",
      "Task tracking",
      "Authentication",
      "File uploads",
      "Cloud database synchronisation for collaborative use",
      "Material Design interface",
    ],
    tech: ["Kotlin", "Java", "Firebase", "Android Studio"],
    result:
      "Silver Award, IT Ideation & Innovation Competition (2026), for presenting StudySync.",
    links: { demo: "", github: "" },
    groups: [
      {
        name: "Login & Profile",
        slides: [
          {
            src: "assets/projects/studysync/studysync_login.webp",
            caption: "Login screen integrated with Firebase Authentication for secure user access",
          },
          {
            src: "assets/projects/studysync/profile.webp",
            caption: "User profile page containing account information, settings, and personalization options",
          },
        ],
      },
      {
        name: "Home & Groups",
        slides: [
          {
            src: "assets/projects/studysync/home-1.webp",
            caption: "Personalized dashboard view showing active groups and assignment progress",
          },
          {
            src: "assets/projects/studysync/home-2.webp",
            caption: "Main dashboard showing task summaries, study groups, quick actions, deadlines, and recent files",
          },
          {
            src: "assets/projects/studysync/create-group.webp",
            caption: "Group creation page where students can create assignment groups and define project details",
          },
        ],
      },
      {
        name: "Chat",
        slides: [
          {
            src: "assets/projects/studysync/group-chat.webp",
            caption: "Group workspace featuring member management, communication tools, and assignment coordination",
          },
        ],
      },
      {
        name: "Tasks",
        slides: [
          {
            src: "assets/projects/studysync/tasks.webp",
            caption: "Task tracking interface allowing students to monitor progress, status, and deadlines",
          },
        ],
      },
    ],
  },
  {
    id: "rasa-warisan",
    title: "Rasa Warisan",
    kind: "browser",
    period: "2025 · Team project",
    glow: "#b58cf0",
    badge: "TEAM PROJECT",
    facts: { type: "Team project", period: "2025", roleShort: "Team member" },
    role: "UI layout, reservation workflow, testing and documentation",
    roleLabel: "MY CONTRIBUTION",
    summary:
      "Rasa Warisan is a web-based restaurant reservation system that allows customers to reserve tables online. Customers can register, log in, view their reservation history, and cancel bookings. Administrators can manage restaurant tables, monitor reservations, and update reservation statuses. The system includes table availability checking and overlapping-time validation to help prevent double bookings.",
    built: [
      "User interface layouts",
      "Reservation workflow",
      "Workflow testing",
      "Project documentation",
      "Database integration",
    ],
    tech: ["HTML", "CSS", "Bootstrap", "PHP", "MySQL"],
    result: "",
    links: { demo: "", github: "" },
    groups: [
      {
        name: "User Side",
        slides: [
          {
            src: "assets/projects/rasa-warisan/user side/about (3).png",
            caption: "About page (3 of 4)",
          },
          {
            src: "assets/projects/rasa-warisan/user side/about (2).png",
            caption: "About page (2 of 4)",
          },
          {
            src: "assets/projects/rasa-warisan/user side/about (4).png",
            caption: "About page (4 of 4)",
          },
          {
            src: "assets/projects/rasa-warisan/user side/my reservation.png",
            caption: "My Reservation",
          },
          {
            src: "assets/projects/rasa-warisan/user side/home (2).png",
            caption: "Home page (2 of 2)",
          },
          {
            src: "assets/projects/rasa-warisan/user side/register.png",
            caption: "Register",
          },
          {
            src: "assets/projects/rasa-warisan/user side/privacy policy.png",
            caption: "Privacy Policy",
          },
          {
            src: "assets/projects/rasa-warisan/user side/click interior.png",
            caption: "Click Interior",
          },
          {
            src: "assets/projects/rasa-warisan/user side/reservation (1).png",
            caption: "Reservation page (1 of 3)",
          },
          {
            src: "assets/projects/rasa-warisan/user side/reservation confirmed.png",
            caption: "Reservation Confirmed",
          },
          {
            src: "assets/projects/rasa-warisan/user side/reservation (3).png",
            caption: "Reservation page (3 of 3)",
          },
          {
            src: "assets/projects/rasa-warisan/user side/click dessert.png",
            caption: "Click Dessert",
          },
          {
            src: "assets/projects/rasa-warisan/user side/terms of service.png",
            caption: "Terms Of Service",
          },
          {
            src: "assets/projects/rasa-warisan/user side/reservation (2).png",
            caption: "Reservation page (2 of 3)",
          },
          {
            src: "assets/projects/rasa-warisan/user side/gallery.png",
            caption: "Gallery",
          },
          {
            src: "assets/projects/rasa-warisan/user side/about (1).png",
            caption: "About page (1 of 4)",
          },
          {
            src: "assets/projects/rasa-warisan/user side/menu.png",
            caption: "Menu",
          },
          {
            src: "assets/projects/rasa-warisan/user side/my reservation details.png",
            caption: "My Reservation Details",
          },
          {
            src: "assets/projects/rasa-warisan/user side/contact (1).png",
            caption: "Contact page (1 of 3)",
          },
          {
            src: "assets/projects/rasa-warisan/user side/click appetizer.png",
            caption: "Click Appetizer",
          },
          {
            src: "assets/projects/rasa-warisan/user side/contact (3).png",
            caption: "Contact page (3 of 3)",
          },
          {
            src: "assets/projects/rasa-warisan/user side/login.png",
            caption: "Login",
          },
          {
            src: "assets/projects/rasa-warisan/user side/home (1).png",
            caption: "Home page (1 of 2)",
          },
          {
            src: "assets/projects/rasa-warisan/user side/click event.png",
            caption: "Click Event",
          },
          {
            src: "assets/projects/rasa-warisan/user side/click food.png",
            caption: "Click Food",
          },
          {
            src: "assets/projects/rasa-warisan/user side/contact (2).png",
            caption: "Contact page (2 of 3)",
          },
          {
            src: "assets/projects/rasa-warisan/user side/click main.png",
            caption: "Click Main",
          },
          {
            src: "assets/projects/rasa-warisan/user side/forgot password.png",
            caption: "Forgot Password",
          },
        ],
      },
      {
        name: "Admin Side",
        slides: [
          {
            src: "assets/projects/rasa-warisan/admin side/privacy policy.png",
            caption: "Privacy Policy",
          },
          {
            src: "assets/projects/rasa-warisan/admin side/register.png",
            caption: "Register",
          },
          {
            src: "assets/projects/rasa-warisan/admin side/add new table.png",
            caption: "Add New Table",
          },
          {
            src: "assets/projects/rasa-warisan/admin side/tables.png",
            caption: "Tables",
          },
          {
            src: "assets/projects/rasa-warisan/admin side/reports (1).png",
            caption: "Reports (1 of 2)",
          },
          {
            src: "assets/projects/rasa-warisan/admin side/dashboard (1).png",
            caption: "Dashboard (1 of 2)",
          },
          {
            src: "assets/projects/rasa-warisan/admin side/reports (2).png",
            caption: "Reports (2 of 2)",
          },
          {
            src: "assets/projects/rasa-warisan/admin side/edit table.png",
            caption: "Edit Table",
          },
          {
            src: "assets/projects/rasa-warisan/admin side/forgot password.png",
            caption: "Forgot Password",
          },
          {
            src: "assets/projects/rasa-warisan/admin side/dashboard (2).png",
            caption: "Dashboard (2 of 2)",
          },
          {
            src: "assets/projects/rasa-warisan/admin side/terms of service.png",
            caption: "Terms Of Service",
          },
          {
            src: "assets/projects/rasa-warisan/admin side/login.png",
            caption: "Login",
          },
          {
            src: "assets/projects/rasa-warisan/admin side/reservations.png",
            caption: "Reservations",
          },
          {
            src: "assets/projects/rasa-warisan/admin side/Screenshot 2026-03-16 183106.png",
            caption: "Additional admin screen",
          },
        ],
      },
    ],
  },
  {
    id: "assignment-rush",
    title: "Assignment Rush",
    kind: "browser",
    period: "May 2026 · Personal project",
    glow: "#e0c565",
    badge: "LIVE DEMO",
    facts: {
      type: "Personal project",
      period: "May 2026",
      roleShort: "Designer & developer",
    },
    summary:
      "I built Assignment Rush for fun as part of my learning process. Since my final-year project, StudySync, is a mobile app, I wanted to gain more experience building for the web. The result is a browser-based productivity game with combo mechanics, score tracking and dynamic difficulty, deployed on GitHub Pages.",
    built: [
      "Combo mechanics",
      "Score tracking",
      "Dynamic difficulty progression",
      "Responsive interface with custom assets and animations",
      "Mobile controls",
    ],
    tech: ["HTML", "CSS", "GitHub Pages"],
    result: "",
    links: {
      demo: "https://zulcodesss.github.io/assignment-rush/",
      github: "https://github.com/zulcodesss/assignment-rush",
    },
    groups: [
      {
        name: "Gameplay",
        slides: [
          {
            src: "assets/projects/assignment-rush/playing-page.webp",
            caption: "Combo mechanics and gameplay",
          },
          {
            src: "assets/projects/assignment-rush/default-page.webp",
            caption: "Score tracking and dynamic difficulty",
          },
          {
            src: "assets/projects/assignment-rush/game-over-page.webp",
            caption: "Mobile controls and animations",
          },
        ],
      },
    ],
  },
];

(() => {
  const workSection = document.querySelector("#work");
  const modal = document.querySelector(".project-modal");
  if (!workSection || !modal) return;
  const modalShell = modal.querySelector(".project-modal-shell");
  const modalIndex = modal.querySelector("#project-modal-index");
  const title = modal.querySelector("#project-modal-title");
  title.tabIndex = -1;
  const header = modal.querySelector(".project-modal-header");
  const detailColumn = modal.querySelector(".project-detail-column");
  let touchDrag = null;
  const period = modal.querySelector(".project-period");
  const summary = modal.querySelector(".project-summary");
  const role = modal.querySelector(".project-role");
  const built = modal.querySelector(".project-built-list");
  const storyWhy = modal.querySelector(".project-story-why");
  const storyChallenge = modal.querySelector(".project-story-challenge");
  const tech = modal.querySelector(".project-tech-list");
  const result = modal.querySelector(".project-result");
  const links = modal.querySelector(".project-modal-links");
  const tabs = modal.querySelector(".project-feature-tabs");
  const slides = modal.querySelector(".project-slides");
  const caption = modal.querySelector(".project-slide-caption");
  const counter = modal.querySelector(".project-slide-counter");
  const thumbs = modal.querySelector(".project-thumbnails");
  const prevSlide = modal.querySelector(".project-slide-prev");
  const nextSlide = modal.querySelector(".project-slide-next");
  const closeButton = modal.querySelector(".project-modal-close");
  const prevProject = modal.querySelector(".project-previous");
  const nextProject = modal.querySelector(".project-next");
  const lightbox = modal.querySelector(".project-lightbox");
  const lightboxImage = lightbox.querySelector("img");
  const lightboxClose = modal.querySelector(".project-lightbox-close");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fineModalPointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  );
  let currentProject = null;
  let currentProjectIndex = -1;
  let currentGroupIndex = 0;
  let currentSlideIndex = 0;
  let returnFocus = null;
  let ignoreNextHashChange = false;
  let scrollPosition = 0;
  let closingFromPopState = false;

  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const projectHash = (project) => `#project-${project.id}`;
  const findProjectFromHash = () =>
    PROJECTS.find((project) => projectHash(project) === window.location.hash);

  function makeLink(label, url) {
    if (!url || !url.trim()) return null;
    const anchor = document.createElement("a");
    anchor.className = "button button-quiet";
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = label;
    return anchor;
  }

  function renderDetails(project, index) {
    modalIndex.textContent = `PROJECT / ${String(index + 1).padStart(2, "0")}`;
    title.textContent = project.title;
    period.textContent = project.period || "";
    period.hidden = true; // PERIOD is presented in the key-facts grid.
    summary.textContent = project.summary || "";
    summary.hidden = !project.summary;
    role.hidden = !(
      project.role && project.role !== (project.facts?.roleShort || "")
    );
    role.className = "project-role project-detail-row";
    role.replaceChildren();
    if (!role.hidden) {
      const label = document.createElement("span");
      label.className = "project-row-label";
      label.textContent = project.roleLabel || "ROLE";
      const value = document.createElement("span");
      value.className = "project-row-value";
      value.textContent = project.role;
      role.append(label, value);
    }
    [[storyWhy, project.story?.why], [storyChallenge, project.story?.challenge]].forEach(([box, text]) => {
      if (!box) return;
      box.hidden = !text;
      box.querySelector("p").textContent = text || "";
    });
    built.replaceChildren(
      ...(project.built || []).map((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        return li;
      }),
    );
    tech.replaceChildren(
      ...(project.tech || []).map((item) => {
        const span = document.createElement("span");
        span.textContent = item;
        return span;
      }),
    );
    decorateTags(tech);
    const facts = project.facts || {};
    let factsRow = detailColumn.querySelector(".project-key-facts");
    if (!factsRow) {
      factsRow = document.createElement("div");
      factsRow.className = "project-key-facts";
      title.insertAdjacentElement("afterend", factsRow);
    }
    factsRow.replaceChildren();
    factsRow.classList.remove("facts-enter");
    [
      ["TYPE", facts.type || "—"],
      ["PERIOD", facts.period || "—"],
      ["ROLE", facts.roleShort || "—"],
      ["STACK", (project.tech || []).slice(0, 3).join(" · ") || "—"],
    ].forEach(([labelText, valueText], tileIndex) => {
      const wrapper = document.createElement("div");
      wrapper.className = "project-fact-wrap";
      const box = document.createElement("div");
      box.className = "project-fact";
      const label = document.createElement("span");
      label.className = "project-fact-label";
      label.textContent = labelText;
      const value = document.createElement("span");
      value.className = "project-fact-value";
      value.textContent = valueText;
      box.append(label, value);
      wrapper.append(box);
      factsRow.append(wrapper);
      if (fineModalPointer.matches && !reduceMotion.matches) {
        let frame = 0;
        let pointerEvent = null;
        wrapper.addEventListener(
          "pointermove",
          (event) => {
            if (event.pointerType !== "mouse" && event.pointerType !== "pen")
              return;
            pointerEvent = event;
            if (frame) return;
            frame = requestAnimationFrame(() => {
              frame = 0;
              if (!pointerEvent) return;
              const rect = wrapper.getBoundingClientRect();
              const nx = Math.max(
                -1,
                Math.min(
                  1,
                  ((pointerEvent.clientX - rect.left) / rect.width - 0.5) * 2,
                ),
              );
              const ny = Math.max(
                -1,
                Math.min(
                  1,
                  ((pointerEvent.clientY - rect.top) / rect.height - 0.5) * 2,
                ),
              );
              box.style.setProperty("--fact-tilt-x", `${-ny * 8}deg`);
              box.style.setProperty("--fact-tilt-y", `${nx * 8}deg`);
              box.classList.add("is-fact-tilting");
            });
          },
          { passive: true },
        );
        wrapper.addEventListener("pointerleave", () => {
          pointerEvent = null;
          if (frame) cancelAnimationFrame(frame);
          frame = 0;
          box.classList.remove("is-fact-tilting");
          box.style.setProperty("--fact-tilt-x", "0deg");
          box.style.setProperty("--fact-tilt-y", "0deg");
        });
      }
    });
    if (!reduceMotion.matches) {
      requestAnimationFrame(() => {
        factsRow.classList.add("facts-enter");
        let finishedTiles = 0;
        const onTileAnimationEnd = (event) => {
          if (!event.target.matches(".project-fact")) return;
          finishedTiles += 1;
          if (finishedTiles >= factsRow.children.length) {
            factsRow.classList.remove("facts-enter");
            factsRow.removeEventListener("animationend", onTileAnimationEnd);
          }
        };
        factsRow.addEventListener("animationend", onTileAnimationEnd);
      });
    }
    result.replaceChildren();
    result.hidden = !project.result;
    if (project.result) {
      const icon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.setAttribute("aria-hidden", "true");
      icon.setAttribute("class", "project-result-icon");
      icon.innerHTML =
        '<path d="M8 4h8v4a4 4 0 0 1-8 0V4Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 0v4m-4 3h8m-7-3h6v3H9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';
      const label = document.createElement("span");
      label.className = "project-result-label";
      label.textContent = "RECOGNITION";
      const value = document.createElement("span");
      value.className = "project-result-value";
      value.textContent = project.result;
      result.append(icon, label, value);
    }
    const card = workSection.querySelector(
      `.project-card[data-project-id="${project.id}"]`,
    );
    const sourceBadge = card?.querySelector(
      ".project-art-badge, .live-demo-badge",
    );
    const oldBadge = header.querySelector(".project-modal-badge");
    oldBadge?.remove();
    if (sourceBadge) {
      const badge = sourceBadge.cloneNode(true);
      badge.classList.add("project-modal-badge");
      badge.style.position = "static";
      badge.style.inset = "auto";
      modalIndex.insertAdjacentElement("afterend", badge);
    }
    modal.style.setProperty("--project-glow", project.glow || "#a7ee78");
    links.replaceChildren();
    const isAssignmentRush = project.id === "assignment-rush";
    const demo = makeLink(
      isAssignmentRush ? "▶ Play Assignment Rush ↗" : "Play it live ↗",
      project.links?.demo,
    );
    const github = isAssignmentRush
      ? null
      : makeLink("View source on GitHub ↗", project.links?.github);
    if (demo) {
      if (isAssignmentRush) demo.classList.add("assignment-rush-demo-button");
      links.append(demo);
    }
    if (github) links.append(github);
    if (!reduceMotion.matches) {
      detailColumn.classList.remove("details-enter");
      void detailColumn.offsetWidth;
      detailColumn.classList.add("details-enter");
    }
  }

  function allCurrentSlides() {
    return currentProject?.groups?.[currentGroupIndex]?.slides || [];
  }

  function buildSlide(slide, slideIndex) {
    const item = document.createElement("div");
    item.className = "project-slide";
    item.dataset.slideIndex = String(slideIndex);
    const device = document.createElement("div");
    device.className = `project-device ${currentProject.kind === "phone" ? "project-device-phone" : "project-device-browser"}`;
    if (currentProject.kind === "browser") {
      const bar = document.createElement("div");
      bar.className = "project-browser-bar";
      [0, 1, 2].forEach(() => bar.append(document.createElement("i")));
      const address = document.createElement("span");
      address.textContent = `${currentProject.title} / screenshot ${slideIndex + 1}`;
      bar.append(address);
      device.append(bar);
    }
    const wrap = document.createElement("div");
    wrap.className = "project-slide-image-wrap";
    const img = document.createElement("img");
    img.className = "project-slide-image";
    img.src = slide.src;
    img.alt = `${currentProject.title}: ${slide.caption}`;
    img.loading = "lazy";
    img.decoding = "async";
    const placeholder = document.createElement("div");
    placeholder.className = "project-slide-placeholder";
    placeholder.innerHTML = `<strong>SCREENSHOT COMING SOON</strong><span>${escapeHtml(slide.caption)}</span>`;
    img.addEventListener("load", () => {
      placeholder.hidden = true;
    });
    img.addEventListener("error", () => {
      img.hidden = true;
      placeholder.hidden = false;
    });
    img.addEventListener("click", () => openLightbox(slide, img));
    placeholder.hidden = false;
    wrap.append(img, placeholder);
    device.append(wrap);
    item.append(device);
    return item;
  }

  function renderCarousel({ keepIndex = false } = {}) {
    const groupSlides = allCurrentSlides();
    if (!keepIndex) currentSlideIndex = 0;
    currentSlideIndex = Math.max(
      0,
      Math.min(currentSlideIndex, groupSlides.length - 1),
    );
    slides.replaceChildren(...groupSlides.map(buildSlide));
    if (!reduceMotion.matches) {
      modal
        .querySelector(".project-visual-column")
        .classList.remove("carousel-enter");
      void modal.querySelector(".project-visual-column").offsetWidth;
      modal
        .querySelector(".project-visual-column")
        .classList.add("carousel-enter");
      slides.children[currentSlideIndex]?.classList.add("slide-enter");
    }
    thumbs.replaceChildren(
      ...groupSlides.map((slide, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "project-thumbnail";
        button.setAttribute(
          "aria-label",
          `Show screenshot ${index + 1}: ${slide.caption}`,
        );
        button.setAttribute(
          "aria-current",
          String(index === currentSlideIndex),
        );
        const image = document.createElement("img");
        image.src = slide.src;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => {
          image.remove();
          const label = document.createElement("span");
          label.textContent = String(index + 1).padStart(2, "0");
          button.append(label);
        });
        button.append(image);
        button.addEventListener("click", () => goToSlide(index));
        return button;
      }),
    );
    slides.scrollLeft = 0;
    updateSlideUI();
  }

  function updateSlideUI() {
    const groupSlides = allCurrentSlides();
    counter.textContent = `${groupSlides.length ? currentSlideIndex + 1 : 0} / ${groupSlides.length}`;
    caption.classList.remove("caption-updating");
    caption.textContent = groupSlides[currentSlideIndex]?.caption || "";
    [...thumbs.children].forEach((button, index) => {
      button.setAttribute("aria-current", String(index === currentSlideIndex));
      if (index === currentSlideIndex)
        button.scrollIntoView({
          block: "nearest",
          inline: "center",
          behavior: reduceMotion.matches ? "auto" : "smooth",
        });
    });
    prevSlide.disabled = groupSlides.length < 2;
    nextSlide.disabled = groupSlides.length < 2;
  }

  let isProgrammaticSlideScroll = false;
  let programmaticScrollTimeout = 0;

  function goToSlide(index) {
    const groupSlides = allCurrentSlides();
    if (!groupSlides.length) return;
    currentSlideIndex = (index + groupSlides.length) % groupSlides.length;
    const target = slides.children[currentSlideIndex];
    if (target && !reduceMotion.matches) {
      target.classList.remove("slide-enter");
      void target.offsetWidth;
      target.classList.add("slide-enter");
      caption.classList.remove("caption-enter");
      void caption.offsetWidth;
      caption.classList.add("caption-enter");
    }
    if (target) {
      isProgrammaticSlideScroll = true;
      window.clearTimeout(programmaticScrollTimeout);
      target.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "nearest",
        inline: "start",
      });
      programmaticScrollTimeout = window.setTimeout(() => {
        isProgrammaticSlideScroll = false;
      }, reduceMotion.matches ? 0 : 500);
    }
    updateSlideUI();
  }

  function renderTabs() {
    tabs.replaceChildren();
    if ((currentProject.groups || []).length <= 1) {
      tabs.hidden = true;
      return;
    }
    tabs.hidden = false;
    const groupOptions = [
      { name: "All", all: true },
      ...currentProject.groups.map((group, index) => ({
        name: group.name,
        index,
      })),
    ];
    groupOptions.forEach((group, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "project-feature-tab";
      button.id = `project-tab-${currentProject.id}-${index}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-label", `Show ${group.name} screenshots`);
      button.setAttribute(
        "aria-selected",
        String(
          (index === 0 && currentGroupIndex === -1) ||
            index === currentGroupIndex + 1,
        ),
      );
      button.tabIndex =
        button.getAttribute("aria-selected") === "true" ? 0 : -1;
      button.textContent = group.name;
      button.addEventListener("click", () => {
        currentGroupIndex = group.all ? -1 : group.index;
        currentSlideIndex = 0;
        renderTabs();
        if (group.all) {
          const all = currentProject.groups.flatMap((item, gi) =>
            item.slides.map((slide) => ({
              ...slide,
              groupName: item.name,
              groupIndex: gi,
            })),
          );
          // All tab combines groups into one navigable sequence.
          currentProject._allSlides = all;
        } else currentProject._allSlides = null;
        renderCarousel();
        slides.setAttribute("aria-labelledby", button.id);
      });
      tabs.append(button);
    });
    const selectedTab = tabs.querySelector(
      '[role="tab"][aria-selected="true"]',
    );
    if (selectedTab) slides.setAttribute("aria-labelledby", selectedTab.id);
  }

  function activeGroupSlides() {
    if (currentGroupIndex === -1) return currentProject?._allSlides || [];
    return currentProject?.groups?.[currentGroupIndex]?.slides || [];
  }

  // Override current group lookup to support the All tab's combined list.
  allCurrentSlides = activeGroupSlides;

  function openLightbox(slide, sourceImage) {
    if (!sourceImage || sourceImage.hidden) return;
    lightboxImage.src = slide.src;
    lightboxImage.alt = `${currentProject.title}: ${slide.caption}`;
    lightbox.hidden = false;
    lightboxClose.focus();
  }
  function closeLightbox() {
    if (lightbox.hidden) return false;
    lightbox.hidden = true;
    lightboxImage.removeAttribute("src");
    return true;
  }

  function setProject(project, { updateHash = true, sourceCard = null } = {}) {
    currentProject = project;
    currentProjectIndex = PROJECTS.indexOf(project);
    currentGroupIndex = project.groups.length > 1 ? -1 : 0;
    currentSlideIndex = 0;
    project._allSlides = null;
    renderDetails(project, currentProjectIndex);
    renderTabs();
    if (currentGroupIndex === -1)
      project._allSlides = project.groups.flatMap((group, groupIndex) =>
        group.slides.map((slide) => ({
          ...slide,
          groupName: group.name,
          groupIndex,
        })),
      );
    renderCarousel();
    if (updateHash && window.location.hash !== projectHash(project))
      history.pushState({ projectModal: project.id }, "", projectHash(project));
    if (sourceCard) returnFocus = sourceCard;
  }

  function openProject(project, sourceCard, { updateHash = true } = {}) {
    if (!project) return;
    if (sourceCard) {
      sourceCard.classList.remove("is-tilting");
      sourceCard.style.setProperty("--tilt-x", "0deg");
      sourceCard.style.setProperty("--tilt-y", "0deg");
      sourceCard.style.setProperty("--tilt-duration", "0ms");
      void sourceCard.offsetWidth;
    }
    const rect = sourceCard?.getBoundingClientRect();
    setProject(project, { updateHash, sourceCard });
    document.body.dataset.projectModalOpen = "true";
    scrollPosition = window.scrollY;
    document.body.style.overflow = "hidden";
    if (!modal.open) modal.showModal();
    modal.classList.remove("is-opening", "is-closing");
    if (rect && !reduceMotion.matches) {
      const panelRect = modal.getBoundingClientRect();
      const dx =
        rect.left + rect.width / 2 - (panelRect.left + panelRect.width / 2);
      const dy =
        rect.top + rect.height / 2 - (panelRect.top + panelRect.height / 2);
      const scale = Math.min(
        rect.width / panelRect.width,
        rect.height / panelRect.height,
        1,
      );
      modal.style.setProperty("--pop-x", `${dx}px`);
      modal.style.setProperty("--pop-y", `${dy}px`);
      modal.style.setProperty("--pop-scale", String(scale));
      modal.classList.add("is-opening");
      modal.addEventListener(
        "animationend",
        () => {
          modal.classList.remove("is-opening");
          modal.style.removeProperty("--pop-x");
          modal.style.removeProperty("--pop-y");
          modal.style.removeProperty("--pop-scale");
        },
        { once: true },
      );
    }
    title.focus({ preventScroll: true });
  }

  function closeProject({ fromPopState = false } = {}) {
    if (!modal.open) return;
    if (closeLightbox()) return;
    modal.close();
    document.body.style.overflow = "";
    delete document.body.dataset.projectModalOpen;
    if (
      !fromPopState &&
      PROJECTS.some((project) => projectHash(project) === window.location.hash)
    ) {
      try {
        history.replaceState(
          history.state,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
      } catch {
        try {
          history.replaceState(history.state, "", "#");
        } catch {
          /* Opaque preview origins cannot rewrite history URLs. */
        }
      }
    }
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  }

  if (window.matchMedia("(max-width: 760px)").matches) {
    modal.addEventListener(
      "pointerdown",
      (event) => {
        if (
          event.pointerType !== "touch" ||
          lightbox.hidden === false ||
          event.target.closest(
            ".project-slides, .project-thumbnails, .project-feature-tabs, button, a",
          )
        )
          return;
        const body = modal.querySelector(".project-modal-body");
        if (
          body.scrollTop > 0 &&
          !event.target.closest(".project-modal-header")
        )
          return;
        touchDrag = {
          x: event.clientX,
          y: event.clientY,
          lastY: event.clientY,
          lastTime: performance.now(),
          vertical: false,
        };
      },
      { passive: true },
    );
    modal.addEventListener(
      "pointermove",
      (event) => {
        if (!touchDrag || event.pointerType !== "touch") return;
        const dx = event.clientX - touchDrag.x,
          dy = event.clientY - touchDrag.y;
        if (!touchDrag.vertical && Math.abs(dx) > Math.abs(dy)) {
          touchDrag = null;
          return;
        }
        if (dy > 8 && Math.abs(dy) > Math.abs(dx) * 1.15) {
          touchDrag.vertical = true;
          if (!reduceMotion.matches) {
            event.preventDefault();
            modal.style.transform = `translateY(${Math.max(0, dy)}px)`;
          }
        }
        touchDrag.lastY = event.clientY;
        touchDrag.lastTime = performance.now();
      },
      { passive: false },
    );
    const finishSheetDrag = (event) => {
      if (!touchDrag) return;
      const dy = event.clientY - touchDrag.y;
      const velocity =
        (event.clientY - touchDrag.lastY) /
        Math.max(1, performance.now() - touchDrag.lastTime);
      const shouldClose = touchDrag.vertical && (dy > 120 || velocity > 0.65);
      touchDrag = null;
      if (shouldClose) {
        modal.style.removeProperty("transform");
        closeProject();
        return;
      }
      if (!reduceMotion.matches) {
        modal.style.transition = "transform .28s cubic-bezier(.2,.8,.2,1)";
        modal.style.transform = "translateY(0)";
        window.setTimeout(() => {
          modal.style.removeProperty("transition");
          modal.style.removeProperty("transform");
        }, 300);
      } else modal.style.removeProperty("transform");
    };
    modal.addEventListener("pointerup", finishSheetDrag, { passive: true });
    modal.addEventListener("pointercancel", finishSheetDrag, { passive: true });
  }

  workSection.querySelectorAll(".project-card-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const card = link.closest(".project-card");
      const project = PROJECTS.find(
        (item) => item.id === card?.dataset.projectId,
      );
      openProject(project, card);
    });
  });
  closeButton.addEventListener("click", () => closeProject());
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeProject();
  });
  modal.addEventListener("cancel", (event) => {
    event.preventDefault();
    if (!closeLightbox()) closeProject();
  });
  modal.addEventListener("close", () => {
    document.body.style.overflow = "";
    delete document.body.dataset.projectModalOpen;
    closeLightbox();
  });
  prevSlide.addEventListener("click", () => goToSlide(currentSlideIndex - 1));
  nextSlide.addEventListener("click", () => goToSlide(currentSlideIndex + 1));
  prevProject.addEventListener("click", () =>
    openProject(
      PROJECTS[(currentProjectIndex - 1 + PROJECTS.length) % PROJECTS.length],
      null,
    ),
  );
  nextProject.addEventListener("click", () =>
    openProject(PROJECTS[(currentProjectIndex + 1) % PROJECTS.length], null),
  );
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target === lightboxImage)
      closeLightbox();
  });
  lightboxClose.addEventListener("click", closeLightbox);

  let scrollTick = 0;
  slides.addEventListener(
    "scroll",
    () => {
      if (isProgrammaticSlideScroll) return;
      if (scrollTick) cancelAnimationFrame(scrollTick);
      scrollTick = requestAnimationFrame(() => {
        scrollTick = 0;
        if (isProgrammaticSlideScroll) return;
        const first = slides.firstElementChild;
        if (!first) return;
        const slideWidth = first.getBoundingClientRect().width + 12;
        const index = Math.round(slides.scrollLeft / slideWidth);
        if (index !== currentSlideIndex) {
          currentSlideIndex = Math.max(
            0,
            Math.min(index, allCurrentSlides().length - 1),
          );
          const activeSlide = slides.children[currentSlideIndex];
          if (activeSlide && !reduceMotion.matches) {
            activeSlide.classList.remove("slide-enter");
            void activeSlide.offsetWidth;
            activeSlide.classList.add("slide-enter");
            caption.classList.remove("caption-enter");
            void caption.offsetWidth;
            caption.classList.add("caption-enter");
          }
          updateSlideUI();
        }
      });
    },
    { passive: true },
  );
  slides.addEventListener("scrollend", () => {
    window.clearTimeout(programmaticScrollTimeout);
    isProgrammaticSlideScroll = false;
  });
  modal.addEventListener("keydown", (event) => {
    if (!lightbox.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeLightbox();
        closeButton.focus();
      }
      return;
    }
    if (
      event.key === "ArrowLeft" &&
      !event.target.closest("button, a, input, textarea")
    ) {
      event.preventDefault();
      goToSlide(currentSlideIndex - 1);
    }
    if (
      event.key === "ArrowRight" &&
      !event.target.closest("button, a, input, textarea")
    ) {
      event.preventDefault();
      goToSlide(currentSlideIndex + 1);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeProject();
    }
  });

  window.addEventListener("popstate", () => {
    const project = findProjectFromHash();
    if (project) {
      if (!modal.open) openProject(project, null, { updateHash: false });
      else setProject(project, { updateHash: false });
    } else if (modal.open) closeProject({ fromPopState: true });
  });
  window.addEventListener("hashchange", () => {
    const project = findProjectFromHash();
    if (project) {
      if (!modal.open)
        openProject(
          project,
          document.querySelector(`[data-project-id="${project.id}"]`),
          { updateHash: false },
        );
      else setProject(project, { updateHash: false });
    } else if (modal.open) closeProject({ fromPopState: true });
  });
  const initialProject = findProjectFromHash();
  if (initialProject)
    openProject(
      initialProject,
      document.querySelector(`[data-project-id="${initialProject.id}"]`),
      { updateHash: false },
    );
})();

// About proof assets belong in assets/about/. Blur personal numbers or children's faces before uploading images.
const ABOUT_PROOF = [
  {
    id: "academic-excellence",
    title: "Academic Excellence Award",
    subtitle: "Majlis Apresiasi Pelajar · GPA 3.96 in Semesters 1 and 2",
    year: "2025",
    type: "AWARD",
    src: "assets/about/appresiasi.webp",
    alt: "Academic Excellence Award",
    verifyUrl: "",
  },
  {
    id: "silver-award",
    title: "Silver Award",
    subtitle: "IT Ideation & Innovation Competition · presenting StudySync",
    year: "2026",
    type: "COMPETITION",
    src: "assets/about/It ideation.jpg",
    alt: "Silver Award at the IT Ideation & Innovation Competition",
    verifyUrl: "",
  },
  {
    id: "program-director",
    title: "Program Director",
    subtitle: "Program Sukaneka Ceria · led 20+ committee members",
    year: "2026",
    type: "LEADERSHIP",
    src: "assets/about/csr.webp",
    alt: "Program Sukaneka Ceria event photo",
    verifyUrl: "",
  },
  {
    id: "cisco-it-essentials",
    title: "Cisco Networking Academy",
    subtitle: "IT Essentials: PC Hardware and Software",
    year: "",
    type: "CERTIFICATE",
    src: "assets/about/cisco.jpg",
    alt: "Cisco Networking Academy IT Essentials certificate",
    verifyUrl: "",
  },
  {
    id: "hotelier-conference-support",
    title: "Conference IT Support",
    subtitle: "Two-day hotelier conference · Nexus, Bangsar South",
    year: "",
    type: "EVENT IT SUPPORT",
    src: "assets/about/hotelier-conference.webp",
    alt: "IT support during a two-day hotelier conference at Nexus, Bangsar South",
    verifyUrl: "",
  },
];

(() => {
  const about = document.querySelector("#about");
  if (!about) return;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const proofWrap = about.querySelector(".about-proof-wrap");
  const proofCard = about.querySelector(".about-proof-card");
  const proofImage = about.querySelector(".about-proof-image");
  const proofPlaceholder = about.querySelector(".about-proof-placeholder");
  const proofType = about.querySelector(".about-proof-type");
  const proofTitle = about.querySelector(".about-proof-title");
  const proofSubtitle = about.querySelector(".about-proof-subtitle");
  const proofYear = about.querySelector(".about-proof-year");
  const proofCounter = about.querySelector(".about-proof-counter");
  const proofDots = [...about.querySelectorAll(".about-proof-progress i")];
  const highlights = [
    ...about.querySelectorAll(".highlights-list [data-proof]"),
  ];
  const dialog = document.querySelector(".proof-modal");
  if (!proofWrap || !proofCard || !proofImage || !dialog || !highlights.length)
    return;

  const dialogImage = dialog.querySelector(".proof-modal-image");
  const dialogPlaceholder = dialog.querySelector(".proof-modal-placeholder");
  const dialogTitle = dialog.querySelector("#proof-modal-title");
  const dialogType = dialog.querySelector(".proof-modal-type");
  const dialogSubtitle = dialog.querySelector(".proof-modal-subtitle");
  const dialogYear = dialog.querySelector(".proof-modal-year");
  const dialogVerify = dialog.querySelector(".proof-modal-verify");
  const dialogCounter = dialog.querySelector(".proof-modal-counter");
  const dialogFooterCount = dialog.querySelector(".proof-modal-footer-count");
  const closeButton = dialog.querySelector(".proof-modal-close");
  const previousButton = dialog.querySelector(".proof-modal-prev");
  const nextButton = dialog.querySelector(".proof-modal-next");
  let activeIndex = 0;
  let hoverTimer = 0;
  let tiltFrame = 0;
  let pendingPointer = null;
  let opener = null;
  let priorBodyOverflow = "";

  function showFallback(img, fallback, item) {
    img.hidden = true;
    fallback.hidden = false;
    if (img === proofImage)
      proofImage.parentElement.style.setProperty("--proof-ratio", "4 / 3");
    const title = fallback.querySelector("strong");
    if (title) title.textContent = item.title;
  }
  function loadImage(img, fallback, item) {
    img.hidden = false;
    fallback.hidden = true;
    img.alt = item.alt;
    img.src = item.src;
    img.onerror = () => showFallback(img, fallback, item);
    img.onload = () => {
      img.hidden = false;
      fallback.hidden = true;
      if (img === proofImage) {
        const r = img.naturalWidth / img.naturalHeight;
        if (r)
          proofImage.parentElement.style.setProperty(
            "--proof-ratio",
            Math.min(1.8, Math.max(0.9, r)).toFixed(3),
          );
      }
    };
  }
  function setActive(index, animate = true) {
    activeIndex = (index + ABOUT_PROOF.length) % ABOUT_PROOF.length;
    const item = ABOUT_PROOF[activeIndex];
    if (animate && !reduceMotion.matches) {
      proofCard.classList.remove("is-changing");
      void proofCard.offsetWidth;
      proofCard.classList.add("is-changing");
    }
    loadImage(proofImage, proofPlaceholder, item);
    proofType.textContent = item.type;
    proofTitle.textContent = item.title;
    proofSubtitle.textContent = item.subtitle;
    proofYear.textContent = item.year;
    proofYear.hidden = !item.year;
    proofCounter.textContent = `${activeIndex + 1} / ${ABOUT_PROOF.length}`;
    proofDots.forEach((dot, i) =>
      dot.classList.toggle("is-active", i === activeIndex),
    );
    proofCard.setAttribute("aria-label", `Open highlight: ${item.title}`);
    highlights.forEach((li, i) => {
      const active =
        ABOUT_PROOF.findIndex((entry) => entry.id === li.dataset.proof) ===
        activeIndex;
      li.classList.toggle("is-active", active);
      li.setAttribute("aria-current", active ? "true" : "false");
    });
    const itemIndex = highlights.findIndex(
      (li) => li.dataset.proof === item.id,
    );
    if (itemIndex >= 0) {
      highlights.forEach((li) => {
        const thumb = li.querySelector(".highlight-thumb");
        if (thumb)
          thumb.classList.toggle("is-current", li.dataset.proof === item.id);
      });
    }
  }
  function itemForHighlight(li) {
    return ABOUT_PROOF.findIndex((item) => item.id === li.dataset.proof);
  }
  function openProof(index, source) {
    const safeIndex = (index + ABOUT_PROOF.length) % ABOUT_PROOF.length;
    opener = source || proofCard;
    setActive(safeIndex, false);
    const item = ABOUT_PROOF[activeIndex];
    loadImage(dialogImage, dialogPlaceholder, item);
    dialogTitle.textContent = item.title;
    dialogType.textContent = item.type;
    dialogSubtitle.textContent = item.subtitle;
    dialogYear.textContent = item.year;
    dialogYear.hidden = !item.year;
    dialogCounter.textContent = `${activeIndex + 1} / ${ABOUT_PROOF.length}`;
    dialogFooterCount.textContent = `${activeIndex + 1} / ${ABOUT_PROOF.length}`;
    dialogVerify.hidden = !item.verifyUrl;
    if (item.verifyUrl) dialogVerify.href = item.verifyUrl;
    else dialogVerify.removeAttribute("href");
    priorBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    closeButton.focus({ preventScroll: true });
  }
  function changeDialogItem(delta) {
    if (!dialog.open) return;
    const index =
      (activeIndex + delta + ABOUT_PROOF.length) % ABOUT_PROOF.length;
    setActive(index, false);
    const item = ABOUT_PROOF[activeIndex];
    loadImage(dialogImage, dialogPlaceholder, item);
    dialogTitle.textContent = item.title;
    dialogType.textContent = item.type;
    dialogSubtitle.textContent = item.subtitle;
    dialogYear.textContent = item.year;
    dialogYear.hidden = !item.year;
    dialogCounter.textContent = `${activeIndex + 1} / ${ABOUT_PROOF.length}`;
    dialogFooterCount.textContent = `${activeIndex + 1} / ${ABOUT_PROOF.length}`;
    dialogVerify.hidden = !item.verifyUrl;
    if (item.verifyUrl) dialogVerify.href = item.verifyUrl;
    else dialogVerify.removeAttribute("href");
  }
  function closeProof() {
    if (dialog.open) dialog.close();
  }

  // Add a resilient thumbnail to each highlight; it is displayed only on touch/mobile layouts.
  highlights.forEach((li) => {
    const item = ABOUT_PROOF.find((entry) => entry.id === li.dataset.proof);
    if (!item) return;
    const title =
      li.querySelector("span:first-child")?.textContent || item.title;
    const thumb = document.createElement("span");
    thumb.className = "highlight-thumb";
    thumb.setAttribute("aria-hidden", "true");
    const image = document.createElement("img");
    image.loading = "lazy";
    image.decoding = "async";
    image.alt = "";
    image.src = item.src;
    const fallback = document.createElement("span");
    fallback.className = "highlight-thumb-placeholder";
    fallback.hidden = true;
    fallback.innerHTML =
      '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="11" y="5" width="26" height="32" rx="2"/><path d="M17 14h14M17 20h14M17 26h8M24 37l-4 7-2-4-4 1 4-8M24 37l4 7 2-4 4 1-4-8"/><circle cx="24" cy="31" r="5"/></svg>';
    image.onerror = () => {
      image.hidden = true;
      fallback.hidden = false;
    };
    image.onload = () => {
      image.hidden = false;
      fallback.hidden = true;
    };
    thumb.append(image, fallback);
    const textWrap = document.createElement("span");
    textWrap.className = "highlight-text";
    const titleSpan = li.querySelector("span:first-child");
    const detailSpan = li.querySelector("span:nth-child(2)");
    if (titleSpan && detailSpan) {
      titleSpan.before(thumb);
      titleSpan.classList.add("highlight-title");
      detailSpan.classList.add("highlight-detail");
      titleSpan.before(textWrap);
      textWrap.append(titleSpan, detailSpan);
    }
    li.setAttribute(
      "aria-label",
      `${title}. ${detailSpan?.textContent || item.subtitle}. Open highlight details.`,
    );
    li.addEventListener("click", () => openProof(itemForHighlight(li), li));
    li.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProof(itemForHighlight(li), li);
      }
    });
    li.addEventListener("focus", () => setActive(itemForHighlight(li)));
    if (finePointer.matches && !reduceMotion.matches) {
      li.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen")
          return;
        window.clearTimeout(hoverTimer);
        const index = itemForHighlight(li);
        hoverTimer = window.setTimeout(() => setActive(index), 60);
      });
    }
  });

  proofCard.addEventListener("click", () => openProof(activeIndex, proofCard));
  if (finePointer.matches && !reduceMotion.matches) {
    proofWrap.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen")
          return;
        pendingPointer = event;
        if (tiltFrame) return;
        tiltFrame = requestAnimationFrame(() => {
          tiltFrame = 0;
          if (!pendingPointer) return;
          const rect = proofWrap.getBoundingClientRect();
          const nx = Math.max(
            -1,
            Math.min(
              1,
              ((pendingPointer.clientX - rect.left) / rect.width - 0.5) * 2,
            ),
          );
          const ny = Math.max(
            -1,
            Math.min(
              1,
              ((pendingPointer.clientY - rect.top) / rect.height - 0.5) * 2,
            ),
          );
          proofCard.style.setProperty("--proof-tilt-x", `${-ny * 7}deg`);
          proofCard.style.setProperty("--proof-tilt-y", `${nx * 7}deg`);
          proofCard.style.setProperty("--proof-gx", `${(nx * 0.5 + 0.5) * 100}%`);
          proofCard.style.setProperty("--proof-gy", `${(ny * 0.5 + 0.5) * 100}%`);
          proofCard.classList.add("is-tilting");
        });
      },
      { passive: true },
    );
    proofWrap.addEventListener("pointerleave", () => {
      pendingPointer = null;
      if (tiltFrame) cancelAnimationFrame(tiltFrame);
      tiltFrame = 0;
      proofCard.classList.remove("is-tilting");
      proofCard.style.setProperty("--proof-tilt-x", "0deg");
      proofCard.style.setProperty("--proof-tilt-y", "0deg");
      proofCard.style.setProperty("--proof-gx", "50%");
      proofCard.style.setProperty("--proof-gy", "30%");
    });
  }

  if ("IntersectionObserver" in window) {
    const centreObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = itemForHighlight(entry.target);
          if (index >= 0) setActive(index);
        });
      },
      { root: null, rootMargin: "-44% 0px -44% 0px", threshold: 0 },
    );
    highlights.forEach((li) => centreObserver.observe(li));
  }

  previousButton.addEventListener("click", () => changeDialogItem(-1));
  nextButton.addEventListener("click", () => changeDialogItem(1));
  closeButton.addEventListener("click", closeProof);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeProof();
  });
  dialog.addEventListener("cancel", (event) => {
    event.stopPropagation();
  });
  dialog.addEventListener("close", () => {
    document.body.style.overflow = priorBodyOverflow;
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      changeDialogItem(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      changeDialogItem(1);
    }
  });

  setActive(0, false);
})();

// Journey accordion enhancement; the HTML panels stay readable without JavaScript.
(() => {
  const timeline = document.querySelector("#journey .timeline");
  if (!timeline) return;

  // Keep the requested reflection copy scoped to its matching Journey entries.
  const entryByTitle = (title) =>
    [...timeline.querySelectorAll(".timeline-item")].find((item) =>
      item.querySelector(".timeline-toggle h3")?.textContent.trim().includes(title),
    );
  const setTaughtText = (item, text) => {
    const taught = item?.querySelector(".timeline-taught");
    if (!taught) return;
    [...taught.childNodes].forEach((node) => {
      if (!(node.nodeType === Node.ELEMENT_NODE && node.classList.contains("timeline-taught-label")))
        node.remove();
    });
    taught.append(document.createTextNode(text));
  };
  const setDetailText = (item, html) => {
    const detail = item?.querySelector(".timeline-panel-inner > p:not(.timeline-taught)");
    if (detail) detail.innerHTML = html;
  };

  const silverAward = entryByTitle("Silver Award");
  setDetailText(
    silverAward,
    "Awarded to me for presenting StudySync, my first mobile application, developed in Android Studio with Firebase as the database. Looking back, the interface still has room to improve. Design isn't my strongest skill yet, and I'm actively working on it.",
  );
  setTaughtText(
    silverAward,
    "Turning a project into something I can explain clearly, and being honest about what to improve next.",
  );

  const programDirector = entryByTitle("Program Director");
  const programDetail = programDirector?.querySelector(".timeline-panel-inner > p:not(.timeline-taught)");
  const programAddition = "The role helped me sharpen my leadership skills. I learned not to reject people's opinions outright, but to acknowledge them and explain the better option we have, which also strengthened my communication. I usually take a little time to warm up to new people, so thank you for your patience.";
  if (programDetail && !programDetail.textContent.includes(programAddition))
    programDetail.append(document.createTextNode(" " + programAddition));
  setTaughtText(
    programDirector,
    "Planning properly, delegating tasks, and leading by listening before explaining.",
  );

  const academicAward = entryByTitle("Academic Excellence Award");
  setDetailText(
    academicAward,
    `Recognised at the Majlis Apresiasi Pelajar for a GPA of 3.96 in Semesters 1 and 2. I have made the Dean's List every semester so far, Alhamdulillah (<span lang="ar" dir="rtl" style="font-family: system-ui, 'Noto Naskh Arabic', 'Segoe UI', sans-serif; white-space: nowrap;">الحمد لله</span>).`,
  );
  const academicTags = academicAward?.querySelector(".timeline-panel-grid .tag-list");
  if (academicTags && ![...academicTags.children].some((tag) => tag.textContent.trim() === "Dean's List")) {
    const tag = document.createElement("span");
    tag.textContent = "Dean's List";
    academicTags.append(tag);
  }
  setTaughtText(
    academicAward,
    "Consistency matters more than bursts of effort, and I'm thankful to God for the opportunity.",
  );

  const items = [...timeline.querySelectorAll(".timeline-item")].filter(
    (item) => !item.classList.contains("timeline-next"),
  );
  const toggles = items.map((item) => item.querySelector(".timeline-toggle")).filter(Boolean);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setOpen(targetItem, shouldOpen) {
    items.forEach((item) => {
      const toggle = item.querySelector(".timeline-toggle");
      const panel = toggle && document.getElementById(toggle.getAttribute("aria-controls"));
      const open = item === targetItem && shouldOpen;
      item.classList.toggle("is-open", open);
      if (toggle) toggle.setAttribute("aria-expanded", String(open));
      if (panel) {
        panel.classList.toggle("is-open", open);
        if (reduceMotion.matches) panel.style.transition = "none";
        else panel.style.removeProperty("transition");
      }
    });
  }

  timeline.classList.add("is-enhanced");
  const defaultItem = items.find((item) => item.querySelector("#timeline-toggle-mef")) || items[0];
  if (defaultItem) setOpen(defaultItem, true);

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const item = toggle.closest(".timeline-item");
      setOpen(item, toggle.getAttribute("aria-expanded") !== "true");
    });
  });

  const syncMotionPreference = () => {
    timeline.querySelectorAll(".timeline-panel-grid").forEach((panel) => {
      panel.style.transition = reduceMotion.matches ? "none" : "";
    });
  };
  if (typeof reduceMotion.addEventListener === "function")
    reduceMotion.addEventListener("change", syncMotionPreference);
  else if (typeof reduceMotion.addListener === "function")
    reduceMotion.addListener(syncMotionPreference);

  // Keep the timeline layout stable when responsive breakpoints change.
  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      syncMotionPreference();
    });
  }, { passive: true });
  syncMotionPreference();
})();

// Count the three MEF figures once, when their panel is open and in view.
function initMefStats() {
  const panel = document.querySelector("#journey #timeline-panel-mef");
  const item = panel?.closest(".timeline-item");
  const tiles = [...(panel?.querySelectorAll(".mef-stat-tile") || [])];
  if (!panel || !item || tiles.length !== 3) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let panelInView = false;
  let started = false;

  const setFinalValue = (number) => {
    const target = Number(number.dataset.target);
    const prefix = number.dataset.prefix || "";
    number.textContent = `${prefix}${target.toLocaleString("en-US")}`;
  };

  const countTile = (tile, index) => {
    if (tile.dataset.counted === "true") return;
    const number = tile.querySelector(".mef-stat-number");
    if (!number) return;
    tile.dataset.counted = "true";
    if (reduceMotion.matches) {
      setFinalValue(number);
      return;
    }
    const target = Number(number.dataset.target);
    const prefix = number.dataset.prefix || "";
    const duration = 1200;
    window.setTimeout(() => {
      const startTime = performance.now();
      const frame = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        number.textContent = `${prefix}${value.toLocaleString("en-US")}`;
        if (progress < 1 && !reduceMotion.matches) requestAnimationFrame(frame);
        else setFinalValue(number);
      };
      requestAnimationFrame(frame);
    }, index * 100);
  };

  const maybeStart = () => {
    if (started || !panelInView || !panel.classList.contains("is-open") || !item.classList.contains("is-open")) return;
    started = true;
    tiles.forEach(countTile);
  };

  const checkViewport = () => {
    const rect = panel.getBoundingClientRect();
    panelInView = rect.bottom > 0 && rect.top < window.innerHeight;
    maybeStart();
  };

  if (reduceMotion.matches) {
    tiles.forEach((tile) => {
      const number = tile.querySelector(".mef-stat-number");
      if (number) setFinalValue(number);
      tile.dataset.counted = "true";
    });
    started = true;
    return;
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      panelInView = entries.some((entry) => entry.isIntersecting);
      maybeStart();
    }, { threshold: 0.05 });
    observer.observe(panel);
  } else {
    window.addEventListener("scroll", checkViewport, { passive: true });
    window.addEventListener("resize", checkViewport, { passive: true });
    checkViewport();
  }

  const openObserver = new MutationObserver(maybeStart);
  openObserver.observe(panel, { attributes: true, attributeFilter: ["class"] });
  openObserver.observe(item, { attributes: true, attributeFilter: ["class"] });
  checkViewport();
}
initMefStats();


// About-only decorative layer. Kept separate from the Work symbol generator and all existing functions.
function initAboutDecor() {
  const section = document.querySelector("#about");
  const layer = section?.querySelector(".about-symbols");
  if (!section || !layer || layer.dataset.ready === "true") return;
  layer.dataset.ready = "true";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const iconPaths = [
    '<path d="M2 6.5 8 3l6 3.5-6 3.4z"/><path d="M4.5 8.2v3.2c2.2 1.6 4.8 1.6 7 0V8.2M14 7v4"/>',
    '<path d="M5 3h6l-.6 4.2 2.8 2.5-.8 2.1H3.6l-.8-2.1 2.8-2.5z"/><path d="M6 12v2h4v-2M6 5h4"/>',
    '<path d="M6.7 2.5h2.6l.5 1.7 1.4.8 1.7-.5 1.3 2.2-1.2 1.3v1.6l1.2 1.3-1.3 2.2-1.7-.5-1.4.8-.5 1.7H6.7l-.5-1.7-1.4-.8-1.7.5-1.3-2.2L3 9.6V8L1.8 6.7l1.3-2.2 1.7.5 1.4-.8z"/><circle cx="8" cy="8.8" r="2.2"/>',
    '<circle cx="8" cy="5.2" r="2.5"/><path d="M3 14c.4-2.4 2.2-3.8 5-3.8s4.6 1.4 5 3.8"/>',
    '<path d="M8 2 13 4v3.5c0 3-2 5.1-5 6.5-3-1.4-5-3.5-5-6.5V4z"/><path d="m5.4 7.8 1.7 1.7 3.5-3.6"/>',
    '<path d="m3.2 8.2 3.1 3.1 6.5-6.6"/>',
    '<path d="M5.2 10.4c0-1.3-1.8-2.1-1.8-4.1a4.6 4.6 0 0 1 9.2 0c0 2-1.8 2.8-1.8 4.1z"/><path d="M5.4 12h5.2M6.2 14h3.6"/>',
  ];
  const iconNames = ["graduation-cap", "trophy", "gear", "person", "shield-check", "check", "lightbulb"];
  const symbolCount = () => 16;
  const rand = (min, max) => min + Math.random() * (max - min);
  const positions = [];
  const makePosition = (index, total) => {
    // About 60% use the outer margins; remaining symbols are spread across the section.
    const sidePlacement = index < Math.round(total * .6);
    for (let attempt = 0; attempt < 80; attempt++) {
      const x = sidePlacement
        ? (index % 2 === 0 ? rand(2, 17) : rand(83, 98))
        : rand(12, 88);
      const y = rand(5, 94);
      if (positions.every((point) => Math.hypot((point.x - x) * .8, point.y - y) >= 11)) {
        positions.push({ x, y });
        return { x, y };
      }
    }
    const fallback = { x: sidePlacement ? (index % 2 === 0 ? 6 : 94) : rand(18, 82), y: 7 + (index * 83 / total) };
    positions.push(fallback);
    return fallback;
  };
  const renderSymbols = () => {
    layer.replaceChildren();
    positions.length = 0;
    const count = symbolCount();
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const point = makePosition(i, count);
      const depth = i % 3 === 0 ? "far" : i % 3 === 1 ? "mid" : "near";
      const iconIndex = i % iconPaths.length;
      const symbol = document.createElement("span");
      symbol.className = `about-symbol depth-${depth}${Math.random() < .25 ? " is-accent" : ""}`;
      symbol.setAttribute("aria-hidden", "true");
      symbol.style.left = `${point.x}%`;
      symbol.style.top = `${point.y}%`;
      const sizeRange = depth === "far" ? [22, 32] : depth === "mid" ? [30, 42] : [40, 54];
      symbol.style.setProperty("--symbol-size", `${Math.round(rand(sizeRange[0], sizeRange[1]))}px`);
      symbol.style.setProperty("--symbol-duration", `${rand(18, 32).toFixed(1)}s`);
      symbol.style.setProperty("--symbol-delay", `${(-rand(0, 30)).toFixed(1)}s`);
      symbol.style.setProperty("--symbol-dx", `${Math.round(rand(-24, 24))}px`);
      symbol.style.setProperty("--symbol-dy", `${Math.round(rand(-20, 20))}px`);
      symbol.style.setProperty("--symbol-rotation", `${rand(-12, 12).toFixed(1)}deg`);
      symbol.innerHTML = `<svg viewBox="0 0 16 16" role="presentation" focusable="false" data-icon="${iconNames[iconIndex]}">${iconPaths[iconIndex]}</svg>`;
      fragment.appendChild(symbol);
    }
    layer.appendChild(fragment);
    if (reduceMotion.matches) {
      layer.querySelectorAll(".about-symbol").forEach((symbol) => {
        symbol.style.animation = "none";
        symbol.style.willChange = "auto";
      });
    }
  };
  renderSymbols();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => section.classList.toggle("about-in-view", entry.isIntersecting));
    }, { threshold: 0.01 });
    observer.observe(section);
  } else {
    section.classList.add("about-in-view");
  }

  if (finePointer.matches && !reduceMotion.matches) {
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    section.addEventListener("pointerenter", () => section.classList.add("about-pointer-inside"));
    section.addEventListener("pointerleave", () => section.classList.remove("about-pointer-inside"));
    section.addEventListener("pointermove", (event) => {
      const rect = section.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        section.style.setProperty("--mx", `${pointerX}px`);
        section.style.setProperty("--my", `${pointerY}px`);
        pointerFrame = 0;
      });
    }, { passive: true });
  }
}
initAboutDecor();

// Journey-only decor, ghost-year reveals, and scroll-linked timeline progress.
function initJourneyDecor() {
  const section = document.querySelector("#journey");
  const timeline = section?.querySelector(".timeline");
  if (!section || !timeline) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const glowObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => section.classList.toggle("is-in-view", entry.isIntersecting));
      }, { threshold: 0.01 })
    : null;
  if (glowObserver) glowObserver.observe(section);
  else section.classList.add("is-in-view");

  const years = [...timeline.querySelectorAll(".timeline-year")];
  if (reduceMotion.matches) {
    years.forEach((year) => year.classList.add("is-year-visible"));
  } else if ("IntersectionObserver" in window) {
    const yearObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelector(".timeline-year")?.classList.add("is-year-visible");
          yearObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    years.forEach((year) => yearObserver.observe(year.closest(".timeline-item")));
  }

  timeline.classList.add("has-scroll-progress");

  let frame = 0;
  let timelineHeight = 0;
  const measure = () => {
    timelineHeight = timeline.getBoundingClientRect().height;
  };
  const update = () => {
    frame = 0;
    if (reduceMotion.matches) {
      timeline.style.setProperty("--timeline-progress", "1");
      timeline.querySelectorAll(".timeline-marker").forEach((marker) => marker.classList.add("is-reached"));
      return;
    }
    const rect = timeline.getBoundingClientRect();
    const height = timelineHeight || rect.height;
    const amount = height > 0
      ? Math.max(0, Math.min(1, (window.innerHeight * 0.55 - rect.top) / height))
      : 1;
    timeline.style.setProperty("--timeline-progress", String(amount));
    const progressDistance = amount * height;
    timeline.querySelectorAll(".timeline-marker").forEach((marker) => {
      const markerRect = marker.getBoundingClientRect();
      const markerCenter = markerRect.top + markerRect.height / 2 - rect.top;
      marker.classList.toggle("is-reached", markerCenter <= progressDistance);
    });
  };
  const scheduleUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };
  const refreshMeasurements = () => {
    measure();
    scheduleUpdate();
  };

  measure();
  update();
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", refreshMeasurements, { passive: true });
  if ("ResizeObserver" in window) {
    const timelineResizeObserver = new ResizeObserver(refreshMeasurements);
    timelineResizeObserver.observe(timeline);
  }
  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", () => {
      if (reduceMotion.matches) {
        timeline.style.setProperty("--timeline-progress", "1");
        timeline.querySelectorAll(".timeline-marker").forEach((marker) => marker.classList.add("is-reached"));
        section.classList.remove("is-in-view");
      } else {
        scheduleUpdate();
      }
    });
  }
}
initJourneyDecor();


// Contact-only behavior: placeholder safety, copy feedback, shared resume dialog, and decorative motion.
function initContact() {
  const section = document.querySelector("#contact");
  const panel = section?.querySelector(".contact-panel");
  if (!section || !panel) return;

  // Hide unfinished social links automatically until their real URLs are supplied.
  panel.querySelectorAll(".contact-card-social a[href]").forEach((link) => {
    if (link.getAttribute("href")?.includes("YOUR-")) {
      const card = link.closest(".contact-card");
      if (card) card.hidden = true;
    }
  });

  // Use the existing resume-dialog function and flow.
  const resumeButton = panel.querySelector(".contact-resume-button");
  if (resumeButton && typeof openResume === "function") {
    resumeButton.addEventListener("click", (event) => {
      event.preventDefault();
      openResume(event);
    });
  }

  const liveRegion = panel.querySelector(".contact-copy-live");
  panel.querySelectorAll(".contact-copy-button[data-copy]").forEach((button) => {
    let resetTimer = 0;
    button.addEventListener("click", async () => {
      const value = button.dataset.copy || "";
      const announce = (message, liveMessage = "") => {
        button.textContent = message;
        if (liveRegion) liveRegion.textContent = liveMessage;
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          button.textContent = "Copy";
          if (liveRegion) liveRegion.textContent = "";
        }, 2000);
      };
      const fallbackCopy = () => {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";
        document.body.appendChild(textarea);
        textarea.select();
        let copied = false;
        try {
          copied = document.execCommand("copy");
        } finally {
          textarea.remove();
        }
        if (!copied) throw new Error("Copy command failed");
      };
      try {
        if (navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(value);
          } catch {
            fallbackCopy();
          }
        } else {
          fallbackCopy();
        }
        announce("Copied ✓", "Copied");
      } catch {
        announce("Copy failed");
      }
    });
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => panel.classList.toggle("contact-rings-in-view", entry.isIntersecting));
    }, { threshold: 0.01 });
    observer.observe(panel);
  } else {
    panel.classList.toggle("contact-rings-in-view", !reduceMotion.matches);
  }

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (finePointer.matches && !reduceMotion.matches) {
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    panel.addEventListener("pointerenter", () => panel.classList.add("contact-pointer-inside"));
    panel.addEventListener("pointerleave", () => panel.classList.remove("contact-pointer-inside"));
    panel.addEventListener("pointermove", (event) => {
      const rect = panel.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        panel.style.setProperty("--mx", `${pointerX}px`);
        panel.style.setProperty("--my", `${pointerY}px`);
        pointerFrame = 0;
      });
    }, { passive: true });
  }
}
initContact();


// Contact-only ambient background. Kept separate from initContact's existing behavior.
function initContactAmbient() {
  const panel = document.querySelector("#contact .contact-panel");
  const ambient = panel?.querySelector(".contact-ambient");
  const floaterLayer = ambient?.querySelector(".contact-floaters");
  if (!panel || !ambient || !floaterLayer || ambient.dataset.ready === "true") return;
  ambient.dataset.ready = "true";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopQuery = window.matchMedia("(min-width: 1025px)");
  const tabletQuery = window.matchMedia("(min-width: 761px) and (max-width: 1024px)");
  const iconPaths = [
    '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.5 2 2 3.5 4 4l1-1 2 1c-.2 1.5-1.3 2-2.6 1.7-3.3-.8-5.8-3.4-6.3-6.1"/>',
    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    '<path d="M7 3.5h3l2 5-2 1.5a15 15 0 0 0 4 4l1.5-2 5 2v3c0 1.1-.9 2-2 2C10 19 5 14 5 5.5c0-1.1.9-2 2-2Z"/>',
    null,
    '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    null,
  ];
  const iconNames = ["chat", "mail", "phone", "hi", "plane", "at"];
  const iconIndex = { chat: 0, mail: 1, phone: 2, hi: 3, plane: 4, at: 5 };
  const createIcon = (name) => {
    const el = document.createElement("span");
    el.className = "contact-floater";
    el.dataset.icon = name;
    if (name === "hi" || name === "at") {
      const label = document.createElement("span");
      label.className = "contact-floater-text";
      label.textContent = name === "hi" ? "hi" : "@";
      el.appendChild(label);
    } else {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      svg.innerHTML = iconPaths[iconIndex[name]];
      el.appendChild(svg);
    }
    return el;
  };
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const positionFloaters = () => {
    const width = panel.getBoundingClientRect().width;
    const count = reduceMotion.matches ? 4 : desktopQuery.matches ? 4 : tabletQuery.matches ? 3 : 2;
    const depthStyles = [
      { depth: "far", opacity: .12, blur: "2px", size: 22 },
      { depth: "mid", opacity: .18, blur: ".8px", size: 32 },
      { depth: "near", opacity: .26, blur: "0", size: 44 },
    ];
    const icons = [];
    if (reduceMotion.matches) icons.push("chat", "mail", "phone", "hi");
    else for (let i = 0; i < count; i++) icons.push(iconNames[i % iconNames.length]);
    floaterLayer.replaceChildren();
    const placed = [];
    icons.forEach((name, i) => {
      const el = createIcon(name);
      const depth = depthStyles[i % depthStyles.length];
      let x = 52;
      let y = 15;
      let attempt = 0;
      do {
        x = Math.random() < .3 ? randomBetween(3, 10) : randomBetween(52, 100 - (depth.size / width * 100) - 4);
        y = randomBetween(8, 92);
        attempt++;
      } while (attempt < 35 && placed.some((point) => Math.hypot((point.x - x) * width / 100, (point.y - y) * 3.2) < 58));
      placed.push({ x, y });
      el.style.setProperty("--float-x", `${x}%`);
      el.style.setProperty("--float-y", reduceMotion.matches ? `${y}%` : `${y}%`);
      el.style.setProperty("--float-size", `${depth.size}px`);
      el.style.setProperty("--float-opacity", String(depth.opacity * (window.matchMedia("(max-width: 899px)").matches && !reduceMotion.matches ? .7 : 1)));
      el.style.setProperty("--float-blur", reduceMotion.matches ? "0" : depth.blur);
      el.style.setProperty("--float-duration", `${randomBetween(14, 24)}s`);
      el.style.setProperty("--float-delay", `${reduceMotion.matches ? "0" : `${-randomBetween(0, 24)}s`}`);
      el.style.setProperty("--float-sway", `${randomBetween(-14, 14).toFixed(1)}px`);
      el.style.setProperty("--float-rot", `${randomBetween(-10, 10).toFixed(1)}deg`);
      if (Math.random() < .25) el.classList.add("is-accent");
      if (reduceMotion.matches) {
        el.style.animation = "none";
        el.style.willChange = "auto";
      }
      floaterLayer.appendChild(el);
    });
  };
  const updateAmbient = () => positionFloaters();
  updateAmbient();
  if ("ResizeObserver" in window) {
    const ambientResizeObserver = new ResizeObserver(() => positionFloaters());
    ambientResizeObserver.observe(panel);
  }
  window.addEventListener("resize", positionFloaters, { passive: true });
  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", () => {
      updateAmbient();
    });
  }


}
initContactAmbient();

function initContactNetwork() {
  const panel = document.querySelector("#contact .contact-panel");
  const canvas = panel?.querySelector(".contact-network");
  if (!panel || !canvas || canvas.dataset.ready === "true") return;
  canvas.dataset.ready = "true";
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let w = 0, h = 0, dpr = 1, nodes = [], raf = 0, last = 0, running = false;
  const cursor = { x: -9999, y: -9999, on: false };
  const LINK = 150, CURSOR_LINK = 170;
  const rand = (a, b) => a + Math.random() * (b - a);
  const targetCount = () => Math.max(20, Math.min(w > 1024 ? 70 : w > 760 ? 46 : 28, Math.round((w * h) / 15000)));
  const build = () => {
    nodes = Array.from({ length: targetCount() }, () => {
      const speed = rand(8, 18), angle = rand(0, Math.PI * 2);
      return { x: rand(0, w), y: rand(0, h), vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: rand(1, 2), a: rand(.45, .7), phase: rand(0, Math.PI * 2) };
    });
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    const pulseTime = reduceMotion.matches ? 0 : performance.now() / 1900;
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      const pulse = reduceMotion.matches ? 1 : .88 + .12 * Math.sin(pulseTime + p.phase);
      for (let j = i + 1; j < nodes.length; j++) {
        const q = nodes[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < LINK) { ctx.strokeStyle = `rgba(167,238,120,${(1 - d / LINK) * .24 * pulse})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      if (cursor.on) {
        const d = Math.hypot(p.x - cursor.x, p.y - cursor.y);
        if (d < CURSOR_LINK) { ctx.strokeStyle = `rgba(167,238,120,${(1 - d / CURSOR_LINK) * .4})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(cursor.x, cursor.y); ctx.stroke(); }
      }
    }
    nodes.forEach((p) => {
      const pulse = reduceMotion.matches ? 1 : .9 + .1 * Math.sin(pulseTime + p.phase);
      ctx.fillStyle = `rgba(167,238,120,${p.a * pulse})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
  };
  const resize = () => {
    const rect = panel.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.round(rect.width); h = Math.round(rect.height);
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build(); draw();
  };
  const step = (t) => {
    if (!running) return;
    const dt = Math.min((t - last) / 1000 || 0, .05); last = t;
    nodes.forEach((p) => {
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < 0 || p.x > w) { p.vx *= -1; p.x = Math.max(0, Math.min(w, p.x)); }
      if (p.y < 0 || p.y > h) { p.vy *= -1; p.y = Math.max(0, Math.min(h, p.y)); }
    });
    draw(); raf = requestAnimationFrame(step);
  };
  let inView = false;
  const start = () => { if (running || reduceMotion.matches || document.hidden) return; running = true; last = performance.now(); raf = requestAnimationFrame(step); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  const sync = () => (inView && !document.hidden && !reduceMotion.matches ? start() : stop());
  if ("IntersectionObserver" in window) new IntersectionObserver((e) => { inView = e[0].isIntersecting; sync(); }, { threshold: 0.01 }).observe(panel);
  else { inView = true; sync(); }
  document.addEventListener("visibilitychange", sync);
  if (typeof reduceMotion.addEventListener === "function") reduceMotion.addEventListener("change", () => { sync(); draw(); });
  if (finePointer.matches) {
    panel.addEventListener("pointermove", (e) => { const r = panel.getBoundingClientRect(); cursor.x = e.clientX - r.left; cursor.y = e.clientY - r.top; cursor.on = true; }, { passive: true });
    panel.addEventListener("pointerleave", () => { cursor.on = false; });
  }
  if ("ResizeObserver" in window) { let t = 0; new ResizeObserver(() => { clearTimeout(t); t = setTimeout(resize, 120); }).observe(panel); }
  resize();
}
initContactNetwork();
