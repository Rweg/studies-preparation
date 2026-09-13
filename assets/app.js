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
  "Medium of Instruction letter from bachelor's university",
  "English test results, if available",
  "IELTS/TOEFL/PTE/Duolingo plan for programmes that do not waive testing",
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

function deadlineDate(item) {
  const matches = item.deadline.match(/\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b/g) || [];
  const dates = matches.map((value) => new Date(value)).filter((date) => !Number.isNaN(date.getTime()));
  return dates[0] || null;
}

function isCurrentlyOpen(item) {
  if (!item.status.includes("Open")) return false;
  const deadline = deadlineDate(item);
  return !deadline || deadline >= new Date();
}

function effectiveStatus(item) {
  if (item.status.includes("Closed")) return "closed";
  if (item.status === "Source conflict") return "conflict";
  if (item.status === "Monitor") return "monitor";
  if (isCurrentlyOpen(item)) return "open";
  if (item.status.includes("Opening")) return "prepare";
  if (item.status.includes("Open")) return "expired";
  return "closed";
}

function statusClass(status) {
  if (status.includes("Critical")) return "critical";
  if (status.includes("Urgent")) return "urgent";
  if (status.includes("Conditional")) return "conditional";
  if (status.includes("Open")) return "open";
  if (status.includes("Opening")) return "prepare";
  if (status.includes("Source conflict")) return "conflict";
  if (status.includes("Monitor")) return "monitor";
  return "closed";
}

function statusLabel(item) {
  const status = effectiveStatus(item);
  if (status === "open") return "Open now";
  if (status === "expired") return "Deadline passed";
  if (status === "prepare") return "Opening soon";
  return item.status;
}

function priorityClass(priority) {
  if (priority.includes("Apply") || priority.includes("Check")) return "open";
  if (priority.includes("Prepare")) return "prepare";
  if (priority.includes("Monitor")) return "monitor";
  return "closed";
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function fieldRows(rows) {
  return `
    <div class="detail-table">
      ${rows.map(([label, value]) => `
        <div>
          <strong>${label}</strong>
          <span>${value || "unspecified"}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function preparationPack(item) {
  const text = `${item.name} ${item.fields}`.toLowerCase();
  const researchHeavy = /research|mathematical|phd|r&d|science|engineering/.test(text);
  const leadershipHeavy = /chevening|commonwealth|knight|weidenfeld|yenching|ireland|leadership|development/.test(text);
  const technical = /ai|data|computer|technology|engineering|energy|cloud|it|mathematical|analytics/.test(text);
  const focus = researchHeavy
    ? "research readiness, academic preparation, and a clear problem you want to investigate"
    : leadershipHeavy
      ? "leadership, influence, service, and a realistic post-study impact plan"
      : "academic fit, professional evidence, and a practical career plan";
  const evidence = technical
    ? "Connect your electronics, engineering, flight operations, simulation-data, Python, SQL, computer-vision, and systems experience only where it is true for the selected programme."
    : "Select two or three specific examples from your work, community, or academic history and explain the result rather than listing responsibilities.";
  return {
    focus,
    steps: [
      `Confirm the exact eligibility rules and deadline for ${item.name}.`,
      "Build the document set: CV, degree certificate, transcript with grading scale, passport, references, and the programme-specific statement.",
      `Prepare evidence for ${focus}.`,
      evidence,
      "Record the language test accepted, minimum score, waiver rule, application fee, and whether any funding is confirmed or only conditional."
    ],
    prompt: `Prepare my application for ${item.name}. Use only my verified education, work, project, leadership, and community evidence. First list the programme's exact requirements, then map my evidence to each requirement, identify gaps, and create a document and deadline checklist. Do not invent achievements, scores, funding, test waivers, or deadlines.`
  };
}

function card(item) {
  const language = item.languageProficiency || {
    summary: item.english || "unspecified",
    tests: "unspecified",
    minimums: "unspecified",
    waiver: "unspecified",
    notes: "unspecified"
  };
  const fees = item.fees || {
    scholarshipApplication: "unspecified",
    degreeApplication: "unspecified",
    feeWaiver: "unspecified",
    notes: "unspecified"
  };
  const prep = preparationPack(item);
  const currentStatus = effectiveStatus(item);
  return `
    <article class="scholarship-card" data-status="${currentStatus}" data-fit="${item.fit}">
      <div class="card-top">
        <div>
          <h3>${item.name}</h3>
          <p>${item.sponsor}</p>
        </div>
      </div>
      <div class="badge-row">
        <span class="badge ${currentStatus}">${statusLabel(item)}</span>
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
        <summary>Language Proficiency</summary>
        ${fieldRows([
          ["Summary", language.summary],
          ["Tests", language.tests],
          ["Minimums", language.minimums],
          ["Waiver", language.waiver],
          ["Prepare", language.prepare],
          ["Notes", language.notes]
        ])}
      </details>
      <details>
        <summary>Application Fees & Waivers</summary>
        ${fieldRows([
          ["Scholarship application", fees.scholarshipApplication],
          ["Degree application", fees.degreeApplication],
          ["Fee waiver", fees.feeWaiver],
          ["Notes", fees.notes]
        ])}
      </details>
      <details>
        <summary>Preparation Pack</summary>
        <p><strong>Focus:</strong> ${prep.focus}</p>
        ${list(prep.steps)}
        <div class="prompt-box">
          <strong>Reusable planning prompt</strong>
          <p>${prep.prompt}</p>
          <button class="button copy-prompt" type="button" data-prompt="${encodeURIComponent(prep.prompt)}">Copy prompt</button>
        </div>
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
    const statusOk = status === "all" || effectiveStatus(item) === status;
    const fitOk = fit === "all" || item.fit === fit;
    return haystack.includes(search) && statusOk && fitOk;
  });

  grid.innerHTML = filtered.map(card).join("");
}

function renderStats() {
  openCount.textContent = scholarships.filter(isCurrentlyOpen).length;
  highFitCount.textContent = scholarships.filter((item) => item.fit === "High").length;
  deadlineCount.textContent = scholarships.filter((item) => {
    const date = deadlineDate(item);
    return isCurrentlyOpen(item) && date && (date - new Date()) / 86400000 <= 14;
  }).length;
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
  if (event.target === statusFilter || event.target === fitFilter) {
    renderCards();
    return;
  }
  const id = event.target.dataset.check;
  if (id === undefined) return;
  const saved = JSON.parse(localStorage.getItem("studiesChecklist") || "{}");
  saved[id] = event.target.checked;
  localStorage.setItem("studiesChecklist", JSON.stringify(saved));
});

document.addEventListener("click", async (event) => {
  const button = event.target.closest(".copy-prompt");
  if (!button) return;
  const prompt = decodeURIComponent(button.dataset.prompt);
  await navigator.clipboard.writeText(prompt);
  const original = button.textContent;
  button.textContent = "Copied";
  setTimeout(() => { button.textContent = original; }, 1400);
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
