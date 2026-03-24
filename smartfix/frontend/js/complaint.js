requireAuth(["user", "admin"]);

const imageInput = document.getElementById("image");
const preview = document.getElementById("preview");
const loading = document.getElementById("loading");
const msg = document.getElementById("msg");

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
});

document.getElementById("submitBtn").addEventListener("click", async () => {
  try {
    loading.style.display = "block";
    msg.textContent = "";
    const formData = new FormData();
    formData.append("description", document.getElementById("description").value.trim());
    formData.append("locationLabel", document.getElementById("locationLabel").value.trim());
    formData.append("image", imageInput.files[0]);

    const token = getToken();
    const response = await fetch("http://localhost:5000/api/complaints", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to submit");
    msg.className = "success";
    msg.textContent = `${data.message}. ID: ${data.complaint.complaintId}`;
  } catch (error) {
    msg.className = "error";
    msg.textContent = error.message;
  } finally {
    loading.style.display = "none";
  }
});
