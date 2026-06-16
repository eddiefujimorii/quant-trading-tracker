let DATA = null;
const TIER_ORDER = ["S", "A", "B", "C", "D", "F"];

async function load() {
  const res = await fetch("data.json", { cache: "no-store" });
  DATA = await res.json();
  document.getElementById("lastChecked").textContent = DATA.lastChecked
    ? "Last checked: " + new Date(DATA.lastChecked).toLocaleString()
    : "Last checked: never yet — initial listing only";
  render();
}

function searchUrlFor(firm) {
  const q = encodeURIComponent(firm.name + " quant trader new grad 2027 careers");
  return "https://www.google.com/search?q=" + q;
}

function statusBadge(status) {
  if (status === "open") return '<span class="badge badge-open">Open Role Found</span>';
  if (status === "closed") return '<span class="badge badge-closed">No Role Currently</span>';
  return '<span class="badge badge-unknown">Unconfirmed</span>';
}

function render() {
  const search = document.getElementById("search").value.toLowerCase();
  const tier = document.getElementById("tierFilter").value;
  const status = document.getElementById("statusFilter").value;
  const body = document.getElementById("firmTableBody");
  body.innerHTML = "";

  DATA.firms
    .filter(f => f.name.toLowerCase().includes(search))
    .filter(f => !tier || f.tier === tier)
    .filter(f => !status || f.status === status)
    .sort((a, b) => {
      const tierDiff = TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);
      if (tierDiff !== 0) return tierDiff;
      const typeDiff = (a.type || "").localeCompare(b.type || "");
      if (typeDiff !== 0) return typeDiff;
      return a.name.localeCompare(b.name);
    })
    .forEach(f => {
      const tr = document.createElement("tr");
      const url = f.careersUrl || searchUrlFor(f);
      tr.innerHTML = `
        <td>${f.name}</td>
        <td>${f.type || "—"}</td>
        <td>${f.allLocations || f.city}</td>
        <td>${f.city}</td>
        <td class="tier">${f.tier}</td>
        <td>${statusBadge(f.status)}</td>
        <td><a class="careers-link" href="${url}" target="_blank" rel="noopener">${f.careersUrl ? "Careers Page" : "Search"} ↗</a></td>
      `;
      body.appendChild(tr);
    });
}

document.getElementById("search").addEventListener("input", render);
document.getElementById("tierFilter").addEventListener("change", render);
document.getElementById("statusFilter").addEventListener("change", render);

load();
setInterval(load, 5 * 60 * 1000);
