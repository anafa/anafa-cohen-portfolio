async function loadContent() {
  // no-store: content/cv.json changes constantly during active development
  // and the browser's default heuristic caching can serve a stale copy
  // (e.g. still showing headshot/logo placeholders after they're filled
  // in) even on a normal reload — only a hard refresh would show new data.
  const response = await fetch("content/cv.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load content/cv.json: ${response.status}`);
  }
  return response.json();
}

function renderHero(cv) {
  document.getElementById("hero-name").textContent = cv.name;
  document.getElementById("hero-tagline").textContent = cv.tagline;

  const img = document.getElementById("hero-photo-img");
  if (cv.headshot && !cv.headshot.placeholder && cv.headshot.photo) {
    img.src = `images/${cv.headshot.photo}`;
    img.alt = `Portrait of ${cv.name}`;
    img.hidden = false;
  }
}

function renderAbout(cv) {
  document.getElementById("about-bio").textContent = cv.bio;

  const rows = [
    { label: "Education", value: cv.education[0].degree },
    { label: "Focus Areas", value: cv.highlights.domains.join(" · ") },
  ];

  const readout = document.getElementById("about-readout");
  for (const row of rows) {
    const item = document.createElement("div");
    item.className = "readout-row";

    const dt = document.createElement("dt");
    dt.textContent = row.label;

    const dd = document.createElement("dd");
    dd.textContent = row.value;

    item.append(dt, dd);
    readout.append(item);
  }
}

function formatDateRange(startDate, endDate) {
  return startDate === endDate ? startDate : `${startDate} – ${endDate}`;
}

function buildLogo(role) {
  const wrap = document.createElement("div");
  wrap.className = "role-logo";

  if (role.logo && !role.logo.placeholder && role.logo.file) {
    const img = document.createElement("img");
    img.className = "logo-img";
    img.src = `images/${role.logo.file}`;
    img.alt = `${role.company} logo`;
    wrap.append(img);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "photo-placeholder logo-placeholder";
    placeholder.innerHTML = "<span>Logo</span>";
    wrap.append(placeholder);
  }

  return wrap;
}

function buildGallery(role) {
  const wrap = document.createElement("div");
  wrap.className = "role-gallery";

  const viewport = document.createElement("div");
  viewport.className = "gallery-viewport";

  const track = document.createElement("div");
  track.className = "gallery-track";

  const images = role.gallery && role.gallery.length > 0 ? role.gallery : [null];

  for (const image of images) {
    const slide = document.createElement("div");
    slide.className = "gallery-slide";

    if (image && image.file) {
      const img = document.createElement("img");
      img.className = "gallery-image";
      img.src = `images/${image.file}`;
      img.alt = image.alt || `Project image from ${role.company}`;
      slide.append(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "gallery-placeholder";
      placeholder.innerHTML = "<span>Project images coming soon</span>";
      slide.append(placeholder);
    }

    track.append(slide);
  }

  viewport.append(track);
  wrap.append(viewport);

  if (images.length > 1) {
    let index = 0;

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "gallery-prev";
    prevBtn.setAttribute("aria-label", `Previous project image, ${role.company}`);
    prevBtn.textContent = "‹";

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "gallery-next";
    nextBtn.setAttribute("aria-label", `Next project image, ${role.company}`);
    nextBtn.textContent = "›";

    const dots = document.createElement("div");
    dots.className = "gallery-dots";
    const dotButtons = images.map((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gallery-dot";
      dot.setAttribute("aria-label", `Go to image ${i + 1} of ${images.length}`);
      dots.append(dot);
      return dot;
    });

    const update = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === images.length - 1;
      dotButtons.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };

    prevBtn.addEventListener("click", () => {
      index = Math.max(0, index - 1);
      update();
    });
    nextBtn.addEventListener("click", () => {
      index = Math.min(images.length - 1, index + 1);
      update();
    });
    dotButtons.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        index = i;
        update();
      });
    });

    update();
    // Arrows are appended to the viewport (the image box itself), not
    // `wrap` (which also contains the dots row below it) — so `top: 50%`
    // centers them on the image, not on image+dots combined.
    viewport.append(prevBtn, nextBtn);
    wrap.append(dots);
  }

  return wrap;
}

