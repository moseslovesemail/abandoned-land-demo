const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const sites = [
  {
    id: "AL-001",
    name: "Motueka Foothills Pilot",
    council: "Tasman District",
    region: "Tasman",
    status: "Needs verification",
    type: "Vacant / underutilised",
    hectares: 8.4,
    elevation: 186,
    access: "Unsealed road",
    opportunityScore: 88,
    lat: -41.1425,
    lng: 172.9799,
    note: "Synthetic demo parcel — elevated site profile for testing."
  },
  {
    id: "AL-002",
    name: "Murchison Terrace",
    council: "Tasman District",
    region: "Tasman",
    status: "Public-source lead",
    type: "Rural vacant land",
    hectares: 14.7,
    elevation: 242,
    access: "Road frontage",
    opportunityScore: 83,
    lat: -41.8002,
    lng: 172.3287,
    note: "Synthetic demo parcel — not a real listing."
  },
  {
    id: "AL-003",
    name: "Buller Ridge Candidate",
    council: "Buller District",
    region: "West Coast",
    status: "Needs verification",
    type: "Underutilised",
    hectares: 22.1,
    elevation: 312,
    access: "Track / access check",
    opportunityScore: 79,
    lat: -41.75,
    lng: 171.6,
    note: "Synthetic demo parcel — demonstrates elevation-first filtering."
  },
  {
    id: "AL-004",
    name: "Grey Valley Candidate",
    council: "Grey District",
    region: "West Coast",
    status: "Public-source lead",
    type: "Rural vacant land",
    hectares: 6.9,
    elevation: 168,
    access: "Road nearby",
    opportunityScore: 74,
    lat: -42.39,
    lng: 171.35,
    note: "Synthetic demo parcel — not a statement about ownership."
  },
  {
    id: "AL-005",
    name: "Mackenzie High-Country Pilot",
    council: "Mackenzie District",
    region: "Canterbury",
    status: "Needs verification",
    type: "Underutilised",
    hectares: 31.5,
    elevation: 515,
    access: "Road frontage",
    opportunityScore: 91,
    lat: -44.1,
    lng: 170.16,
    note: "Synthetic demo parcel — high-elevation scenario."
  }
];

const leads = [
  {
    id: 1,
    submittedAt: new Date().toISOString(),
    council: "Tasman District",
    location: "Motueka / inland foothills",
    source: "Demo seed",
    contact: "demo@example.org",
    notes: "Example council/public lead for the prototype."
  }
];

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "abandoned-land-demo" });
});

app.get("/api/sites", (req, res) => {
  const { council, minElevation, q } = req.query;
  let result = sites.slice();

  if (council && council !== "All") {
    result = result.filter((s) => s.council === council);
  }
  if (minElevation) {
    result = result.filter((s) => s.elevation >= Number(minElevation));
  }
  if (q) {
    const needle = String(q).toLowerCase();
    result = result.filter((s) =>
      [s.name, s.council, s.region, s.status, s.type, s.note]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }

  res.json(result);
});

app.get("/api/leads", (req, res) => {
  res.json(leads.slice().reverse());
});

app.post("/api/leads", (req, res) => {
  const { council, location, source, contact, notes } = req.body || {};
  if (!council || !location) {
    return res.status(400).json({ error: "Council and location are required." });
  }

  const lead = {
    id: leads.length + 1,
    submittedAt: new Date().toISOString(),
    council,
    location,
    source: source || "Manual submission",
    contact: contact || "",
    notes: notes || ""
  };

  leads.push(lead);
  res.status(201).json(lead);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Abandoned Land demo listening on port ${PORT}`);
});
