let allSites = [];
let map;
let markers = [];

const $ = (id) => document.getElementById(id);

async function loadSites() {
  const params = new URLSearchParams();
  const q = $("search").value.trim();
  const council = $("council").value;
  const minElevation = $("minElevation").value;
  if (q) params.set("q", q);
  if (council && council !== "All") params.set("council", council);
  if (minElevation) params.set("minElevation", minElevation);

  const res = await fetch("/api/sites?" + params.toString());
  const sites = await res.json();
  renderCards(sites);
  renderMarkers(sites);
}

function renderCards(sites) {
  $("cards").innerHTML = sites.length
    ? sites.map(site => `
      <article class="card">
        <div>
          <h3>${escapeHtml(site.name)}</h3>
          <p>${escapeHtml(site.council)} · ${escapeHtml(site.region)}</p>
          <div class="meta">
            <span class="chip">${site.hectares} ha</span>
            <span class="chip">${site.elevation}m elevation</span>
            <span class="chip">${escapeHtml(site.access)}</span>
            <span class="chip">${escapeHtml(site.status)}</span>
          </div>
          <p style="margin-top:10px">${escapeHtml(site.note)}</p>
        </div>
        <div class="score" title="Prototype opportunity score">
          <div>${site.opportunityScore}<small>/100</small></div>
        </div>
      </article>
    `).join("")
    : `<div style="padding:28px;color:#9aac9f">No demo parcels match those filters.</div>`;
}

function renderMarkers(sites) {
  if (!map) return;
  markers.forEach(m => map.removeLayer(m));
  markers = sites.map(site => {
    const m = L.marker([site.lat, site.lng])
      .addTo(map)
      .bindPopup(`
        <strong>${escapeHtml(site.name)}</strong><br>
        ${escapeHtml(site.council)}<br>
        ${site.hectares} ha · ${site.elevation}m<br>
        Score: ${site.opportunityScore}/100
      `);
    return m;
  });
  if (sites.length) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.25), { maxZoom: 8 });
  }
}

async function init() {
  map = L.map("map", { zoomControl: true }).setView([-42.2, 172.3], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const res = await fetch("/api/sites");
  allSites = await res.json();

  const councils = [...new Set(allSites.map(s => s.council))].sort();
  councils.forEach(c => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    $("council").appendChild(option);
  });

  $("statSites").textContent = allSites.length;
  $("statCouncils").textContent = councils.length;
  $("statHigh").textContent = allSites.filter(s => s.elevation >= 200).length;
  $("statAvg").textContent = Math.round(allSites.reduce((a, s) => a + s.opportunityScore, 0) / allSites.length);

  renderCards(allSites);
  renderMarkers(allSites);
  await loadLeads();
}

async function loadLeads() {
  const res = await fetch("/api/leads");
  const leads = await res.json();
  $("leadTable").innerHTML = `
    <table>
      <thead><tr><th>Submitted</th><th>Council</th><th>Location</th><th>Source</th><th>Contact</th></tr></thead>
      <tbody>
        ${leads.map(l => `
          <tr>
            <td>${new Date(l.submittedAt).toLocaleString()}</td>
            <td>${escapeHtml(l.council)}</td>
            <td>${escapeHtml(l.location)}</td>
            <td>${escapeHtml(l.source)}</td>
            <td>${escapeHtml(l.contact || "—")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

["search", "council", "minElevation"].forEach(id => {
  $(id).addEventListener(id === "search" ? "input" : "change", loadSites);
});

$("resetFilters").addEventListener("click", () => {
  $("search").value = "";
  $("council").value = "All";
  $("minElevation").value = "";
  loadSites();
});

const dialog = $("leadDialog");
$("openLead").addEventListener("click", () => dialog.showModal());
$("closeLead").addEventListener("click", () => dialog.close());
$("refreshLeads").addEventListener("click", loadLeads);

$("leadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("formMsg").textContent = "Saving...";
  const data = Object.fromEntries(new FormData(e.currentTarget).entries());
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const body = await res.json();
  if (!res.ok) {
    $("formMsg").textContent = body.error || "Could not save lead.";
    return;
  }
  $("formMsg").textContent = "Lead added to the live demo queue.";
  e.currentTarget.reset();
  await loadLeads();
  setTimeout(() => {
    $("formMsg").textContent = "";
    dialog.close();
  }, 900);
});

init().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML("afterbegin",
    `<div style="padding:12px;background:#5b1f1f;color:white">Demo error: ${escapeHtml(err.message)}</div>`);
});
