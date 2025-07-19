// ========== State ==========
let users = JSON.parse(localStorage.getItem('users')) || {};
let files = JSON.parse(localStorage.getItem('files')) || {};
let logs = JSON.parse(localStorage.getItem('downloadLogs')) || [];


let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentAdmin = sessionStorage.getItem('adminLoggedIn') === 'true' || false;

// ========== Admin Credentials ==========
const adminCredentials = {
  username: "ADMIN",
  password: "72647"
};

function showHome() {
  // Hide all sections
  document.querySelectorAll('section').forEach(section => {
    section.style.display = 'none';
    section.classList.remove('fade-in');
  });

  // Show only the home section
  const homeSection = document.getElementById('home-section');
  if (homeSection) {
    homeSection.style.display = 'block';
    homeSection.classList.add('fade-in');
  }

  // Reset nav visibility
  const userProfile = document.getElementById('user-profile');
  const adminGreeting = document.getElementById('admin-greeting');
  const adminLink = document.getElementById('admin-link');
  const viewLogsLink = document.getElementById('view-logs-link');
  const navHome = document.getElementById('nav-home'); // Assuming you set id="nav-home" in HTML

  if (userProfile) userProfile.style.display = 'none';
  if (adminGreeting) adminGreeting.style.display = 'none';
  if (adminLink) adminLink.style.display = 'inline-block';
  if (viewLogsLink) viewLogsLink.style.display = 'none';
  if (navHome) navHome.style.display = 'none'; // Hide Home nav item on Home page
}



// ========== UI Helpers ==========
function showToast(msg, center = false, duration = 3000) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = msg;

  toast.classList.remove("center-toast", "show");
  if (center) toast.classList.add("center-toast");

  void toast.offsetWidth; // Trigger reflow
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show", "center-toast");
  }, duration);
}

function showSection(id) {
  document.querySelectorAll('section').forEach(s => {
    s.classList.remove('fade-in');
    s.style.display = 'none';
  });
  const section = document.getElementById(id);
  section.style.display = 'block';
  section.classList.add('fade-in');
}

// ========== Section Navigation ==========
function showLoginForm() { showSection('user-login-section');
  document.getElementById('nav-home').style.display = 'inline-block';

 }
function showSignUpForm() { showSection('create-account-section'); 
  
}
function showAdminLogin() { showSection('admin-login-section'); }
function showAbout() { showSection('about-section');
  document.getElementById('nav-home').style.display = 'inline-block';

 }
 function showPrivacy() { showSection('privacy-section');
  document.getElementById('nav-home').style.display = 'inline-block';

 }
function showSecureSafe() {
  if (currentUser) showSection('secure-safe-section');
  else showToast("Please log in first.");
  document.getElementById('nav-home').style.display = 'inline-block';

}

// ========== User ==========
function createAccount() {
  const id = String(Object.keys(users).length + 1).padStart(3, '0');
  const password = document.getElementById('create-password').value;
  const name = document.getElementById('create-name').value;
  const age = document.getElementById('create-age').value;

  if (!password || !name || !age) return showToast("Fill all fields!");

  users[id] = { password, name, age };
  localStorage.setItem('users', JSON.stringify(users));
  showToast(`Account created! Your User ID is ${id}`);
  document.getElementById('create-password').value = '';
  document.getElementById('create-name').value = '';
  document.getElementById('create-age').value = '';
  showLoginForm();
}

function userLogin() {
  const id = document.getElementById('login-id').value;
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('remember-me').checked;

  if (users[id] && users[id].password === password) {
    currentUser = { id, ...users[id] };
    if (remember) localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showUserDashboard();
    showToast("Login successful!");
    document.getElementById('admin-link').style.display = 'none';
   showToast("Welcome Back !!😃"); }
  else {
    showToast("Invalid credentials❌");
  }
}

function showUserDashboard() {
  document.getElementById('logged-in-user-name').textContent = currentUser.name;
  document.getElementById('logged-in-user-id').textContent = currentUser.id;
  document.getElementById('logged-in-user-age').textContent = currentUser.age;
  document.getElementById('user-profile').textContent = `👤 ${currentUser.name}`;
  document.getElementById('user-profile').style.display = 'inline-block';
  document.getElementById('admin-link').style.display = 'none';
  showSection('secure-safe-section');
}

