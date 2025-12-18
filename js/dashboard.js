let invChart = null;
let shipChart = null;

function renderDashboard(items, history) {
  let received = 0, shipped = 0, onHand = 0, value = 0;

  history.forEach(h => h.type === "IN" ? received += h.weight : shipped += h.weight);
  items.forEach(i => { onHand += i.weight; value += i.weight * i.price; });

  dashReceived.innerText = received + " kg";
  dashShipped.innerText = shipped + " kg";
  dashOnHand.innerText = onHand + " kg";
  dashTotalValue.innerText = "RM " + value.toFixed(2);

  invChart?.destroy();
  invChart = new Chart(inventoryStatusChart, {
    type: "bar",
    data: {
      labels: ["Received", "On Hand", "Shipped"],
      datasets: [{ data: [received, onHand, shipped], backgroundColor: ["#16a34a", "#2563eb", "#ea580c"] }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  shipChart?.destroy();
  shipChart = new Chart(shipmentStatusChart, {
    type: "doughnut",
    data: {
      labels: ["Shipped", "Remaining"],
      datasets: [{ data: [shipped, Math.max(received - shipped, 0)], backgroundColor: ["#16a34a", "#facc15"] }]
    }
  });
}