function renderExperience(cv) {
  const list = document.getElementById("role-list");

  for (const role of cv.roles) {
    const item = document.createElement("li");
    item.className = "role-card";

    const content = document.createElement("div");
    content.className = "role-content";

    const meta = document.createElement("div");
    meta.className = "role-meta";

    const title = document.createElement("h3");
    title.className = "role-title";
    title.textContent = role.title;

    const company = document.createElement("p");
    company.className = "role-company";
    company.textContent = role.company;

    const dates = document.createElement("p");
    dates.className = "role-dates";
    dates.textContent = formatDateRange(role.startDate, role.endDate);

    meta.append(title, company, dates);

    const bullets = document.createElement("ul");
    bullets.className = "role-bullets";
    for (const point of role.description) {
      const li = document.createElement("li");
      li.textContent = point;
      bullets.append(li);
    }

    content.append(meta, bullets);
    item.append(buildLogo(role), content, buildGallery(role));
    list.append(item);
  }
}

function syncGalleryHeights() {
  const isDesktop = window.matchMedia("(min-width: 768px)").matches;
  const viewports = document.querySelectorAll(".gallery-viewport");

  if (!isDesktop) {
    viewports.forEach((v) => {
      v.style.height = "";
    });
    return;
  }

  const contents = document.querySelectorAll(".role-content");
  let maxHeight = 0;
  contents.forEach((c) => {
    maxHeight = Math.max(maxHeight, c.offsetHeight);
  });
  // Scaled down to 0.75x the matched content height per user request —
  // still tied to content size, just smaller than a 1:1 match.
  maxHeight *= 0.75;

  if (maxHeight > 0) {
    viewports.forEach((v) => {
      v.style.height = `${maxHeight}px`;
    });
  }
}

function initGallerySizing() {
  syncGalleryHeights();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncGalleryHeights);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncGalleryHeights, 150);
  });
}

function renderSkills(cv) {
  const container = document.getElementById("core-capabilities-groups");

  for (const [category, tags] of Object.entries(cv.skills)) {
    const group = document.createElement("div");
    group.className = "skills-group";

    const label = document.createElement("h3");
    label.className = "skills-group-label";
    label.textContent = category;

    const list = document.createElement("ul");
    list.className = "skills-tags";
    for (const tag of tags) {
      const li = document.createElement("li");
      li.className = "skill-tag";
      li.textContent = tag;
      list.append(li);
    }

    group.append(label, list);
    container.append(group);
  }
}

function renderFreelance(cv) {
  const container = document.getElementById("freelance-statement");
  for (const paragraph of cv.freelance.statement) {
    const p = document.createElement("p");
    p.textContent = paragraph;
    container.append(p);
  }
}

function renderContact(cv) {
  const email = document.getElementById("contact-email");
  email.href = `mailto:${cv.contact.email}`;
  email.textContent = cv.contact.email;
}

function initSectionHeadingReveal() {
  const headings = document.querySelectorAll(".section-heading");
  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    headings.forEach((h) => h.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.4 }
  );

  headings.forEach((h) => observer.observe(h));
}

async function init() {
  try {
    const cv = await loadContent();
    renderHero(cv);
    renderAbout(cv);
    renderExperience(cv);
    initGallerySizing();
    renderSkills(cv);
    renderFreelance(cv);
    renderContact(cv);
    initSectionHeadingReveal();
  } catch (err) {
    console.error(err);
    document.getElementById("main").innerHTML =
      '<p role="alert">Sorry, something went wrong loading this page’s content. Please try again shortly, or reach out at <a href="mailto:anafa.anafa@gmail.com">anafa.anafa@gmail.com</a>.</p>';
  }
}

document.addEventListener("DOMContentLoaded", init);
