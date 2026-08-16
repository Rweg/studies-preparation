const checklistItems = [
  "Passport or national ID scan",
  "Bachelor's degree certificate",
  "Full university transcripts",
  "Updated professional CV",
  "Employment letters confirming work history",
  "Two to three referees",
  "Career goals statement",
  "Leadership and impact examples",
  "Evidence that prior degree was taught in English",
  "English test results, if available",
  "Professional certifications",
  "Academic grading-scale explanation"
];

const grid = document.querySelector("#scholarshipGrid");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const fitFilter = document.querySelector("#fitFilter");
const checklist = document.querySelector("#checklist");
const sourceList = document.querySelector("#sourceList");
const openCount = document.querySelector("#openCount");
const highFitCount = document.querySelector("#highFitCount");
const deadlineCount = document.querySelector("#deadlineCount");

let scholarships = [];

function statusClass(status) {
  if (status.includes("Open")) return "open";
  if (status.includes("Opening")) return "prepare";
  return "closed";
}

function priorityClass(priority) {
  if (priority.includes("Apply") || priority.includes("Check")) return "open";
  if (priority.includes("Prepare")) return "prepare";
  return "closed";
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function card(item) {
  return `
    <article class="scholarship-card" data-status="${statusClass(item.status)}" data-fit="${item.fit}">
      <div class="card-top">
        <div>
          <h3>${item.name}</h3>
          <p>${item.sponsor}</p>
        </div>
      </div>
      <div class="badge-row">
        <span class="badge ${statusClass(item.status)}">${item.status}</span>
        <span class="badge ${priorityClass(item.priority)}">${item.priority}</span>
        <span class="badge">Fit: ${item.fit}</span>
      </div>
      <div class="meta">
        <div><strong>Country</strong><span>${item.country}</span></div>
        <div><strong>Degree</strong><span>${item.degree}</span></div>
        <div><strong>Fields</strong><span>${item.fields}</span></div>
        <div><strong>Deadline</strong><span>${item.deadline}</span></div>
      </div>
      <div class="card-actions">
        <a class="button primary" href="${item.portal}" target="_blank" rel="noreferrer">Application Portal</a>
        <a class="button" href="${item.official}" target="_blank" rel="noreferrer">Official Source</a>
      </div>
      <details>
        <summary>Prerequisites</summary>
        ${list(item.prerequisites)}
      </details>
      <details>
        <summary>Funding Coverage</summary>
        ${list(item.funding)}
      </details>
      <details>
        <summary>Documents</summary>
        ${list(item.documents)}
      </details>
      <details>
        <summary>Age and English Notes</summary>
        <p><strong>Age:</strong> ${item.age}</p>
        <p><strong>English:</strong> ${item.english}</p>
      </details>
      <p class="source-note">${item.sourceNote}</p>
    </article>
  `;
}

function renderCards() {
  const search = searchInput.value.toLowerCase().trim();
  const status = statusFilter.value;
  const fit = fitFilter.value;

  const filtered = scholarships.filter((item) => {
    const haystack = `${item.name} ${item.sponsor} ${item.country} ${item.fields} ${item.status} ${item.priority}`.toLowerCase();
    const statusOk = status === "all" || statusClass(item.status) === status;
    const fitOk = fit === "all" || item.fit === fit;
    return haystack.includes(search) && statusOk && fitOk;
  });

  grid.innerHTML = filtered.map(card).join("");
}

function renderStats() {
  openCount.textContent = scholarships.filter((item) => statusClass(item.status) === "open").length;
  highFitCount.textContent = scholarships.filter((item) => item.fit === "High").length;
  deadlineCount.textContent = scholarships.filter((item) => item.priority.includes("Apply") || item.priority.includes("Check")).length;
}

function renderChecklist() {
  const saved = JSON.parse(localStorage.getItem("studiesChecklist") || "{}");
  checklist.innerHTML = checklistItems.map((item, index) => `
    <label class="check-item">
      <input type="checkbox" data-check="${index}" ${saved[index] ? "checked" : ""}>
      <span>${item}</span>
    </label>
  `).join("");
}

function renderSources() {
  sourceList.innerHTML = scholarships.map((item) => `
    <a href="${item.official}" target="_blank" rel="noreferrer">
      <strong>${item.name}</strong>
      <p>${item.sourceNote}</p>
    </a>
  `).join("");
}

document.addEventListener("input", (event) => {
  if (event.target === searchInput || event.target === statusFilter || event.target === fitFilter) {
    renderCards();
  }
});

document.addEventListener("change", (event) => {
  const id = event.target.dataset.check;
  if (id === undefined) return;
  const saved = JSON.parse(localStorage.getItem("studiesChecklist") || "{}");
  saved[id] = event.target.checked;
  localStorage.setItem("studiesChecklist", JSON.stringify(saved));
});

async function init() {
  const response = await fetch("data/scholarships.json");
  scholarships = await response.json();
  renderStats();
  renderCards();
  renderChecklist();
  renderSources();
}

init();
