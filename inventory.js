/***********************
 * TM ENVICO PILOT INVENTORY SYSTEM
 * inventory.js (FINAL – CLIENT + EDIT + DELETE + EXPORT)
 ***********************/

let role = "staff";
const ADMIN_PASSWORD = "12345";

/* ================= STORAGE ================= */
let inventory = JSON.parse(localStorage.getItem("tm_inventory")) || [];
let history   = JSON.parse(localStorage.getItem("tm_history")) || [];
let clients   = JSON.parse(localStorage.getItem("tm_clients")) || [];

/* ================= NORMALIZE INVENTORY ================= */
inventory = inventory.map(i => ({
  sku: i.sku,
  name: i.name,
  category: i.category,
  price: Number(i.price) || 0,
  stock: Number(i.stock) || 0
}));

/* ================= DOM ================= */
const roleSwitch = document.getElementById("roleSwitch");
const skuInput = document.getElementById("sku");
const itemNameInput = document.getElementById("itemName");
const categoryInput = document.getElementById("category");
const weightInput = document.getElementById("weight");
const typeInput = document.getElementById("type");

const supplierTypeInput = document.getElementById("supplierType");
const companyCodeInput = document.getElementById("companyCode");
const personNameInput = document.getElementById("personName");
const phoneInput = document.getElementById("phone");

const inventoryDiv = document.getElementById("inventoryCards");
const historyBody = document.getElementById("historyBody");
const clientBody = document.getElementById("clientBody");

/* ================= ROLE SWITCH ================= */
roleSwitch.addEventListener("change", () => {
  if (roleSwitch.value === "admin") {
    const pass = prompt("Enter Admin Password");
    if (pass !== ADMIN_PASSWORD) {
      alert("Wrong password");
      roleSwitch.value = "staff";
      role = "staff";
    } else {
      role = "admin";
    }
  } else {
    role = "staff";
  }
  applyRoleUI();
  renderAll();
});

/* ================= APPLY ROLE UI ================= */
function applyRoleUI() {
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = role === "admin" ? "" : "none";
  });
}

/* ================= CLIENT AUTOFILL ================= */
function autofillClient() {
  const code = companyCodeInput.value.trim();
  if (!code || supplierTypeInput.value !== "company") return;

  const client = clients.find(c => c.code === code && c.type === "company");
  if (client) {
    personNameInput.value = client.person;
    phoneInput.value = client.phone;
    personNameInput.readOnly = true;
    phoneInput.readOnly = true;
  }
}

supplierTypeInput.addEventListener("change", () => {
  if (supplierTypeInput.value === "walkin") {
    companyCodeInput.style.display = "none";
    personNameInput.readOnly = false;
    phoneInput.readOnly = false;
  } else {
    companyCodeInput.style.display = "";
  }
});

companyCodeInput.addEventListener("input", autofillClient);

/* ================= SKU LOOKUP ================= */
skuInput.addEventListener("input", () => {
  const item = inventory.find(i => i.sku === skuInput.value.trim());
  if (item) {
    itemNameInput.value = item.name;
    categoryInput.value = item.category;
  } else {
    itemNameInput.value = "";
    categoryInput.value = "";
  }
});

/* ================= STOCK ENTRY ================= */
document.getElementById("stockForm").addEventListener("submit", e => {
  e.preventDefault();

  const sku = skuInput.value.trim();
  const item = inventory.find(i => i.sku === sku);
  if (!item) return alert("Item not found");

  const weight = Number(weightInput.value);
  const type = typeInput.value;

  if (type === "IN") item.stock += weight;
  else {
    if (item.stock < weight) return alert("Not enough stock");
    item.stock -= weight;
  }

  const clientDisplay =
    supplierTypeInput.value === "company"
      ? clients.find(c => c.code === companyCodeInput.value.trim())?.name || "Unknown Company"
      : personNameInput.value || "Walk-in";

  history.push({
    sku,
    category: item.category,
    client: clientDisplay,
    type,
    weight,
    price: item.price,
    total: item.price * weight,
    datetime: new Date().toLocaleString()
  });

  localStorage.setItem("tm_inventory", JSON.stringify(inventory));
  localStorage.setItem("tm_history", JSON.stringify(history));

  e.target.reset();
  renderAll();
});

/* ================= EDIT HISTORY (ADMIN) ================= */
function editHistory(index) {
  if (role !== "admin") return;

  const h = history[index];
  const item = inventory.find(i => i.sku === h.sku);
  if (!item) return;

  const newQty = Number(prompt("Enter new quantity:", h.weight));
  if (!newQty || newQty <= 0) return;

  if (h.type === "IN") item.stock -= h.weight;
  else item.stock += h.weight;

  if (h.type === "IN") item.stock += newQty;
  else item.stock -= newQty;

  h.weight = newQty;
  h.total = h.price * newQty;
  h.datetime = new Date().toLocaleString();

  localStorage.setItem("tm_inventory", JSON.stringify(inventory));
  localStorage.setItem("tm_history", JSON.stringify(history));
  renderAll();
}

