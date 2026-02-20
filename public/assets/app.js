// ========================================
// AUTHENTICATION & INITIALIZATION
// ========================================

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("../api/auth/login.php", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({email,password})
  });

  const data = await response.json();

  if(data.success){
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("role", data.data.user.role);
    localStorage.setItem("name", data.data.user.name);
    localStorage.setItem("userId", data.data.user.id);

    window.location = "dashboard.html";
  } else {
    alert(data.message);
  }
}

// LOAD DRIVES
async function loadDrives() {

  const res = await fetch("../api/common/drives.php");
  const data = await res.json();

  const container = document.getElementById("drives");
  container.innerHTML = "";

  data.data.forEach(drive => {
    container.innerHTML += `
      <div class="card">
        <h4>${drive.title}</h4>
        <p class="secondary">${drive.companyName}</p>
        <p>Min CGPA: ${drive.minCgpa}</p>
        <button onclick="applyDrive(${drive.id})">Apply</button>
      </div>
    `;
  });
}

// APPLY DRIVE
async function applyDrive(id){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/applyDrive.php",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer "+token
    },
    body:JSON.stringify({driveId:id})
  });

  const data = await res.json();
  alert(data.message);
}

// LOGOUT
function logout(){
  localStorage.clear();
  window.location="index.html";
}
function initDashboard() {

  const role = localStorage.getItem("role");
  const menu = document.getElementById("menu");

  loadUserInfo();

  if(role === "STUDENT"){
    menu.innerHTML = `
      <div onclick="showStudentDrives()">Drives</div>
      <div onclick="showJobs()">Job Posts</div>
      <div onclick="showApplications()">My Applications</div>
      <div onclick="showProfile()">Profile</div>
      <div onclick="showChangePassword()">Change Password</div>
    `;

    showDrives();
  }

  if(role === "TPO"){
    menu.innerHTML = `
      <div onclick="showCreateDrive()">Create Drive</div>
  <div onclick="showManageDrives()">Manage Drives</div>
  <div onclick="showTpoApplications()">Applications</div>
  <div onclick="showStats()">Analytics</div>
  <div onclick="showChangePassword()">Change Password</div>
    `;

    showTpoApplications();   // 🔥 default screen for TPO
  }

  if(role === "ALUMNI"){
    menu.innerHTML = `
      <div onclick="showJobs()">My Job Posts</div>
      <div onclick="showMentor()">Mentor Slots</div>
      <div onclick="showChangePassword()">Change Password</div>
    `;

    showJobs();
  }
}
async function loadUserInfo(){

  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/profile.php",{
    headers:{ "Authorization":"Bearer "+token }
  });

  const data = await res.json();

  if(!data.success) return;

  const profile = data.data;
  const role = localStorage.getItem("role");

  const name = profile.name;   // ← GET REAL NAME FROM DB

  document.getElementById("userInfo").innerHTML = `
    ${profile.profileImage ? 
      `<img src="../${profile.profileImage}">` :
      `<img src="https://ui-avatars.com/api/?name=${name}&background=FDBA74&color=1A1C1E">`
    }
    <div>
      <div style="font-weight:bold">${name}</div>
      <div class="secondary">${role}</div>
    </div>
  `;
}
async function showManageDrives(){

  const res = await fetch("../api/common/drives.php");
  const data = await res.json();

  let html = "<h2>Manage Drives</h2>";

  data.data.forEach(drive=>{

    html += `
      <div class="card">

        ${drive.image 
          ? `<img src="http://localhost/placementpro/${drive.image}" 
                 style="width:100%;height:150px;object-fit:cover;border-radius:10px;margin-bottom:10px;">`
          : `<img src="https://via.placeholder.com/600x150?text=No+Image" 
                 style="width:100%;height:150px;object-fit:cover;border-radius:10px;margin-bottom:10px;">`
        }

        <h4>${drive.title}</h4>
        <p class="secondary">${drive.companyName}</p>
        <p>Min CGPA: ${drive.minCgpa}</p>
        <p>Status: ${drive.status}</p>

        <button onclick="editDrive(${drive.id}, '${drive.title}', '${drive.description}', ${drive.minCgpa}, ${drive.maxBacklogs}, '${drive.status}')">
          Edit
        </button>

        <button onclick="deleteDrive(${drive.id})" style="background:#dc2626">
          Delete
        </button>

      </div>
    `;
  });

  document.getElementById("content").innerHTML = html;
}

async function showJobs(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/getJobPosts.php",{
    headers:{ "Authorization":"Bearer "+token }
  });

  const data = await res.json();

  let html = "<h2>Job Posts</h2>";

  data.data.forEach(job=>{
    html += `
      <div class="card">
        <h4>${job.title}</h4>
        <p class="secondary">${job.companyName}</p>
        <p>${job.description}</p>
        <p>Email: ${job.alumniEmail}</p>
      </div>
    `;
  });

  document.getElementById("content").innerHTML = html;
}

