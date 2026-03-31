const API = "http://localhost:3000/api";

const currentUser = JSON.parse(sessionStorage.getItem("user"));
const currentPage = window.location.pathname;

if (!currentUser &&
  !currentPage.includes("login.html") && !currentPage.includes("index.html") &&
  !currentPage.includes("register.html")) {
  window.location.href = "login.html";
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
  window.location.href = "login.html";
}

async function loadTechnicians() {
  try {
    const res = await fetch(API + "/technicians");
    const data = await res.json();

    let html = "";

    data.forEach(t => {
      const skillDisplay = t.skills || t.category || "N/A";
      const availDisplay = t.availability || t.status || "Unknown";
      const availClass   = availDisplay === "Available" ? "avail-yes" : "avail-no";

      html += `
        <div class="card">
          <strong>${t.name}</strong><br>
          <span style="font-size:12px;color:#888;">Skills:</span>
          <span style="font-size:13px;color:#4e73df;font-weight:600;">${skillDisplay}</span><br>
          Phone: ${t.phone || "N/A"}<br>
          Address: ${t.address || "N/A"}<br>
          ${t.experience ? `Experience: ${t.experience}<br>` : ""}
          Status: <strong class="${availClass}">${availDisplay}</strong>
        </div>
      `;
    });

    const techList = document.getElementById("techList");
    if (techList) techList.innerHTML = html || "<p>No technicians found.</p>";

  } catch (error) {
    console.error("Error loading technicians:", error);
  }
}

async function loadTechnicianCount() {
  try {
    const res  = await fetch(API + "/technicians/count");
    const data = await res.json();
    const el   = document.getElementById("totalTechnicians");
    if (el) el.textContent = data.total;
  } catch (err) {
    console.error("Error loading tech count:", err);
  }
}

async function loadComplaints() {
  if (!currentUser) return;

  try {

    // Build query params based on role
    let complaintsUrl = API + `/complaints?role=${currentUser.role}&user_id=${currentUser.id}`;
    if (currentUser.role === "technician" && currentUser.technician_id) {
      complaintsUrl += `&technician_id=${currentUser.technician_id}`;
    }

    const res = await fetch(complaintsUrl
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
            <strong>User Address:</strong> ${c.user_address || "N/A"} <br>

            ${c.user_phone
            ? `<button class="call-btn" onclick="openCallModal('${(c.user_name || 'User').replace(/'/g, "\\'")}', '${c.user_phone}', 'User')">📞 Call User</button><br>`
            : `<strong>User Phone:</strong> N/A <br>`
          }

          ` : ""}

          <strong>Issue:</strong> ${c.issue || "Image Only"} <br>

          <strong>AI Category:</strong> ${c.category || "Detecting..."} <br>

          <strong>Technician:</strong> ${c.technician_name || "Not Assigned"} <br>
          <strong>Technician Address:</strong> ${c.technician_address || "N/A"} <br>

          ${currentUser.role !== "technician" ? `

            ${c.technician_phone
            ? `<button class="call-btn" onclick="openCallModal('${(c.technician_name || 'Technician').replace(/'/g, "\\'")}', '${c.technician_phone}', 'Technician')">📞 Call Technician</button><br>`
            : `<strong>Technician Phone:</strong> N/A <br>`
          }

          ` : ""}

          <div class="status ${statusClass}">${c.status}</div>

          ${c.image
          ? `<img src="http://localhost:3000/uploads/${c.image}" 
                      width="100%" 
                      style="margin-top:10px;border-radius:6px;">`
          : ""
        }

          ${currentUser.role === "technician" && c.status === "Pending"
          ? `<button class="btn-resolve" onclick="resolveComplaint(${c.id})">
                   Mark Resolved
                 </button>`
          : ""
        }

          ${currentUser.role === "admin" && c.status === "Resolved"
          ? `<button class="btn-delete" onclick="deleteComplaint(${c.id})">
                   🗑 Delete
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

async function deleteComplaint(id) {

  const confirmDelete = confirm("Delete this resolved complaint?");

  if (!confirmDelete) return;

  try {

    await fetch(API + "/complaints/" + id, {
      method: "DELETE"
    });

    loadComplaints();

  } catch (error) {

    console.error("Error deleting complaint:", error);

  }
}

if (currentPage.includes("admin")) {
  loadTechnicians();
  loadTechnicianCount();
  loadComplaints();
}

if (currentPage.includes("user")) {
  loadComplaints();
}

if (currentPage.includes("technician")) {
  loadComplaints();
}

// ===== CALL MODAL FUNCTIONS =====

function openCallModal(name, phone, role) {
  const overlay = document.getElementById("callModalOverlay");
  if (!overlay) return;

  const initial = name.charAt(0).toUpperCase();

  document.getElementById("callModalAvatar").textContent = initial;
  document.getElementById("callModalName").textContent = name;
  document.getElementById("callModalRole").textContent = role;
  document.getElementById("callModalPhone").textContent = phone;
  document.getElementById("callModalCallBtn").href = "tel:" + phone;

  // Reset copy button
  const copyBtn = document.getElementById("callModalCopyBtn");
  copyBtn.classList.remove("copied");
  copyBtn.innerHTML = "📋 Copy Number";

  overlay.classList.add("active");
}

function closeCallModal() {
  const overlay = document.getElementById("callModalOverlay");
  if (overlay) overlay.classList.remove("active");
}

function copyPhoneNumber() {
  const phone = document.getElementById("callModalPhone").textContent;
  navigator.clipboard.writeText(phone).then(() => {
    const btn = document.getElementById("callModalCopyBtn");
    btn.classList.add("copied");
    btn.innerHTML = "✅ Copied!";
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = "📋 Copy Number";
    }, 2000);
  });
}

// Close modal when clicking the backdrop
document.addEventListener("click", function (e) {
  if (e.target && e.target.id === "callModalOverlay") {
    closeCallModal();
  }
});