function logoutUser(showExitToast = true) {
  localStorage.removeItem('currentUser');
  currentUser = null;

  if (showExitToast) {
    showToast(
      "Redirecting to home page. Thank you for choosing and trusting us. We'll always keep your data safe 🔐",
      true,
      2000
    );

    setTimeout(() => {
      showHome();
      location.reload();
    }, 2200);
  } else {
    showHome();
  }
}


function editUser() {
  const name = prompt("Enter new name:", currentUser.name);
  if (name === null) {
    showToast("Name change canceled.", "error");
    return;
  }

  const age = prompt("Enter new age:", currentUser.age8x);
  if (age === null) {
    showToast("Age change canceled.", "error");
    return;
  }
  if (name.trim() && age.trim()) {
    users[currentUser.id].name = name;
    users[currentUser.id].age = age;
    localStorage.setItem('users', JSON.stringify(users));
    currentUser.name = name;
    currentUser.age = age;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showUserDashboard();
    showToast("Profile updated.");
  } else {
    showToast("Both fields are required.", "error");
  }
}


function deleteUser() {
  if (confirm("Delete your account and all files?")) {
    delete users[currentUser.id];
    delete files[currentUser.id];
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('files', JSON.stringify(files));

    showToast(
      "Your account and all files have been permanently deleted. We hope to see you again ❤️",
      true,
      7000
    );

    setTimeout(() => {
      logoutUser(false);
    }, 7200);
  }
}



// ========== File Upload/Download ==========
function uploadFile() {
  const fileInput = document.getElementById('file-upload');
  const password = document.getElementById('file-password').value;

  if (!fileInput.files.length || password.length !== 4) {
    return showToast("Choose a file and enter 4-digit password.");
  }

  const file = fileInput.files[0];
  if (file.type.startsWith('video/')) {
    return showToast("Video files are not allowed.");
  }

  const reader = new FileReader();
  reader.onload = function () {
    const userId = currentUser.id;
    if (!files[userId]) files[userId] = [];

    files[userId].push({
      name: file.name,
      data: reader.result,
      password,
      uploadedAt: Date.now(),
      size: file.size
    });

    localStorage.setItem('files', JSON.stringify(files));
    fileInput.value = '';
    document.getElementById('file-password').value = '';
    showToast("✅ File uploaded successfully.");
  };
  reader.readAsDataURL(file);
}





function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function previewFiles() {
  const userFiles = files[currentUser.id] || [];
  const out = document.getElementById('file-status');

  if (userFiles.length === 0) {
    out.innerHTML = "<p>No files uploaded yet.</p>";
    return;
  }

  out.innerHTML = "<strong>Available Files:</strong><br>";

  userFiles.forEach((file, i) => {
    const icon = getFileIcon(file.name);
    const size = file.size ? formatFileSize(file.size) : "Unknown";
    const uploaded = file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : "Unknown";

    out.innerHTML += `
      <div class="file-entry">
        ${icon} <strong>${file.name}</strong><br>
        📁 Size: ${size} <br>
        🕓 Uploaded: ${uploaded} <br>
        <hr>
      </div>
    `;
  });
}


function getFileIcon(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return '📄';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return '🖼️';
  if (['zip', 'rar'].includes(ext)) return '📦';
  return '📁';
}

function downloadFile() {
  const userFiles = files[currentUser.id] || [];

  if (!userFiles.length) {
    return showToast("❌ No files available to download.");
  }

  const file = userFiles[0]; // ✅ Automatically selects the first file

  const inputPassword = prompt("Enter 4-digit file password:");
  if (inputPassword !== file.password) {
    return showToast("❌ Incorrect password.");
  }

  const blob = dataURLToBlob(file.data);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  const logs = JSON.parse(localStorage.getItem("downloadLogs")) || [];
  logs.push({
    userId: currentUser.id,
    fileName: file.name,
    timestamp: Date.now(),
    uploadedAt: file.uploadedAt || null
  });
  localStorage.setItem("downloadLogs", JSON.stringify(logs));

  // ✅ Remove file after download
  userFiles.splice(0, 1);
  files[currentUser.id] = userFiles;
  localStorage.setItem("files", JSON.stringify(files));

  showToast("✅ File downloaded and removed from the server.");
}