async function showProfile(){

  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/profile.php",{
    headers:{ "Authorization":"Bearer "+token }
  });

  const data = await res.json();

  if(!data.success){
    document.getElementById("content").innerHTML =
      "<h2>Profile not found</h2>";
    return;
  }

  const profile = data.data;

  document.getElementById("content").innerHTML = `
    <h2>My Profile</h2>

    <div class="card">

      ${profile.profileImage ? 
        `<img src="../${profile.profileImage}" 
              style="width:100px;height:100px;border-radius:50%;margin-bottom:10px;">`
        : ""
      }

      <form id="profileForm">

        <label>Email</label>
        <input name="email" value="${profile.email}" required>

        <label>Phone</label>
        <input name="phone" value="${profile.phone || ''}" required>

        <label>CGPA</label>
        <input name="cgpa" value="${profile.cgpa}" required>

        <label>Backlogs</label>
        <input name="backlogCount" value="${profile.backlogCount}" required>

        <label>Profile Image</label>
        <input type="file" name="profileImage">

        <button type="submit">Update Profile</button>
      </form>
    </div>
  `;

  document.getElementById("profileForm").onsubmit = updateProfile;
}

function showStats(){
  document.getElementById("content").innerHTML =
    "<h2>Analytics (Coming Next)</h2>";
}

function showMentor(){
  document.getElementById("content").innerHTML =
    "<h2>Mentor Slots (Coming Next)</h2>";
}
async function updateProfile(event) {
  event.preventDefault();

  const token = localStorage.getItem("token");

  const form = document.getElementById("profileForm");
  const formData = new FormData(form);

  const res = await fetch("../api/student/profile.php", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    },
    body: formData
  });

  const data = await res.json();
  alert(data.message);

  if(data.success){
    loadUserInfo();
  }
}


function showChangePassword(){

  document.getElementById("content").innerHTML = `
    <h2>Change Password</h2>

    <div class="card">
      <form id="passwordForm">

        <label>Current Password</label>
        <input type="password" name="currentPassword" required>

        <label>New Password</label>
        <input type="password" name="newPassword" required>

        <button type="submit">Change Password</button>
      </form>
    </div>
  `;

  document.getElementById("passwordForm").onsubmit = updatePassword;
}

async function updatePassword(e){
  e.preventDefault();

  const token = localStorage.getItem("token");
  const form = document.getElementById("passwordForm");

  const formData = {
    currentPassword: form.currentPassword.value,
    newPassword: form.newPassword.value
  };

  const res = await fetch("../api/common/changePassword.php",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer "+token
    },
    body:JSON.stringify(formData)
  });

  const data = await res.json();
  alert(data.message);

  if(data.success){
    form.reset();
  }
}


async function showApplications(){

  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/myApplications.php",{
    headers:{ "Authorization":"Bearer "+token }
  });

  const data = await res.json();

  if(!data.success){
    document.getElementById("content").innerHTML = "No applications found";
    return;
  }

  let html = `
    <h2>My Applications</h2>
    <div class="card">
      <table>
        <tr>
          <th>Company</th>
          <th>Drive</th>
          <th>Status</th>
          <th>Applied On</th>
        </tr>
  `;

  data.data.forEach(app => {
    html += `
      <tr>
        <td>${app.companyName}</td>
        <td>${app.driveTitle}</td>
        <td><span class="status ${app.status.toLowerCase()}">${app.status}</span></td>
        <td>${app.appliedAt}</td>
      </tr>
    `;
  });

  html += `</table></div>`;

  document.getElementById("content").innerHTML = html;
}
async function showTpoApplications(){

  const token = localStorage.getItem("token");

  const res = await fetch("../api/tpo/viewApplications.php",{
    headers:{ "Authorization":"Bearer "+token }
  });

  const data = await res.json();

  let html = `
    <h2>All Applications</h2>
    <div class="card">
      <table>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Drive</th>
          <th>Status</th>
          <th>Change</th>
        </tr>
  `;

  data.data.forEach(app=>{
    html += `
      <tr>
        <td>${app.name}</td>
        <td>${app.email}</td>
        <td>${app.driveTitle}</td>
        <td><span class="status ${app.status.toLowerCase()}">${app.status}</span></td>
        <td>
          <select onchange="updateStatus(${app.id}, this.value)">
            <option value="">Select</option>
            <option value="SHORTLISTED">SHORTLISTED</option>
            <option value="SELECTED">SELECTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </td>
      </tr>
    `;
  });

  html += "</table></div>";

  document.getElementById("content").innerHTML = html;
}
async function updateStatus(id, status){

  if(!status) return;

  const token = localStorage.getItem("token");

  const res = await fetch("../api/tpo/updateApplicationStatus.php",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer "+token
    },
    body:JSON.stringify({
      applicationId:id,
      status:status
    })
  });

  const data = await res.json();
  alert(data.message);

  showTpoApplications();
}


