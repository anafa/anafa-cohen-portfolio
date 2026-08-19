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

// Closes every currently-open project panel. Called before opening a new
// one, so only one project is expanded at a time (site-wide, not just
// within a role) — matches the design's default single-open behavior.
function closeAllProjectPanels() {
  document.querySelectorAll(".project-expanded.is-open").forEach((panel) => {
    panel.classList.remove("is-open");
    panel.parentElement?.classList.remove("is-open");
    const toggleBtn = panel.previousElementSibling;
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", "false");
      const label = toggleBtn.querySelector(".project-toggle-label");
      if (label) label.textContent = "View project →";
    }
  });
}

function buildProjectImage(image, altFallback, className) {
  const wrap = document.createElement("div");
  wrap.className = className;

  if (image && !image.placeholder && image.file) {
    const img = document.createElement("img");
    img.src = `images/${image.file}`;
    img.alt = image.alt || altFallback;
    wrap.append(img);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "photo-placeholder";
    placeholder.innerHTML = `<span>${altFallback}</span>`;
    wrap.append(placeholder);
  }

  return wrap;
}

function buildProjectCard(role, project, panelId) {
  const card = document.createElement("div");
  card.className = "project-card";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "project-toggle";
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", panelId);

  const image = buildProjectImage(project.image, `${role.company} — project photo`, "project-image");

  const body = document.createElement("div");
  body.className = "project-card-body";

  const title = document.createElement("h3");
  title.className = "project-title";
  title.textContent = project.title;

  const blurb = document.createElement("p");
  blurb.className = "project-blurb";
  blurb.textContent = project.blurb;

  const toggleLabel = document.createElement("p");
  toggleLabel.className = "project-toggle-label";
  toggleLabel.textContent = "View project →";

  body.append(title, blurb, toggleLabel);
  btn.append(image, body);

  const panel = document.createElement("div");
  panel.className = "project-expanded";
  panel.id = panelId;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "project-close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "×";

  const description = document.createElement("p");
  description.className = "project-description";
  description.textContent = project.description;

  const bullets = document.createElement("ul");
  bullets.className = "project-bullets";
  for (const point of project.bullets) {
    const li = document.createElement("li");
    li.textContent = point;
    bullets.append(li);
  }

  const moreImages = document.createElement("div");
  moreImages.className = "project-more-images";
  const galleryImages = project.gallery && project.gallery.length > 0 ? project.gallery : [null];
  for (const image of galleryImages) {
    moreImages.append(buildProjectImage(image, "More images coming soon", "project-more-image"));
  }

  panel.append(closeBtn, description, bullets, moreImages);

  const setOpen = (isOpen) => {
    panel.classList.toggle("is-open", isOpen);
    card.classList.toggle("is-open", isOpen);
    btn.setAttribute("aria-expanded", String(isOpen));
    toggleLabel.textContent = isOpen ? "Close ↑" : "View project →";
  };

  btn.addEventListener("click", () => {
    const willOpen = !panel.classList.contains("is-open");
    if (willOpen) {
      closeAllProjectPanels();
    }
    setOpen(willOpen);
  });
  closeBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(false);
  });

  card.append(btn, panel);
  return card;
}

function renderProjects(cv) {
  const container = document.getElementById("role-groups");

  cv.roles.forEach((role, roleIndex) => {
    const group = document.createElement("div");
    group.className = "role-group";

    const header = document.createElement("div");
    header.className = "role-group-header";

    const heading = document.createElement("div");
    heading.className = "role-group-heading";

    const company = document.createElement("p");
    company.className = "role-company";
    company.textContent = role.company;

    const dates = document.createElement("p");
    dates.className = "role-dates";
    dates.textContent = formatDateRange(role.startDate, role.endDate);

    heading.append(company, dates);
    header.append(buildLogo(role), heading);

    const grid = document.createElement("div");
    grid.className = "project-grid";

    role.projects.forEach((project, projectIndex) => {
      const panelId = `project-panel-${roleIndex}-${projectIndex}`;
      grid.append(buildProjectCard(role, project, panelId));
    });

    group.append(header, grid);
    container.append(group);
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
    renderProjects(cv);
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
