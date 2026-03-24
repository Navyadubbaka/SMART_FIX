document.getElementById("loginBtn").addEventListener("click", async () => {
  const msg = document.getElementById("msg");
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const data = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.user.role === "admin") window.location.href = "./admin.html";
    else if (data.user.role === "technician") window.location.href = "./technician.html";
    else window.location.href = "./dashboard.html";
  } catch (error) {
    msg.className = "error";
    msg.textContent = error.message;
  }
});
