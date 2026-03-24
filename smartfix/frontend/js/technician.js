requireAuth(["technician"]);

async function loadTasks() {
  const tasksBox = document.getElementById("tasks");
  const perf = document.getElementById("perf");
  try {
    const [tasks, performance] = await Promise.all([
      apiFetch("/technicians/tasks"),
      apiFetch("/technicians/performance")
    ]);
    perf.textContent = `Resolved: ${performance.resolved}, Active: ${performance.active}`;

    if (!tasks.length) {
      tasksBox.innerHTML = `<div class="card"><p class="muted">No tasks assigned currently.</p></div>`;
      return;
    }

    tasksBox.innerHTML = tasks
      .map(
        (t) => `
      <div class="card">
        <h3>${t.complaintId}</h3>
        <p>${t.description}</p>
        <p>${statusBadge(t.status)}</p>
        <select id="status-${t._id}">
          <option ${t.status === "Assigned" ? "selected" : ""}>Assigned</option>
          <option ${t.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option ${t.status === "Resolved" ? "selected" : ""}>Resolved</option>
        </select>
        <textarea id="note-${t._id}" placeholder="Resolution notes"></textarea>
        <button onclick="updateStatus('${t._id}')">Update</button>
      </div>
    `
      )
      .join("");
  } catch (error) {
    tasksBox.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

async function updateStatus(id) {
  const status = document.getElementById(`status-${id}`).value;
  const resolutionNotes = document.getElementById(`note-${id}`).value;
  await apiFetch("/complaints/status", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ complaintId: id, status, resolutionNotes })
  });
  loadTasks();
}

document.getElementById("availabilityBtn").addEventListener("click", async () => {
  const status = document.getElementById("availability").value;
  await apiFetch("/technicians/status", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  loadTasks();
});

loadTasks();
