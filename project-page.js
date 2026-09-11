/* ============================================================
   TMB STUDIO — project-page.js
   Renders whichever project matches ?slug= into project.html.
   ============================================================ */
(async function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const heroBg = document.getElementById("heroBg");
  const projTitle = document.getElementById("projTitle");
  const projTagline = document.getElementById("projTagline");
  const projStatus = document.getElementById("projStatus");
  const coverImg = document.getElementById("coverImg");
  const aboutTitle = document.getElementById("aboutTitle");
  const aboutTagline = document.getElementById("aboutTagline");
  const descriptionParas = document.getElementById("descriptionParas");
  const supportingSection = document.getElementById("supportingSection");
  const supportingGallery = document.getElementById("supportingGallery");
  const scopeSection = document.getElementById("scopeSection");
  const scopeBody = document.getElementById("scopeBody");
  const toolsSection = document.getElementById("toolsSection");
  const toolsList = document.getElementById("toolsList");

  if (!slug) {
    projTitle.textContent = "Project not found";
    projTagline.textContent = "No project was specified.";
    return;
  }

  const project = await window.TMB_DATA.fetchProjectBySlug(slug);

  if (!project) {
    projTitle.textContent = "Project not found";
    projTagline.textContent = "We couldn't load this project. It may be unpublished or the link may be out of date.";
    document.title = "Project not found — TMB Studio";
    return;
  }

  document.title = `${project.title} — TMB Studio`;

  if (project.hero_background) heroBg.style.backgroundImage = `url("${project.hero_background}")`;
  projTitle.textContent = project.title || "";
  projTagline.textContent = project.tagline || "";
  projStatus.textContent = window.TMB_DATA.statusLabel(project);
  projStatus.className = "proj-hero-status " + window.TMB_DATA.statusClass(project);

  if (project.cover_image) coverImg.src = project.cover_image;
  coverImg.alt = project.title || "";
  aboutTitle.textContent = project.title || "";
  aboutTagline.textContent = project.tagline || "";

  (project.description || []).forEach((p) => {
    const el = document.createElement("p");
    el.className = "proj-description";
    el.textContent = p;
    descriptionParas.appendChild(el);
  });

  const supportingImages = project.supporting_images || [];
  if (supportingImages.length) {
    supportingSection.style.display = "";
    supportingImages.forEach((img) => {
      const item = document.createElement("div");
      item.className = "gallery-item";
      const imgEl = document.createElement("img");
      imgEl.src = img.url;
      imgEl.alt = img.caption || project.title || "";
      item.appendChild(imgEl);
      supportingGallery.appendChild(item);
    });
  }

  const scope = project.scope || [];
  if (scope.length) {
    scopeSection.style.display = "";
    scope.forEach((row) => {
      const tr = document.createElement("tr");
      const td1 = document.createElement("td");
      td1.textContent = row.label || "";
      const td2 = document.createElement("td");
      td2.textContent = row.value || "";
      tr.appendChild(td1);
      tr.appendChild(td2);
      scopeBody.appendChild(tr);
    });
  }

  const tools = project.tools || [];
  if (tools.length) {
    toolsSection.style.display = "";
    tools.forEach((tool) => {
      const span = document.createElement("span");
      span.className = "proj-software-tag";
      span.textContent = tool;
      toolsList.appendChild(span);
    });
  }

  // Nav dropdown — all published projects
  const allProjects = await window.TMB_DATA.fetchProjects();
  window.TMB_DATA.populateNavDropdowns(allProjects);

  // Elements added after the initial scroll-reveal observer ran won't be
  // picked up by it, so just show them immediately.
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
})();
