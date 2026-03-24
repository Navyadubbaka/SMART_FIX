requireAuth(["admin"]);

let categoryChart;
let techChart;
let technicians = [];

async function loadAdminDashboard() {
  const complaintsBox = document.getElementById("adminComplaints");
  try {
    const [analytics, complaints, technicianList] = await Promise.all([
      apiFetch("/complaints/analytics/summary"),
      apiFetch("/complaints/all"),
      apiFetch("/technicians")
    ]);
    technicians = technicianList;

    document.getElementById("totalComplaints").textContent = analytics.totalComplaints;
    document.getElementById("avgHours").textContent = analytics.avgResolutionHours;

    const categories = analytics.byCategory.map((c) => c._id);
    const categoryCount = analytics.byCategory.map((c) => c.count);
    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(document.getElementById("categoryChart"), {
      type: "pie",
      data: { labels: categories, datasets: [{ data: categoryCount }] }
    });

    if (techChart) techChart.destroy();
    techChart = new Chart(document.getElementById("techChart"), {
      type: "bar",
      data: {
        labels: analytics.techPerformance.map((t) => t.name),
        datasets: [{ label: "Completed", data: analytics.techPerformance.map((t) => t.completed) }]
      }
    });

    complaintsBox.innerHTML = complaints
      .map(
        (c) => `
      <div class="card">
        <h3>${c.complaintId}</h3>
        <p>User: ${c.user?.name || "N/A"}</p>
        <p>Technician: ${c.assignedTechnician?.name || "Unassigned"}</p>
        <p>Category: ${c.category || "N/A"}</p>
        <p>${statusBadge(c.status)}</p>
        <select id="tech-${c._id}">
          <option value="">Auto Select Best Technician</option>
          ${technicians
            .map(
              (t) =>
                `<option value="${t._id}">${t.name} (${t.email}) - ${t.availabilityStatus} - Skills: ${(t.skills || []).join(", ") || "None"}</option>`
            )
            .join("")}
        </select>
        <button onclick="manualAssign('${c._id}')">Manual Override Assign</button>
      </div>
    `
      )
      .join("");
    if (!complaints.length) {
      complaintsBox.innerHTML = `<p class="muted">No complaints in system yet.</p>`;
    }
  } catch (error) {
    complaintsBox.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

async function manualAssign(complaintId) {
  try {
    const selectedTech = document.getElementById(`tech-${complaintId}`)?.value || "";
    await apiFetch("/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId, technicianId: selectedTech || undefined })
    });
    loadAdminDashboard();
  } catch (error) {
    alert(error.message);
  }
}

loadAdminDashboard();
