const API = "http://localhost:3000/api";

const currentUser = JSON.parse(sessionStorage.getItem("user"));
const currentPage = window.location.pathname;

if (!currentUser &&
    !currentPage.includes("index.html") &&
    !currentPage.includes("register.html")) {
  window.location.href = "index.html";
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
      const res = await fetch(API + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.role) {
        sessionStorage.setItem("user", JSON.stringify(data));

        message.style.color = "green";
        message.textContent = "Login Successful... Redirecting";

        setTimeout(() => {
          if (data.role === "admin") {
            window.location.href = "admin.html";
          } else if (data.role === "technician") {
            window.location.href = "technician.html";
          } else {
            window.location.href = "user.html";
          }
        }, 1500);

      } else {
        message.style.color = "red";
        message.textContent = "Invalid Email or Password";
      }

    } catch (error) {
      message.style.color = "red";
      message.textContent = "Server Error. Try again.";
      console.error(error);
    }
  });
}

function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

async function loadTechnicians() {
  try {
    const res = await fetch(API + "/technicians");
    const data = await res.json();

    let html = "";

    data.forEach(t => {
      html += `
        <div class="card">
          <strong>${t.name}</strong><br>
          Category: ${t.category}<br>
          Phone: ${t.phone || "N/A"}<br>
          Status: <strong>${t.status}</strong>
        </div>
      `;
    });

    const techList = document.getElementById("techList");
    if (techList) techList.innerHTML = html;

  } catch (error) {
    console.error("Error loading technicians:", error);
  }
}

async function loadComplaints() {
  if (!currentUser) return;

  try {

    const res = await fetch(
      API + `/complaints?role=${currentUser.role}&user_id=${currentUser.id}`
    );
    const data = await res.json();

    const complaintList = document.getElementById("complaintList");
    if (!complaintList) return;

    let html = "";
    let total = 0;
    let pending = 0;
    let resolved = 0;

    data.forEach(c => {

      total++;
      if (c.status === "Pending") pending++;
      if (c.status === "Resolved") resolved++;

      const statusClass =
        c.status === "Pending" ? "status-pending" : "status-resolved";

      html += `
        <div class="card">

          ${currentUser.role === "technician" ? `
            <strong>User:</strong> ${c.user_name || "Unknown"} <br>

            ${
              c.user_phone
              ? `<a href="tel:${c.user_phone}" class="call-btn">📞 Call User</a><br>`
              : `<strong>User Phone:</strong> N/A <br>`
            }

          ` : ""}

          <strong>Issue:</strong> ${c.issue || "Image Only"} <br>

          <strong>AI Category:</strong> ${c.category || "Detecting..."} <br>

          <strong>Technician:</strong> ${c.technician_name || "Not Assigned"} <br>

          ${currentUser.role !== "technician" ? `

            ${
              c.technician_phone
              ? `<a href="tel:${c.technician_phone}" class="call-btn">📞 Call Technician</a><br>`
              : `<strong>Technician Phone:</strong> N/A <br>`
            }

          ` : ""}

          <div class="status ${statusClass}">${c.status}</div>

          ${
            c.image
              ? `<img src="http://localhost:3000/uploads/${c.image}" 
                      width="100%" 
                      style="margin-top:10px;border-radius:6px;">`
              : ""
          }

          ${
            currentUser.role === "technician" && c.status === "Pending"
              ? `<button class="btn-resolve" onclick="resolveComplaint(${c.id})">
                   Mark Resolved
                 </button>`
              : ""
          }

        </div>
      `;
    });

    complaintList.innerHTML = html || "<p>No complaints found.</p>";

    if (currentUser.role === "admin") {

      const totalEl = document.getElementById("totalComplaints");
      const pendingEl = document.getElementById("pendingComplaints");
      const resolvedEl = document.getElementById("resolvedComplaints");

      if (totalEl) totalEl.textContent = total;
      if (pendingEl) pendingEl.textContent = pending;
      if (resolvedEl) resolvedEl.textContent = resolved;
    }

  } catch (error) {

    console.error("Error loading complaints:", error);

    const complaintList = document.getElementById("complaintList");
    if (complaintList) {
      complaintList.innerHTML =
        "<p style='color:red;'>Error loading complaints.</p>";
    }
  }
}

const complaintForm = document.getElementById("complaintForm");

if (complaintForm) {
  complaintForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const formData = new FormData();
    formData.append("user_id", currentUser.id);
    formData.append("issue", document.getElementById("issue").value);

    const imageFile = document.getElementById("image").files[0];

    if (!imageFile) {
      alert("Please upload an image.");
      return;
    }

    formData.append("image", imageFile);

    try {

      await fetch(API + "/complaints", {
        method: "POST",
        body: formData
      });

      alert("Complaint Submitted. AI is assigning technician...");
      complaintForm.reset();
      loadComplaints();

    } catch (error) {

      alert("Error submitting complaint");
      console.error(error);

    }

  });
}

async function resolveComplaint(id) {
  try {

    await fetch(API + "/complaints/resolve/" + id, {
      method: "PUT"
    });

    loadComplaints();

  } catch (error) {

    console.error("Error resolving complaint:", error);

  }
}

if (currentPage.includes("admin")) {
  loadTechnicians();
  loadComplaints();
}

if (currentPage.includes("user")) {
  loadComplaints();
}

if (currentPage.includes("technician")) {
  loadComplaints();
}