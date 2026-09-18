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
const supportGrid = document.querySelector("#supportGrid");
const kaustPathway = document.querySelector("#kaustPathway");

let scholarships = [];
let supportResources = [];
let kaust = null;
const RESEARCH_DATE = new Date("2026-09-18T12:00:00+02:00");

function deadlineDate(item) {
  const text = String(item.deadline || "");
  const iso = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
  const matches = text.match(/\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b/g) || [];
  const time = text.match(/\b(\d{1,2}):(\d{2})\b/);
  const parseTextDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    if (time) date.setHours(Number(time[1]), Number(time[2]), 0, 0);
    else date.setHours(23, 59, 59, 999);
    return date;
  };
  const dates = [iso ? new Date(`${iso[0]}T23:59:59+02:00`) : null, ...matches.map(parseTextDate)]
    .filter((date) => date && !Number.isNaN(date.getTime()));
  return dates[0] || null;
}

function normalizedStatus(item) {
  const status = String(item.status || "").toLowerCase();
  if (status.includes("source conflict")) return "source_conflict";
  if (status.includes("monitor") || status.includes("watch")) return "monitor";
  if (status.includes("opening soon")) return "opening_soon";
  if (status.includes("open now") || status.includes("open")) return "open";
  return "closed";
}

function isCurrentlyOpen(item) {
  if (normalizedStatus(item) !== "open") return false;
  const deadline = deadlineDate(item);
  return !deadline || deadline >= RESEARCH_DATE;
}

function effectiveStatus(item) {
  const status = normalizedStatus(item);
  if (status === "closed") return "closed";
  if (status === "source_conflict") return "conflict";
  if (status === "monitor") return "monitor";
  if (status === "opening_soon") return "prepare";
  if (isCurrentlyOpen(item)) return "open";
  return "expired";
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
      <p class="source-note"><strong>Research verified:</strong> ${item.lastVerified || "18 September 2026"}</p>
    </article>
  `;
}

function supportCard(item) {
  return `
    <article class="support-card">
      <div class="badge-row"><span class="badge conditional">${item.status}</span><span class="badge">${item.type}</span></div>
      <h3>${item.name}</h3>
      <p>${item.coverage}</p>
      <p><strong>Fee position:</strong> ${item.feePosition}</p>
      <p><strong>Next action:</strong> ${item.action}</p>
      <a class="button" href="${item.url}" target="_blank" rel="noreferrer">Open official source</a>
    </article>
  `;
}

function renderKaustPathway() {
  if (!kaustPathway || !kaust) return;
  kaustPathway.innerHTML = `
    <div class="pathway-status"><span class="badge open">${kaust.status}</span><span class="badge">${kaust.route}</span></div>
    <p class="pathway-lede">${kaust.fit}</p>
    <div class="pathway-grid">
      <div>
        <h3>Choose one programme</h3>
        ${list(kaust.programmeDecision)}
      </div>
      <div>
        <h3>Know the MS structure</h3>
        ${list(kaust.degreeStructure)}
      </div>
      <div>
        <h3>Finish the application</h3>
        ${list(kaust.nextSteps)}
      </div>
      <div>
        <h3>Document pack</h3>
        ${list(kaust.documents)}
      </div>
      <div>
        <h3>Evidence to foreground</h3>
        ${list(kaust.evidence)}
      </div>
      <div>
        <h3>Funding and fees</h3>
        ${list(kaust.funding)}
        ${list(kaust.fees)}
      </div>
      <div>
        <h3>After submission</h3>
        <p>${kaust.afterSubmission}</p>
        <h4>Admissions stages</h4>
        ${list(kaust.admissionStages)}
        <h4>Current timeline</h4>
        ${list(kaust.timeline)}
      </div>
    </div>
    <details>
      <summary>English requirement</summary>
      <p>${kaust.language}</p>
    </details>
    <div class="prompt-box">
      <strong>Reusable KAUST planning prompt</strong>
      <p>${kaust.prompt}</p>
      <button class="button copy-prompt" type="button" data-prompt="${encodeURIComponent(kaust.prompt)}">Copy prompt</button>
    </div>
    <div class="card-actions">
      <a class="button primary" href="https://apply.kaust.edu.sa/apply/?redirect=1" target="_blank" rel="noreferrer">Continue application</a>
      <a class="button" href="https://admissions.kaust.edu.sa/fees-funding" target="_blank" rel="noreferrer">Fees & funding</a>
      <a class="button" href="https://admissions.kaust.edu.sa/info-and-contact/faqs" target="_blank" rel="noreferrer">KAUST FAQs</a>
      <a class="button" href="https://admissions.kaust.edu.sa/how-to-apply/entry-requirements" target="_blank" rel="noreferrer">Entry requirements</a>
    </div>
    <div class="pathway-links">
      ${kaust.officialLinks.map((link) => `<a href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`).join("")}
    </div>
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

function renderSupportResources() {
  supportGrid.innerHTML = supportResources.map(supportCard).join("");
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
  const [scholarshipResponse, supportResponse] = await Promise.all([
    fetch("data/scholarships.json"),
    fetch("data/support-resources.json")
  ]);
  scholarships = await scholarshipResponse.json();
  supportResources = await supportResponse.json();
  kaust = await (await fetch("data/kaust-pathway.json")).json();
  renderStats();
  renderCards();
  renderChecklist();
  renderSources();
  renderSupportResources();
  renderKaustPathway();
}

init();
