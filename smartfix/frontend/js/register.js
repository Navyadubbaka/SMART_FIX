const roleSelect = document.getElementById("role");
const skillsInput = document.getElementById("skills");

function toggleSkillsField() {
  skillsInput.style.display = roleSelect.value === "technician" ? "block" : "none";
}

roleSelect.addEventListener("change", toggleSkillsField);
toggleSkillsField();

document.getElementById("registerBtn").addEventListener("click", async () => {
  const msg = document.getElementById("msg");
  try {
    const role = roleSelect.value;
    const skillsValue = skillsInput.value.trim();
    const payload = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value.trim(),
      role,
      skills: role === "technician" && skillsValue
        ? skillsValue.split(",").map((s) => s.trim()).filter(Boolean)
        : []
    };
    const data = await apiFetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    msg.className = "success";
    msg.textContent = data.message;
    setTimeout(() => (window.location.href = "./login.html"), 1000);
  } catch (error) {
    msg.className = "error";
    msg.textContent = error.message;
  }
});
