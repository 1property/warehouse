<script>
function deleteItem(index) {
  if (confirm("Delete this item?")) {
    items.splice(index, 1);
    localStorage.setItem("warehouse", JSON.stringify(items));
    renderTable();
  }
}

function editItem(index) {
  const item = items[index];
  document.getElementById("name").value = item.name;
  document.getElementById("sku").value = item.sku;
  document.getElementById("category").value = item.category;
  document.getElementById("qty").value = 0;
}
</script>
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 10px;
}

.feature {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px 10px;
  text-align: center;
  background: #f9fafb;
  transition: 0.2s ease;
}

.feature:hover {
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  transform: translateY(-3px);
}

.feature .icon {
  font-size: 34px;
  margin-bottom: 10px;
}

.feature p {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
}

