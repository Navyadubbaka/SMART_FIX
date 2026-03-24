requireAuth(["user"]);

async function loadComplaints() {
  const container = document.getElementById("complaints");
  try {
    const complaints = await apiFetch("/complaints/user");
    if (!complaints.length) {
      container.innerHTML = `<div class="card"><p class="muted">No complaints found. Submit your first complaint.</p></div>`;
      return;
    }
    container.innerHTML = complaints
      .map(
        (c) => `
      <div class="card">
        <h3>${c.complaintId}</h3>
        <p>${c.description}</p>
        <p>Category: ${c.category} (${Math.round(c.confidenceScore * 100)}%)</p>
        <p>Status: ${statusBadge(c.status)}</p>
      </div>
    `
      )
      .join("");
  } catch (error) {
    container.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

loadComplaints();
setInterval(loadComplaints, 10000);
