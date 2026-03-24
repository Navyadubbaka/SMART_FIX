requireAuth(["user"]);

async function loadNotifications() {
  const box = document.getElementById("notifications");
  try {
    const notifications = await apiFetch("/notifications/my");
    if (!notifications.length) {
      box.innerHTML = `<p class="muted">No notifications yet.</p>`;
      return;
    }
    box.innerHTML = notifications
      .map((n) => `<div class="card"><strong>${n.title}</strong><p>${n.message}</p></div>`)
      .join("");
  } catch (error) {
    box.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

loadNotifications();