async function showStudentDrives(){

  const res = await fetch("../api/common/drives.php");
  const data = await res.json();

  let html = "<h2>Open Drives</h2>";

  data.data.forEach(drive=>{

    html += `
      <div class="card">

        ${drive.image 
          ? `<img src="http://localhost/placementpro/${drive.image}" 
                 style="width:100%;height:150px;object-fit:cover;border-radius:10px;margin-bottom:10px;">`
          : `<img src="https://via.placeholder.com/600x150?text=No+Image" 
                 style="width:100%;height:150px;object-fit:cover;border-radius:10px;margin-bottom:10px;">`
        }

        <h4>${drive.title}</h4>
        <p class="secondary">${drive.companyName}</p>
        <p>Min CGPA: ${drive.minCgpa}</p>

        <button onclick="applyDrive(${drive.id})">Apply</button>

      </div>
    `;
  });

  document.getElementById("content").innerHTML = html;
}



async function deleteDrive(id){

  if(!confirm("Delete this drive?")) return;

  const token = localStorage.getItem("token");

  const res = await fetch("../api/tpo/deleteDrive.php",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer "+token
    },
    body:JSON.stringify({driveId:id})
  });

  const data = await res.json();
  alert(data.message);

  showDrives();
}

function editDrive(id, title, description, minCgpa, maxBacklogs, status, image){

  document.getElementById("content").innerHTML = `
    <h2>Edit Drive</h2>

    <div class="card">

      ${image 
        ? `<img src="http://localhost/placementpro/${image}" 
               style="width:100%;height:150px;object-fit:cover;border-radius:10px;margin-bottom:15px;">`
        : `<p>No image uploaded</p>`
      }

      <form id="editDriveForm" enctype="multipart/form-data">

        <label>Title</label>
        <input name="title" value="${title}" required>

        <label>Description</label>
        <input name="description" value="${description}" required>

        <label>Min CGPA</label>
        <input name="minCgpa" value="${minCgpa}" required>

        <label>Max Backlogs</label>
        <input name="maxBacklogs" value="${maxBacklogs}" required>

        <label>Status</label>
        <select name="status">
          <option value="OPEN" ${status==='OPEN'?'selected':''}>OPEN</option>
          <option value="CLOSED" ${status==='CLOSED'?'selected':''}>CLOSED</option>
        </select>

        <label>Re-upload Image</label>
        <input type="file" name="image">

        <button type="submit">Update Drive</button>

      </form>
    </div>
  `;

  document.getElementById("editDriveForm").onsubmit = function(e){
    updateDrive(e, id);
  };
}

async function updateDrive(e, id){

  e.preventDefault();

  const token = localStorage.getItem("token");
  const form = document.getElementById("editDriveForm");
  const formData = new FormData(form);

  formData.append("driveId", id);

  const res = await fetch("../api/tpo/updateDrive.php",{
    method:"POST",
    headers:{
      "Authorization":"Bearer "+token
    },
    body: formData
  });

  const data = await res.json();
  alert(data.message);

  if(data.success){
    showManageDrives();
  }
}
function showCreateDrive(){

  document.getElementById("content").innerHTML = `
    <h2>Create Drive</h2>

    <div class="card">
      <form id="createDriveForm" enctype="multipart/form-data">

        <label>Company ID</label>
        <input name="companyId" required>

        <label>Title</label>
        <input name="title" required>

        <label>Description</label>
        <input name="description" required>

        <label>Min CGPA</label>
        <input name="minCgpa" required>

        <label>Max Backlogs</label>
        <input name="maxBacklogs" required>

        <label>Status</label>
        <select name="status">
          <option value="OPEN">OPEN</option>
          <option value="CLOSED">CLOSED</option>
        </select>

        <label>Drive Image</label>
        <input type="file" name="image">

        <button type="submit">Create Drive</button>
      </form>
    </div>
  `;

  document.getElementById("createDriveForm").onsubmit = createDrive;
}


async function createDrive(e){
  e.preventDefault();

  const token = localStorage.getItem("token");

  const form = document.getElementById("createDriveForm");
  const formData = new FormData(form);

  const res = await fetch("../api/tpo/createDrive.php",{
    method:"POST",
    headers:{
      "Authorization":"Bearer "+token
    },
    body:formData
  });

  const data = await res.json();
  alert(data.message);

  if(data.success){
    showDrives();
  }
}



