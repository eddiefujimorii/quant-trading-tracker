let RANKINGS = null;
const TIER_ORDER = ["S", "A", "B", "C", "D", "F"];

async function load() {
  const res = await fetch("rankings.json", { cache: "no-store" });
  RANKINGS = await res.json();
  render();
}

function groupByType(firms) {
  const groups = {};
  firms.forEach(f => {
    if (!groups[f.type]) groups[f.type] = [];
    groups[f.type].push(f);
  });
  return Object.keys(groups)
    .sort()
    .map(type => ({ type, firms: groups[type].sort((a, b) => a.name.localeCompare(b.name)) }));
}

function render() {
  const search = document.getElementById("search").value.toLowerCase();
  const container = document.getElementById("tierGroups");
  container.innerHTML = "";

  TIER_ORDER.forEach(tier => {
    const firms = (RANKINGS[tier] || []).filter(f => f.name.toLowerCase().includes(search));
    if (firms.length === 0) return;

    const section = document.createElement("section");
    section.style.marginBottom = "32px";

    const heading = document.createElement("h2");
    heading.className = "tier";
    heading.style.fontSize = "20px";
    heading.style.marginBottom = "12px";
    heading.textContent = `Tier ${tier} (${firms.length})`;
    section.appendChild(heading);

    groupByType(firms).forEach(group => {
      const subheading = document.createElement("h3");
      subheading.style.fontSize = "13px";
      subheading.style.color = "var(--muted)";
      subheading.style.textTransform = "uppercase";
      subheading.style.letterSpacing = ".05em";
      subheading.style.margin = "14px 0 6px";
      subheading.textContent = `${group.type} (${group.firms.length})`;
      section.appendChild(subheading);

      const table = document.createElement("table");
      const tbody = document.createElement("tbody");
      group.firms.forEach(f => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${f.name}</td><td>${f.location}</td>`;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      section.appendChild(table);
    });

    container.appendChild(section);
  });
}

document.getElementById("search").addEventListener("input", render);
load();