function dataURLToBlob(dataURL) {
  const parts = dataURL.split(',');
  const byteString = atob(parts[1]);
  const mimeString = parts[0].match(/:(.*?);/)[1];

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
}


// ========== Admin ==========
function adminLogin() {
  const username = document.getElementById("admin-username").value;
  const password = document.getElementById("admin-password").value;
  const remember = document.getElementById("admin-remember-me").checked;

  if (username === adminCredentials.username && password === adminCredentials.password) {
    currentAdmin = true;
    sessionStorage.setItem("adminLoggedIn", "true");
    if (remember) localStorage.setItem("adminRemembered", "true");

    showAdminDashboard();

    // Update Navbar UI
    document.getElementById('admin-link').style.display = 'none';
    document.getElementById('view-logs-link').style.display = 'inline-block';
    document.getElementById('admin-greeting').style.display = 'inline-block';
    document.getElementById('nav-home').style.display = 'inline-block';


    showToast("Welcome Admin 👑");
  } else {
    showToast("Invalid Admin Credentials ❌");
  }
}




function logoutAdmin() {
  currentAdmin = false;
  sessionStorage.removeItem("adminLoggedIn");
  localStorage.removeItem("adminRemembered");

  showToast("Thank You for Login 👑", true);
  setTimeout(() => {
    showHome();
    location.reload();
  }, 2000);
}

function showAdminDashboard() {
  showSection('admin-profile');
  document.getElementById('admin-output').innerHTML = '';
}

function searchUserById() {
  const id = document.getElementById('search-id').value.trim();
  const output = document.getElementById('search-result');

  // Validate input
  if (!id) {
    output.innerHTML = "<p style='color:red;'>⚠️ Please enter a User ID.</p>";
    return;
  }

  // Fetch user data from localStorage
  const usersData = localStorage.getItem('users');
  if (!usersData) {
    output.innerHTML = "<p style='color:red;'>❌ No user data found in storage.</p>";
    return;
  }

  let users;
  try {
    users = JSON.parse(usersData);
  } catch (err) {
    output.innerHTML = "<p style='color:red;'>❌ Failed to parse user data.</p>";
    return;
  }

  const user = users[id];

  // Display result
  if (user) {
    output.innerHTML = `
      <p><strong>👤 Name:</strong> ${user.name}</p>
      <p><strong>🎂 Age:</strong> ${user.age}</p>
      <p><strong>🆔 ID:</strong> ${id}</p>
    `;
  } else {
    output.innerHTML = "<p style='color:red;'>❌ User not found.</p>";
  }
}



function viewAllFiles() {
  const out = document.getElementById('admin-output');
  out.innerHTML = '<h3>All User Data</h3>';
  for (const [id, user] of Object.entries(users)) {
    out.innerHTML += `<p>ID: ${id} | Name: ${user.name} | Age: ${user.age} | Files: ${files[id]?.length || 0}</p>`;
  }
}

