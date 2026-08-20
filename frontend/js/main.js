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

function buildProjectCard(role, project) {
  const card = document.createElement("div");
  card.className = "project-card";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "project-toggle";
  btn.setAttribute("aria-haspopup", "dialog");
  btn.setAttribute("aria-controls", "project-modal");

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

  btn.addEventListener("click", () => openProjectModal(role, project, btn));

  card.append(btn);
  return card;
}

function buildProjectModalContent(role, project) {
  const frag = document.createDocumentFragment();

  const eyebrow = document.createElement("p");
  eyebrow.className = "project-modal-eyebrow";
  eyebrow.textContent = role.company;

  const title = document.createElement("h3");
  title.id = "project-modal-title";
  title.className = "project-title";
  title.textContent = project.title;

  const image = buildProjectImage(project.image, `${role.company} — project photo`, "project-image");

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
  for (const galleryImage of galleryImages) {
    moreImages.append(buildProjectImage(galleryImage, "More images coming soon", "project-more-image"));
  }

  frag.append(eyebrow, title, image, description, bullets, moreImages);
  return frag;
}

// Single site-wide modal instance (one project open at a time), rather than
// per-card inline panels — keeps the page layout stable when a card is
// opened instead of pushing the rest of the content down.
let modalTrigger = null;

function getProjectModalEls() {
  return {
    modal: document.getElementById("project-modal"),
    backdrop: document.querySelector("#project-modal .project-modal-backdrop"),
    dialog: document.getElementById("project-modal-dialog"),
    content: document.getElementById("project-modal-content"),
    closeBtn: document.getElementById("project-modal-close"),
  };
}

function openProjectModal(role, project, triggerBtn) {
  const { modal, content, closeBtn } = getProjectModalEls();
  content.replaceChildren(buildProjectModalContent(role, project));

  modalTrigger = triggerBtn;
  triggerBtn.setAttribute("aria-expanded", "true");

  modal.hidden = false;
  document.body.classList.add("modal-open");
  document.addEventListener("keydown", onProjectModalKeydown);
  closeBtn.focus();
}

function closeProjectModal() {
  const { modal } = getProjectModalEls();
  if (modal.hidden) return;

  modal.hidden = true;
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", onProjectModalKeydown);

  if (modalTrigger) {
    modalTrigger.setAttribute("aria-expanded", "false");
    modalTrigger.focus();
    modalTrigger = null;
  }
}

function onProjectModalKeydown(event) {
  if (event.key === "Escape") {
    closeProjectModal();
    return;
  }
  if (event.key !== "Tab") return;

  // Basic focus trap: keep Tab cycling within the dialog while it's open.
  const { dialog } = getProjectModalEls();
  const focusable = dialog.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function initProjectModal() {
  const { backdrop, closeBtn } = getProjectModalEls();
  closeBtn.addEventListener("click", closeProjectModal);
  backdrop.addEventListener("click", closeProjectModal);
}

function renderProjects(cv) {
  const container = document.getElementById("role-groups");

  cv.roles.forEach((role) => {
    const group = document.createElement("div");
    group.className = "role-group";

    const header = document.createElement("div");
    header.className = "role-group-header";

    const heading = document.createElement("div");
    heading.className = "role-group-heading";

    const company = document.createElement("p");
    company.className = "role-company";
    company.textContent = role.company;

    heading.append(company);

    const rule = document.createElement("span");
    rule.className = "role-group-rule";
    rule.setAttribute("aria-hidden", "true");

    header.append(buildLogo(role), heading, rule);

    const grid = document.createElement("div");
    grid.className = "project-grid";

    role.projects.forEach((project) => {
      grid.append(buildProjectCard(role, project));
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
    initProjectModal();
  } catch (err) {
    console.error(err);
    document.getElementById("main").innerHTML =
      '<p role="alert">Sorry, something went wrong loading this page’s content. Please try again shortly, or reach out at <a href="mailto:anafa.anafa@gmail.com">anafa.anafa@gmail.com</a>.</p>';
  }
}

document.addEventListener("DOMContentLoaded", init);
