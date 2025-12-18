let items = JSON.parse(localStorage.getItem("scrap_items")) || [];
let history = JSON.parse(localStorage.getItem("scrap_history")) || [];

/* DOM */
const stockForm = document.getElementById("stockForm");
const supplierType = document.getElementById("supplierType");
const company = document.getElementById("company");
const sku = document.getElementById("sku");
const category = document.getElementById("category");
const weight = document.getElementById("weight");
const price = document.getElementById("price");
const type = document.getElementById("type");
const tableBody = document.getElementById("tableBody");
const historyBody = document.getElementById("historyBody");
const inventoryCards = document.getElementById("inventoryCards");
const inventorySearch = document.getElementById("inventorySearch");
const historySearch = document.getElementById("historySearch");

/* SUPPLIER */
supplierType.addEventListener("change", () => {
  company.value = supplierType.value === "Walk-in" ? "Walk-in" : "";
  company.disabled = supplierType.value === "Walk-in";
});

/* RENDER HISTORY TABLE */
function renderHistory(filter = "") {
  const query = filter.trim().toLowerCase();
  historyBody.innerHTML = history
    .slice()
    .reverse()
    .filter(h =>
      h.sku.toLowerCase().includes(query) ||
      h.company.toLowerCase().includes(query)
    )
    .map((h, i) => {
      const idx = history.length - 1 - i;
      return `
        <tr>
          <td>${h.company}</td>
          <td>${h.sku}</td>
          <td class="${h.type === "IN" ? "in" : "out"}">${h.type}</td>
          <td>${h.weight}</td>
          <td>${h.price}</td>
          <td>RM ${h.total}</td>
          <td>${h.date}</td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteHistory(${idx})">Delete</button></td>
        </tr>
      `;
    }).join("");
}

/* SAVE */
function save(addAnother) {
  const d = {
    company: company.value || "Walk-in",
    sku: sku.value.trim(),
    category: category.value.trim(),
    weight: +weight.value,
    price: +price.value,
    type: type.value
  };

  if (!d.sku || !d.category || d.weight <= 0 || d.price <= 0) return alert("Invalid input");

  let item = items.find(i => i.sku === d.sku);
  if (!item) {
    item = { company: d.company, sku: d.sku, category: d.category, weight: 0, price: d.price };
    items.push(item);
  }

  if (d.type === "IN") item.weight += d.weight;
  else if (item.weight >= d.weight) item.weight -= d.weight;
  else return alert("Not enough stock");

  history.push({
    ...d,
    total: (d.weight * d.price).toFixed(2),
    date: new Date().toLocaleString()
  });

  localStorage.setItem("scrap_items", JSON.stringify(items));
  localStorage.setItem("scrap_history", JSON.stringify(history));

  renderInventoryCards();
  renderHistory();
  renderDashboard(items, history);

  stockForm.reset();
  company.disabled = false;
  if (!addAnother) sku.focus();
}

stockForm.addEventListener("submit", e => { e.preventDefault(); save(false); });

/* DELETE */
function deleteItem(i) {
  if (!confirm("Delete item?")) return;
  items.splice(i, 1);
  localStorage.setItem("scrap_items", JSON.stringify(items));
  renderInventoryCards();
  renderDashboard(items, history);
}

function deleteHistory(i) {
  if (prompt("Admin password") !== "0000") return;
  history.splice(i, 1);
  localStorage.setItem("scrap_history", JSON.stringify(history));
  renderHistory();
  renderDashboard(items, history);
}

/* RENDER INVENTORY AS CARDS WITH FILTER */
function renderInventoryCards(filter = "") {
  const query = filter.trim().toLowerCase();
  inventoryCards.innerHTML = items
    .filter(i =>
      i.sku.toLowerCase().includes(query) ||
      i.company.toLowerCase().includes(query) ||
      i.category.toLowerCase().includes(query)
    )
    .map((i, idx) => `
            <div class="col-md-3 col-sm-6">
                <div class="card h-100 shadow-sm">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${i.sku}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${i.company}</h6>
                        <p class="card-text mb-2">
                            Category: ${i.category}<br>
                            Weight: ${i.weight} kg<br>
                            Price: RM ${i.price}<br>
                            Total: RM ${(i.weight * i.price).toFixed(2)}
                        </p>
                        <button class="btn btn-sm btn-danger mt-auto" onclick="deleteItem(${idx})">Delete</button>
                    </div>
                </div>
            </div>
        `).join("");
}

/* SEARCH EVENT */
inventorySearch.addEventListener("input", () => renderInventoryCards(inventorySearch.value));
historySearch.addEventListener("input", () => renderHistory(historySearch.value));

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  renderInventoryCards();
  renderHistory();
  renderDashboard(items, history);
  sku.focus();
});