/* ================= DELETE HISTORY (ADMIN) ================= */
function deleteHistory(index) {
  if (role !== "admin") return;
  if (!confirm("Delete this record?")) return;

  const h = history[index];
  const item = inventory.find(i => i.sku === h.sku);

  if (item) {
    if (h.type === "IN") item.stock -= h.weight;
    else item.stock += h.weight;
  }

  history.splice(index, 1);
  localStorage.setItem("tm_inventory", JSON.stringify(inventory));
  localStorage.setItem("tm_history", JSON.stringify(history));
  renderAll();
}

/* ================= NEW ITEM ================= */
document.getElementById("itemForm")?.addEventListener("submit", e => {
  e.preventDefault();
  if (role !== "admin") return;

  inventory.push({
    sku: newSku.value.trim(),
    name: newItemName.value.trim(),
    category: newCategory.value,
    price: Number(newPrice.value),
    stock: 0
  });

  localStorage.setItem("tm_inventory", JSON.stringify(inventory));
  e.target.reset();
  renderAll();
});

/* ================= NEW CLIENT ================= */
document.getElementById("clientForm")?.addEventListener("submit", e => {
  e.preventDefault();
  if (role !== "admin") return;

  clients.push({
    type: clientType.value,
    code: clientCode.value.trim(),
    name: clientName.value.trim(),
    address: clientAddress.value.trim(),
    person: clientPerson.value.trim(),
    phone: clientPhone.value.trim(),
    createdAt: new Date().toLocaleString()
  });

  localStorage.setItem("tm_clients", JSON.stringify(clients));
  e.target.reset();
  renderClients();
});

/* ================= RENDER CLIENTS ================= */
function renderClients() {
  if (!clientBody) return;
  clientBody.innerHTML = "";
  clients.forEach(c => {
    clientBody.innerHTML += `
      <tr>
        <td>${c.type}</td>
        <td>${c.code || "-"}</td>
        <td>${c.name}</td>
        <td>${c.person}</td>
        <td>${c.phone}</td>
        <td>${c.createdAt}</td>
      </tr>`;
  });
}

/* ================= EXPORT HELPERS ================= */
function downloadCSV(filename, rows) {
  const csv = rows.map(r =>
    r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

/* ================= EXPORT FUNCTIONS (ADMIN ONLY) ================= */
function exportInventory() {
  if (role !== "admin") return alert("Admin only");

  const rows = [["SKU", "Item", "Category", "Stock", "Price"]];
  inventory.forEach(i =>
    rows.push([i.sku, i.name, i.category, i.stock, i.price])
  );
  downloadCSV("inventory.csv", rows);
}

function exportHistory() {
  if (role !== "admin") return alert("Admin only");

  const rows = [["SKU", "Item", "Category", "Client", "Type", "Qty", "Price", "Total", "Date"]];
  history.forEach(h =>
    rows.push([
      h.sku,
      inventory.find(i => i.sku === h.sku)?.name || "",
      h.category,
      h.client,
      h.type,
      h.weight,
      h.price,
      h.total,
      h.datetime
    ])
  );
  downloadCSV("stock_history.csv", rows);
}

function exportClients() {
  if (role !== "admin") return alert("Admin only");

  const rows = [["Type", "Code", "Name", "Person", "Phone", "Created"]];
  clients.forEach(c =>
    rows.push([c.type, c.code, c.name, c.person, c.phone, c.createdAt])
  );
  downloadCSV("clients.csv", rows);
}

/* ================= RENDER ALL ================= */
function renderAll() {
  inventoryDiv.innerHTML = "";
  historyBody.innerHTML = "";

  inventory.forEach(i => {
    inventoryDiv.innerHTML += `
      <div class="col-md-3">
        <div class="border p-3 bg-white">
          <b>${i.sku}</b><br>
          ${i.name}<br>${i.category}<br>
          Stock: ${i.stock} kg
          ${role === "admin" ? `<br>RM ${i.price}` : ""}
        </div>
      </div>`;
  });

  history.forEach((h, idx) => {
    historyBody.innerHTML += `
      <tr>
        <td>${h.sku}</td>
        <td>${inventory.find(i => i.sku === h.sku)?.name || "-"}</td>
        <td>${h.category}</td>
        <td>${h.client}</td>
        <td>${h.type}</td>
        <td>${h.weight}</td>
        <td>${h.datetime}</td>
        ${
          role === "admin"
            ? `<td>RM ${h.price}</td>
               <td>RM ${h.total}</td>
               <td>
                 <button class="btn btn-sm btn-warning" onclick="editHistory(${idx})">Edit</button>
                 <button class="btn btn-sm btn-danger" onclick="deleteHistory(${idx})">Delete</button>
               </td>`
            : ""
        }
      </tr>`;
  });

  renderClients();
}

/* ================= INIT ================= */
applyRoleUI();
renderAll();