function viewDownloadLogs() {
  const out = document.getElementById('admin-output');
  const logs = JSON.parse(localStorage.getItem('downloadLogs')) || [];

  out.innerHTML = '<h3>📋 Download Logs</h3>';

  if (logs.length === 0) {
    out.innerHTML += '<p>❌ No download logs found.</p>';
    return;
  }

  logs.forEach(log => {
    const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const date = new Date(log.timestamp).toLocaleDateString();
    out.innerHTML += `
      <p>
        👤 User <strong>${log.userId}</strong><br>
        📁 File: <strong>${log.fileName || 'Unknown File'}</strong><br>
        🕒 Downloaded at: ${date} ${time}
      </p><hr>
    `;
  });
}
function filterLogs() {
  const logs = JSON.parse(localStorage.getItem('downloadLogs')) || [];
  const filterUserId = prompt("Enter User ID to filter logs by:")?.trim();
  const out = document.getElementById("admin-output");

  if (!filterUserId) {
    out.innerHTML = "<p>Please enter a valid User ID.</p>";
    return;
  }

  const filtered = logs.filter(log => log.userId === filterUserId);

  out.innerHTML = `<strong>📋 Download Logs for User ID: ${filterUserId}</strong><br><br>`;

  if (filtered.length === 0) {
    out.innerHTML += "<p>❌ No logs found for this user.</p>";
    return;
  }

  filtered.forEach((log, i) => {
    const downloadTime = new Date(log.timestamp).toLocaleString();
    const uploadTime = log.uploadedAt
      ? new Date(log.uploadedAt).toLocaleString()
      : "Unknown";

    out.innerHTML += `
      <p>
        ${i + 1}. 📁 <strong>${log.fileName || "Unknown File"}</strong><br>
        ⬆️ Uploaded: ${uploadTime}<br>
        ⬇️ Downloaded: ${downloadTime}
      </p><hr>`;
  });
}

function exportLogs() {
  const logs = JSON.parse(localStorage.getItem('downloadLogs')) || [];
  if (logs.length === 0) {
    showToast("No logs to export.");
    return;
  }

  const blob = new Blob([JSON.stringify(logs, null, 2)], {
    type: "application/json",
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "download_logs.json";
  a.click();
}


function resetAllData() {
  if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
    localStorage.clear();
    location.reload();
  }
}

function renderUserDashboard() {
  if (!currentUser) return;
  const dashboard = document.getElementById("user-dashboard");
  if (!dashboard) return;
  dashboard.innerHTML = `<h3>Welcome, ${currentUser.name}</h3>`;

  currentUser.files.forEach(file => {
    const item = document.createElement("div");
    item.innerHTML = `
      <p>${file.name}</p>
      <input type="password" placeholder="Enter file password" id="pass-${file.name}" />
      <button onclick="downloadFile('${currentUser.id}', '${file.name}', document.getElementById('pass-${file.name}').value)">Download</button>
      <button onclick="deleteFile('${file.name}')">Delete</button>
    `;
    dashboard.appendChild(item);
  });
}

function renderLogs(page = 1, perPage = 5) {
  const logs = JSON.parse(localStorage.getItem("downloadLogs")) || [];
  const logContainer = document.getElementById("log-container");
  if (!logContainer) return;
  logContainer.innerHTML = "";
  const start = (page - 1) * perPage;
  const current = logs.slice(start, start + perPage);
  current.forEach(log => {
    const item = document.createElement("div");
    item.textContent = `${log.time} - User ${log.userId} downloaded ${log.fileName}`;
    logContainer.appendChild(item);
  });

  const pagination = document.getElementById("log-pagination");
  if (pagination) {
    pagination.innerHTML = "";
    const totalPages = Math.ceil(logs.length / perPage);
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.onclick = () => renderLogs(i);
      pagination.appendChild(btn);
    }
  }
}

// ========== Init ==========
window.onload = () => {
  if (currentUser) {
    showUserDashboard();
    document.getElementById('admin-link').style.display = 'none';
  } else if (localStorage.getItem("adminRemembered") === "true" || sessionStorage.getItem("adminLoggedIn") === "true") {
    currentAdmin = true;
    showAdminDashboard();

    document.getElementById('user-link').style.display = 'none';
    document.getElementById('signup-link').style.display = 'none';
    document.getElementById('admin-link').style.display = 'none';

    document.getElementById('admin-profile').style.display = 'inline-block';
    document.getElementById('admin-profile').textContent = "👑 Admin";
  } else {
    showHome();
  }

  if (sessionStorage.getItem("showLogoutToast") === "true") {
    showToast("Thank you for choosing and trusting us. Your data is always safe here.", true);
    sessionStorage.removeItem("showLogoutToast");
  }
};
function b64toBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = Array.from(slice).map(char => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: mimeType });
}
