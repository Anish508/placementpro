///////////////////////////////////////////////////////
// AUTHENTICATION & INITIALIZATION
///////////////////////////////////////////////////////

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

async function register() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const phone = document.getElementById("regPhone").value;
  const role = document.getElementById("regRole").value;

  const response = await fetch("../api/auth/register.php", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({name,email,password,phone,role})
  });

  const data = await response.json();
  if(data.success){
    alert("Registration successful! Please login.");
    showLogin();
  } else {
    alert(data.message);
  }
}

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
      <div onclick="showMyApplications()"> My Applications</div>
      <div onclick="showInterviewSlots()"> My Interviews</div>
      <div onclick="showMentorSlots()">Book Mentorship</div>
      <div onclick="showStudentSkills()"> Skills</div>
      <div onclick="showStudentProjects()"> Projects</div>
      <div onclick="showStudentEducation()"> Education</div>
      <div onclick="showStudentCertifications()">Certifications</div>
      <div onclick="showJobPosts()">Job Posts</div>
      <div onclick="showSkillGapAnalysis()"> Skill Gap</div>
      <div onclick="showGenerateResume()"> Generate Resume</div>
      <div onclick="showNotifications()"> Notifications</div>
      <div onclick="showProfile()"> Profile</div>
      <div onclick="showChangePassword()"> Password</div>
      <div onclick="logout()"> Logout</div>
    `;
    showStudentDrives();
  }

  if(role === "ALUMNI"){
    menu.innerHTML = `
      <div onclick="showAlumniDashboard()"> Dashboard</div>
      <div onclick="showMyJobPosts()"> My Job Posts</div>
      <div onclick="showCreateJobPost()">Post Job</div>
      <div onclick="showAlumniMentorSlots()"> Mentorship Slots</div>
      <div onclick="showCreateMentorSlot()"> Create Slot</div>
      <div onclick="showProfile()">Profile</div>
      <div onclick="showChangePassword()"> Password</div>
      <div onclick="logout()"> Logout</div>
    `;
    showAlumniDashboard();
  }

  if(role === "TPO"){
    menu.innerHTML = `
      <div onclick="showTpoDashboard()"> Dashboard</div>
      <div onclick="showCreateDrive()"> Create Drive</div>
      <div onclick="showManageDrives()"> Manage Drives</div>
      <div onclick="showTpoApplications()"> Applications</div>
      <div onclick="showEligibleStudents()"> Eligible Students</div>
      <div onclick="showScheduleInterview()"> Schedule Interviews</div>
      <div onclick="showPlacementStats()"> Analytics</div>
      <div onclick="showChangePassword()"> Password</div>
      <div onclick="logout()"> Logout</div>
    `;
    showTpoDashboard();
  }
}

async function loadUserInfo(){

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  let api = "";

  if(role === "STUDENT"){
    api = "../api/student/profile.php";
  }
  else if(role === "ALUMNI"){
    api = "../api/alumni/profile.php";
  }
  else if(role === "TPO"){
    api = "../api/tpo/profile.php";
  }

  if(!api) return;

  const res = await fetch(api, {
    headers: { "Authorization": "Bearer " + token }
  });

  if(!res.ok) return;

  const data = await res.json();
  if(!data.success) return;

  const profile = data.data;

  document.getElementById("userInfo").innerHTML = `
    <div style="font-weight:bold">${profile.name}</div>
    <div class="secondary">${role}</div>
  `;
}
///////////////////////////////////////////////////////
// STUDENT FEATURES
///////////////////////////////////////////////////////

async function showStudentDrives() {
  const token = localStorage.getItem("token");

  const res = await fetch("../api/common/drives.php", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json();

  let html = "<h2> Open Drives</h2>";

  if (!data.data || data.data.length === 0) {
    html += "<p>No drives available</p>";
    document.getElementById("content").innerHTML = html;
    return;
  }

  html += "<div class='grid'>";

  data.data.forEach(drive => {

    const alreadyApplied = drive.isApplied == 1;

    html += `
      <div class="card">
        <h4>${drive.title}</h4>
        <p class="secondary">${drive.companyName || 'Company'}</p>
        <p><strong>Min CGPA:</strong> ${drive.minCgpa}</p>
        <p><strong>Max Backlogs:</strong> ${drive.maxBacklogs}</p>
        <p><strong>Status:</strong> 
          <span class="status-badge status-${drive.status.toLowerCase()}">
            ${drive.status}
          </span>
        </p>

        <button 
          onclick="${alreadyApplied ? '' : `applyDrive(${drive.id})`}" 
          class="btn-primary ${alreadyApplied ? 'btn-disabled' : ''}"
          ${alreadyApplied ? 'disabled' : ''}
        >
          ${alreadyApplied ? 'Already Applied' : 'Apply Now'}
        </button>

      </div>
    `;
  });

  html += "</div>";
  document.getElementById("content").innerHTML = html;
} 

async function applyDrive(id){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/applyDrive.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({driveId: id})
  });

  const data = await res.json();
  alert(data.message);
  
  if(data.success) {
    showStudentDrives();
  }
}

async function showMyApplications(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/myApplications.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = "<h2> My Applications</h2>";
  
  if(!data.success || !data.data || data.data.length === 0) {
    html += "<p>No applications yet</p>";
    document.getElementById("content").innerHTML = html;
    return;
  }

  html += `
    <div class="table-responsive">
      <table class="data-table">
        <tr>
          <th>Company</th>
          <th>Job Title</th>
          <th>Status</th>
          <th>Applied On</th>
          <th>Action</th>
        </tr>
  `;

  data.data.forEach(app => {
    html += `
      <tr>
        <td>${app.companyName}</td>
        <td>${app.driveTitle || 'N/A'}</td>
        <td><span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span></td>
        <td>${new Date(app.appliedAt).toLocaleDateString()}</td>
        <td>
          
          <button onclick="deleteApplication(${app.id})" class="btn-small btn-danger">Delete</button>
        </td>
      </tr>
    `;
  });

  html += "</table></div>";
  document.getElementById("content").innerHTML = html;
}

async function viewApplicationStatus(appId){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/applicationStatus.php?applicationId=" + appId, {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();
  
  if(!data.success || !data.data || data.data.length === 0) {
    alert("Status not found");
    return;
  }

  const status = data.data[0];
  alert(`Application Status:\nCurrent: ${status.status}\nUpdated: ${new Date(status.updatedAt).toLocaleString()}\nRemarks: ${status.remarks || 'N/A'}`);
}

async function deleteApplication(appId){
  if(!confirm("Delete this application?")) return;
  
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/deleteApplication.php", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({applicationId: appId})
  });

  const data = await res.json();
  alert(data.message);
  
  if(data.success) {
    showMyApplications();
  }
}

async function showStudentSkills(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/skills.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = "<h2> My Skills</h2>";
  html += `
    <div class="card">
      <h3>Add New Skill</h3>
      <form id="skillForm">
        <input type="text" id="skillName" placeholder="Skill name" required>
        <button type="submit" class="btn-primary">Add Skill</button>
      </form>
    </div>
  `;

  if(data.data && data.data.length > 0) {
    html += "<h3>Current Skills</h3><div class='tags'>";
    data.data.forEach(skill => {
      html += `
        <div class="tag">
          ${skill.name}
          <button onclick="removeSkill(${skill.id})" class="btn-remove">✕</button>
        </div>
      `;
    });
    html += "</div>";
  } else {
    html += "<p>No skills added yet</p>";
  }

  document.getElementById("content").innerHTML = html;

  document.getElementById("skillForm").onsubmit = addSkill;
}

async function addSkill(e) {
  e.preventDefault();
  
  const token = localStorage.getItem("token");
  const skillName = document.getElementById("skillName").value;

  const res = await fetch("../api/student/skills.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({skillName})
  });

  const data = await res.json();
  alert(data.message);
  
  if(data.success) {
    showStudentSkills();
  }
}

async function removeSkill(skillId) {
  if(!confirm("Remove this skill?")) return;
  
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/skills.php", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({skillId})
  });

  const data = await res.json();
  alert(data.message);
  
  if(data.success) {
    showStudentSkills();
  }
}

async function showStudentProjects(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/projects.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = "<h2> My Projects</h2>";
  html += `
    <div class="card">
      <h3>Add New Project</h3>
      <form id="projectForm">
        <input type="text" id="projectTitle" placeholder="Project title" required>
        <textarea id="projectDesc" placeholder="Description" required></textarea>
        <input type="text" id="projectTech" placeholder="Tech Stack (comma separated)" required>
        <button type="submit" class="btn-primary">Add Project</button>
      </form>
    </div>
  `;

  if(data.data && data.data.length > 0) {
    html += "<h3>Current Projects</h3><div class='grid'>";
    data.data.forEach(project => {
      html += `
        <div class="card">
          <h4>${project.title}</h4>
          <p>${project.description}</p>
          <p class="secondary">Tech: ${project.techStack}</p>
          <div class="card-actions">
            <button onclick="deleteProject(${project.id})" class="btn-small btn-danger">Delete</button>
          </div>
        </div>
      `;
    });
    html += "</div>";
  } else {
    html += "<p>No projects yet</p>";
  }

  document.getElementById("content").innerHTML = html;
  document.getElementById("projectForm").onsubmit = addProject;
}

async function addProject(e) {
  e.preventDefault();
  
  const token = localStorage.getItem("token");
  const formData = {
    title: document.getElementById("projectTitle").value,
    description: document.getElementById("projectDesc").value,
    techStack: document.getElementById("projectTech").value
  };

  const res = await fetch("../api/student/projects.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(formData)
  });

  const data = await res.json();
  alert(data.message);
  
  if(data.success) {
    showStudentProjects();
  }
}

async function deleteProject(projectId) {
  if(!confirm("Delete this project?")) return;
  
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/projects.php", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({projectId})
  });

  const data = await res.json();
  alert(data.message);
  
  if(data.success) {
    showStudentProjects();
  }
}

async function showStudentEducation(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/education.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = "<h2> Education</h2>";
  html += `
    <div class="card">
      <h3>Add Education</h3>
      <form id="educationForm">
        <input type="text" id="degree" placeholder="Degree" required>
        <input type="text" id="institute" placeholder="Institute" required>
        <input type="number" id="year" placeholder="Graduation Year" required>
        <input type="number" step="0.01" id="marks" placeholder="CGPA/Percentage" required>
        <button type="submit" class="btn-primary">Add Education</button>
      </form>
    </div>
  `;

  if(data.data && data.data.length > 0) {
    html += "<h3>Education History</h3><div class='card-list'>";
    data.data.forEach(edu => {
      html += `
        <div class="card">
          <h4>${edu.degree}</h4>
          <p class="secondary">${edu.institute}</p>
          <p>${edu.year} <strong>CGPA: ${edu.marks}</strong></p>
          <button onclick="deleteEducation(${edu.id})" class="btn-small btn-danger">Delete</button>
        </div>
      `;
    });
    html += "</div>";
  } else {
    html += "<p>No education records yet</p>";
  }

  document.getElementById("content").innerHTML = html;
  document.getElementById("educationForm").onsubmit = addEducation;
}

async function addEducation(e) {
  e.preventDefault();
  
  const token = localStorage.getItem("token");
  const formData = {
    degree: document.getElementById("degree").value,
    institute: document.getElementById("institute").value,
    year: parseInt(document.getElementById("year").value),
    marks: parseFloat(document.getElementById("marks").value)
  };

  const res = await fetch("../api/student/education.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(formData)
  });

  const data = await res.json();
  alert(data.message);
  
  if(data.success) {
    showStudentEducation();
  }
}

async function deleteEducation(eduId) {
  if(!confirm("Delete this education record?")) return;
  
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/education.php", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({educationId: eduId})
  });

  const data = await res.json();
  alert(data.message);
  
  if(data.success) {
    showStudentEducation();
  }
}

async function showStudentCertifications(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/certifications.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = "<h2> Certifications</h2>";
  html += `
    <div class="card">
      <h3>Add Certification</h3>
      <form id="certForm">
        <input type="text" id="certName" placeholder="Certification Name" required>
        <input type="text" id="issuer" placeholder="Issuer" required>
        <input type="number" id="certYear" placeholder="Year" required>
        <button type="submit" class="btn-primary">Add Certification</button>
      </form>
    </div>
  `;

  if(data.data && data.data.length > 0) {
    html += "<h3>My Certifications</h3><div class='card-list'>";
    data.data.forEach(cert => {
      html += `
        <div class="card">
          <h4>${cert.name}</h4>
          <p class="secondary">${cert.issuer}  ${cert.year}</p>
          <button onclick="deleteCertification(${cert.id})" class="btn-small btn-danger">Delete</button>
        </div>
      `;
    });
    html += "</div>";
  } else {
    html += "<p>No certifications yet</p>";
  }

  document.getElementById("content").innerHTML = html;
  document.getElementById("certForm").onsubmit = addCertification;
}

async function addCertification(e) {
  e.preventDefault();
  
  const token = localStorage.getItem("token");

  const formData = {
    certName: document.getElementById("certName").value.trim(),
    issuer: document.getElementById("issuer").value.trim(),
    year: parseInt(document.getElementById("certYear").value)
  };

  if (!formData.certName || !formData.issuer || !formData.year) {
    alert("All fields are required");
    return;
  }

  const res = await fetch("../api/student/certifications.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(formData)
  });

  const data = await res.json();
  alert(data.message);

  if (data.success) {
    document.getElementById("certForm").reset();
    showStudentCertifications();
  }
}

async function deleteCertification(certId) {
  if(!confirm("Delete this certification?")) return;
  
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/certifications.php", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({certificationId: certId})
  });

  const data = await res.json();
  alert(data.message);
  
  if(data.success) {
    showStudentCertifications();
  }
}

async function showInterviewSlots(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/listInterviewSlots.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = "<h2> My Interview Slots</h2>";

  if(data.data && data.data.length > 0) {
    html += "<div class='grid'>";
    data.data.forEach(slot => {
      html += `
        <div class="card">
          <h4>Drive: ${slot.driveTitle || 'N/A'}</h4>
          <p><strong>Date & Time:</strong> ${new Date(slot.startTime).toLocaleString()}</p>
          <p><strong>Location:</strong> ${slot.room || 'TBD'}</p>
          <button onclick="bookInterviewSlot(${slot.id})" class="btn-primary">Book Interview</button>
        </div>
      `;
    });
    html += "</div>";
  } else {
    html += "<p>No interview slots available</p>";
  }

  document.getElementById("content").innerHTML = html;
}

async function bookInterviewSlot(slotId) {
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/bookInterviewSlot.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({slotId})
  });

  const data = await res.json();
  alert(data.message);
  
  if(data.success) {
    showInterviewSlots();
  }
}

async function showMentorSlots(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/viewMentorSlots.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = "<h2> Available Mentor Slots</h2>";

  if(data.data && data.data.length > 0) {
    html += "<div class='grid'>";
    data.data.forEach(slot => {
      const isBooked = slot.isBooked || slot.booked_by;
      html += `
        <div class="card">
          <h4>${slot.mentorName || 'Alumni Mentor'}</h4>
          <p class="secondary">${slot.mentorEmail || 'N/A'}</p>
          <p><strong>Date & Time:</strong></p>
          <p>Start: ${new Date(slot.startTime).toLocaleString()}</p>
          <p>End: ${new Date(slot.endTime).toLocaleString()}</p>
          <p><strong>Status:</strong> <span class="status-badge ${isBooked ? 'status-booked' : 'status-available'}">${isBooked ? 'Booked' : 'Available'}</span></p>
          ${!isBooked ? `<button onclick="bookMentorSlot(${slot.id})" class="btn-primary">Book Session</button>` : '<p class="secondary">This slot is already booked</p>'}
        </div>
      `;
    });
    html += "</div>";
  } else {
    html += "<p>No mentor slots available</p>";
  }

  document.getElementById("content").innerHTML = html;
}

async function bookMentorSlot(slotId) {
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/bookMentorSlot.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({slotId})
  });

  const data = await res.json();
  alert(data.message);
  
  if(data.success) {
    showMentorSlots();
  }
}

async function showJobPosts(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/getJobPosts.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = "<h2> Job Posts from Alumni</h2>";

  if(data.data && data.data.length > 0) {
    html += "<div class='grid'>";
    data.data.forEach(job => {
      html += `
        <div class="card">
          <h4>${job.title}</h4>
          <p><strong>Posted by:</strong> ${job.alumniName || 'Anonymous'}</p>
          <p class="secondary">${job.company || 'Company Name'}</p>
          <p><strong>Description:</strong> ${job.description}</p>
          <p class="secondary"> ${job.alumniEmail}</p>
          <p class="secondary"> ${job.alumniPhone || 'N/A'}</p>
        </div>
      `;
    });
    html += "</div>";
  } else {
    html += "<p>No job posts available</p>";
  }

  document.getElementById("content").innerHTML = html;
}

function showSkillGapAnalysis() {
  window.open("https://google.com", "_blank");
}
async function showGenerateResume(){
  const token = localStorage.getItem("token");

  document.getElementById("content").innerHTML = `
    <h2> Generate Resume</h2>
    <div class="card">
      <p>Click the button below to generate and download your resume as PDF.</p>
      <button onclick="generatePDF()" class="btn-primary">Download Resume as PDF</button>
    </div>
  `;
}

async function generatePDF() {
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/generateResume.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  if(data.success) {
    const pdfUrl = data.data.pdfUrl || data.message;
    window.open(pdfUrl, '_blank');
    alert("Resume generated successfully!");
  } else {
    alert("Error: " + data.message);
  }
}

async function showNotifications(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/getNotifications.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = "<h2> Notifications</h2>";

  if(data.data && data.data.length > 0) {
    html += "<div class='notifications-list'>";
    data.data.forEach(notif => {
      html += `
        <div class="notification-card ${notif.isRead ? '' : 'unread'}">
          <h4>${notif.message || notif.title}</h4>
          <p class="secondary">${new Date(notif.createdAt).toLocaleString()}</p>
        </div>
      `;
    });
    html += "</div>";
  } else {
    html += "<p>No notifications</p>";
  }

  document.getElementById("content").innerHTML = html;
}

async function showProfile(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/profile.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  if(!data.success){
    document.getElementById("content").innerHTML = "<h2>Profile not found</h2>";
    return;
  }

  const profile = data.data;

  document.getElementById("content").innerHTML = `
    <h2> My Profile</h2>

    <div class="card">
      ${profile.profileImage ? 
        `<img src="../${profile.profileImage}" style="width:100px;height:100px;border-radius:50%;margin-bottom:10px;">`
        : ""
      }

      <form id="profileForm">
        <label>Name</label>
        <input name="name" value="${profile.name}" disabled>

        <label>Email</label>
        <input name="email" value="${profile.email}" disabled>

        <label>Phone</label>
        <input name="phone" value="${profile.phone || ''}" required>

        <label>CGPA</label>
        <input type="number" step="0.01" name="cgpa" value="${profile.cgpa}" required>

        <label>Backlogs</label>
        <input type="number" name="backlogCount" value="${profile.backlogCount || 0}" required>

        <label>Profile Image</label>
        <input type="file" name="profileImage">

        <button type="submit" class="btn-primary">Update Profile</button>
      </form>
    </div>
  `;

  document.getElementById("profileForm").onsubmit = updateProfile;
}

async function updateProfile(event) {
  event.preventDefault();

  const token = localStorage.getItem("token");
  const form = document.getElementById("profileForm");
  const formData = new FormData(form);

  const res = await fetch("../api/student/profile.php", {
    method: "POST",
    headers: { "Authorization": "Bearer " + token },
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
    <h2> Change Password</h2>

    <div class="card">
      <form id="passwordForm">
        <label>Current Password</label>
        <input type="password" name="currentPassword" required>

        <label>New Password</label>
        <input type="password" name="newPassword" required>

        <label>Confirm Password</label>
        <input type="password" name="confirmPassword" required>

        <button type="submit" class="btn-primary">Change Password</button>
      </form>
    </div>
  `;

  document.getElementById("passwordForm").onsubmit = updatePassword;
}

async function updatePassword(e){
  e.preventDefault();

  const token = localStorage.getItem("token");
  const form = document.getElementById("passwordForm");

  if(form.newPassword.value !== form.confirmPassword.value) {
    alert("Passwords don't match!");
    return;
  }

  const formData = {
    oldPassword: form.currentPassword.value,
    newPassword: form.newPassword.value
  };

  const res = await fetch("../api/common/changePassword.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(formData)
  });

  const data = await res.json();
  alert(data.message);

  if(data.success){
    form.reset();
  }
}

///////////////////////////////////////////////////////
// ALUMNI FEATURES
///////////////////////////////////////////////////////

async function showAlumniDashboard(){
  const token = localStorage.getItem("token");

  const jobRes = await fetch("../api/student/getJobPosts.php", {
    headers: { "Authorization": "Bearer " + token }
  });
  const jobData = await jobRes.json();

  const mentorRes = await fetch("../api/alumni/viewMentorSlots.php", {
    headers: { "Authorization": "Bearer " + token }
  });
  const mentorData = await mentorRes.json();

  const jobCount = jobData.data ? jobData.data.length : 0;
  const slotCount = mentorData.data ? mentorData.data.length : 0;
  const bookedCount = mentorData.data ? mentorData.data.filter(s => s.isBooked).length : 0;

  let html = `
    <h2> Alumni Dashboard</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>${jobCount}</h3>
        <p>Job Posts</p>
      </div>
      <div class="stat-card">
        <h3>${slotCount}</h3>
        <p>Mentorship Slots</p>
      </div>
      <div class="stat-card">
        <h3>${bookedCount}</h3>
        <p>Booked Sessions</p>
      </div>
    </div>
    <p>Welcome! Use the menu to manage job posts and mentorship slots.</p>
  `;

  document.getElementById("content").innerHTML = html;
}

async function showMyJobPosts(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/student/getJobPosts.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = "<h2> My Job Posts</h2>";

  if(data.data && data.data.length > 0) {
    html += "<div class='grid'>";
    data.data.forEach(job => {
      html += `
        <div class="card">
          <h4>${job.title}</h4>
          <p class="secondary">${job.company || 'Company'}</p>
          <p>${job.description}</p>
          <button onclick="deleteJobPost(${job.id})" class="btn-small btn-danger">Delete</button>
        </div>
      `;
    });
    html += "</div>";
  } else {
    html += "<p>No job posts yet. Create one to get started!</p>";
  }

  document.getElementById("content").innerHTML = html;
}

async function showCreateJobPost(){
  document.getElementById("content").innerHTML = `
    <h2> Create Job Post</h2>

    <div class="card">
      <form id="jobPostForm">
        <label>Job Title</label>
        <input id="jobTitle" placeholder="e.g., Senior Developer" required>

        <label>Company Name</label>
        <input id="jobCompany" placeholder="Company name" required>

        <label>Description</label>
        <textarea id="jobDesc" placeholder="Job description" required></textarea>

        <label>Salary Range (Optional)</label>
        <input id="jobSalary" placeholder="e.g., 10-15 LPA">

        <label>Location (Optional)</label>
        <input id="jobLocation" placeholder="Work location">

        <button type="submit" class="btn-primary">Post Job</button>
      </form>
    </div>
  `;

  document.getElementById("jobPostForm").onsubmit = createJobPost;
}

async function createJobPost(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const formData = {
    jobTitle: document.getElementById("jobTitle").value,
    companyName: document.getElementById("jobCompany").value,
    description: document.getElementById("jobDesc").value,
    salary: document.getElementById("jobSalary").value,
    location: document.getElementById("jobLocation").value
  };

  const res = await fetch("../api/alumni/postJob.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(formData)
  });

  const data = await res.json();
  alert(data.message);

  if(data.success) {
    document.getElementById("jobPostForm").reset();
    showMyJobPosts();
  }
}

async function deleteJobPost(jobId) {
  if(!confirm("Delete this job post?")) return;

  const token = localStorage.getItem("token");

  const res = await fetch("../api/alumni/deleteJobPost.php", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({jobId})
  });

  const data = await res.json();
  alert(data.message);

  if(data.success) {
    showMyJobPosts();
  }
}

async function showAlumniMentorSlots(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/alumni/viewMentorSlots.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = "<h2> My Mentorship Slots</h2>";

  if(data.data && data.data.length > 0) {
    html += "<div class='grid'>";
    data.data.forEach(slot => {
      const isBooked = slot.isBooked || slot.booked_by;
      html += `
        <div class="card">
          <p><strong>Start:</strong> ${new Date(slot.startTime).toLocaleString()}</p>
          <p><strong>End:</strong> ${new Date(slot.endTime).toLocaleString()}</p>
          <p><strong>Status:</strong> <span class="status-badge ${isBooked ? 'status-booked' : 'status-available'}">${isBooked ? '✓ Booked' : 'Available'}</span></p>
          <button onclick="deleteMentorSlot(${slot.id})" class="btn-small btn-danger">Delete</button>
        </div>
      `;
    });
    html += "</div>";
  } else {
    html += "<p>No slots created yet. Create one to start mentoring!</p>";
  }

  document.getElementById("content").innerHTML = html;
}

async function showCreateMentorSlot(){
  document.getElementById("content").innerHTML = `
    <h2> Create Mentorship Slot</h2>

    <div class="card">
      <h3>Schedule Your Availability</h3>
      <form id="slotForm">
        <label>Start Time</label>
        <input type="datetime-local" id="slotStart" required>

        <label>End Time</label>
        <input type="datetime-local" id="slotEnd" required>

        <button type="submit" class="btn-primary">Create Slot</button>
      </form>
    </div>
  `;

  document.getElementById("slotForm").onsubmit = createMentorSlot;
}

async function createMentorSlot(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const startTime = document.getElementById("slotStart").value;
  const endTime = document.getElementById("slotEnd").value;

  if(new Date(startTime) >= new Date(endTime)) {
    alert("End time must be after start time!");
    return;
  }

  const formData = {
    startTime: startTime + ":00",
    endTime: endTime + ":00"
  };

  const res = await fetch("../api/alumni/createMentorSlot.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(formData)
  });

  const data = await res.json();
  alert(data.message);

  if(data.success) {
    document.getElementById("slotForm").reset();
    showAlumniMentorSlots();
  }
}

async function deleteMentorSlot(slotId) {
  if(!confirm("Delete this slot?")) return;

  const token = localStorage.getItem("token");

  const res = await fetch("../api/alumni/deleteMentorSlot.php", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({slotId})
  });

  const data = await res.json();
  alert(data.message);

  if(data.success) {
    showAlumniMentorSlots();
  }
}

///////////////////////////////////////////////////////
// TPO (ADMIN) FEATURES
///////////////////////////////////////////////////////

async function showTpoDashboard(){
  const token = localStorage.getItem("token");

  const driveRes = await fetch("../api/common/drives.php", {
  headers: {
    "Authorization": "Bearer " + token
  }
});
  const driveData = await driveRes.json();

  const appRes = await fetch("../api/tpo/viewApplications.php", {
    headers: { "Authorization": "Bearer " + token }
  });
  const appData = await appRes.json();

  const statsRes = await fetch("../api/tpo/placementStats.php", {
    headers: { "Authorization": "Bearer " + token }
  });
  const statsData = await statsRes.json();

  const drives = driveData.data ? driveData.data.length : 0;
  const applications = appData.data ? appData.data.length : 0;
  const stats = statsData.data || {};

  let html = `
    <h2> TPO Dashboard</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>${drives}</h3>
        <p>Active Drives</p>
      </div>
      <div class="stat-card">
        <h3>${applications}</h3>
        <p>Applications</p>
      </div>
      <div class="stat-card">
        <h3>${stats.totalStudents || 0}</h3>
        <p>Total Students</p>
      </div>
      <div class="stat-card">
        <h3>${stats.placedStudents || 0}</h3>
        <p>Placed Students</p>
      </div>
      <div class="stat-card">
        <h3>${stats.placementPercentage || '0'}%</h3>
        <p>Placement %</p>
      </div>
      <div class="stat-card">
        <h3>${stats.averagePackage || 'N/A'}</h3>
        <p>Avg Package</p>
      </div>
    </div>
  `;

  document.getElementById("content").innerHTML = html;
}

async function showCreateDrive() {

  const token = localStorage.getItem("token");

  const companyRes = await fetch("../api/tpo/getCompanies.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const branchRes = await fetch("../api/tpo/getBranches.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const companies = (await companyRes.json()).data;
  const branches = (await branchRes.json()).data;

  let companyOptions = "";
  companies.forEach(c => {
    companyOptions += `<option value="${c.id}">${c.name}</option>`;
  });

  let branchOptions = "";
  branches.forEach(b => {
    branchOptions += `<option value="${b.id}">${b.name}</option>`;
  });

  document.getElementById("content").innerHTML = `
    <h2>Create Drive</h2>

    <div class="card">
      <form id="createDriveForm" enctype="multipart/form-data">

        <label>Company</label>
        <select name="companyId" required>
          ${companyOptions}
        </select>

        <label>Branch</label>
        <select name="branchId" required>
          ${branchOptions}
        </select>

        <label>Job Title</label>
        <input name="title" required>

        <label>Description</label>
        <textarea name="description" required></textarea>

        <label>Min CGPA</label>
        <input name="minCgpa" type="number" step="0.01" required>

        <label>Max Backlogs</label>
        <input name="maxBacklogs" type="number" required>

        <label>Status</label>
        <select name="status" required>
          <option value="OPEN">OPEN</option>
          <option value="CLOSED">CLOSED</option>
        </select>

        <label>Drive Image</label>
        <input type="file" name="image">

        <button type="submit" class="btn-primary">Create Drive</button>
      </form>
    </div>
  `;

  document.getElementById("createDriveForm").onsubmit = createDrive;
}
async function createDrive(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const form = document.getElementById("createDriveForm");
  const formData = new FormData(form);

  const res = await fetch("../api/tpo/createDrive.php", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    },
    body: formData
  });

  const data = await res.json();
  alert(data.message);
}

async function showManageDrives(){

  const token = localStorage.getItem("token");

  const res = await fetch("../api/common/drives.php", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  if(!res.ok){
    alert("Unauthorized. Please login again.");
    return;
  }

  const data = await res.json();

  let html = "<h2> Manage Drives</h2>";

  if(!data.success || !data.data || data.data.length === 0){
    html += "<p>No drives created yet</p>";
    document.getElementById("content").innerHTML = html;
    return;
  }

  html += "<div class='grid'>";
  data.data.forEach(drive => {
    html += `
      <div class="card">
        <h4>${drive.title}</h4>
        <p class="secondary">${drive.companyName}</p>
        <p><strong>Min CGPA:</strong> ${drive.minCgpa}</p>
        <p><strong>Max Backlogs:</strong> ${drive.maxBacklogs}</p>
        <p><strong>Status:</strong> 
          <span class="status-badge status-${drive.status.toLowerCase()}">
            ${drive.status}
          </span>
        </p>

        <button onclick="editDrive(${drive.id}, 
          '${drive.title.replace(/'/g,"\\'")}', 
          '${drive.description.replace(/'/g,"\\'")}', 
          ${drive.minCgpa}, 
          ${drive.maxBacklogs}, 
          '${drive.status}', 
          ${drive.companyId}, 
          ${drive.branchId}
        )" class="btn-small">Edit</button>

        <button onclick="deleteDrive(${drive.id})" 
          class="btn-small btn-danger">Delete</button>
      </div>
    `;
  });

  html += "</div>";
  document.getElementById("content").innerHTML = html;
}

async function editDrive(id, title, description, minCgpa, maxBacklogs, status, companyId, branchId){

  const token = localStorage.getItem("token");

  const companyRes = await fetch("../api/tpo/getCompanies.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const branchRes = await fetch("../api/tpo/getBranches.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const companies = (await companyRes.json()).data;
  const branches = (await branchRes.json()).data;

  let companyOptions = "";
  companies.forEach(c => {
    companyOptions += `<option value="${c.id}" ${c.id == companyId ? "selected" : ""}>${c.name}</option>`;
  });

  let branchOptions = "";
  branches.forEach(b => {
    branchOptions += `<option value="${b.id}" ${b.id == branchId ? "selected" : ""}>${b.name}</option>`;
  });

  document.getElementById("content").innerHTML = `
    <h2>Edit Drive</h2>

    <div class="card">
      <form id="editDriveForm" enctype="multipart/form-data">

        <label>Company</label>
        <select name="companyId" required>
          ${companyOptions}
        </select>

        <label>Branch</label>
        <select name="branchId" required>
          ${branchOptions}
        </select>

        <label>Title</label>
        <input name="title" value="${title}" required>

        <label>Description</label>
        <textarea name="description" required>${description}</textarea>

        <label>Min CGPA</label>
        <input name="minCgpa" type="number" step="0.01" value="${minCgpa}" required>

        <label>Max Backlogs</label>
        <input name="maxBacklogs" type="number" value="${maxBacklogs}" required>

        <label>Status</label>
        <select name="status">
          <option value="OPEN" ${status === 'OPEN' ? 'selected' : ''}>OPEN</option>
          <option value="CLOSED" ${status === 'CLOSED' ? 'selected' : ''}>CLOSED</option>
        </select>

        <label>Image</label>
        <input type="file" name="image">

        <button type="submit" class="btn-primary">Update Drive</button>
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

  const res = await fetch("../api/tpo/updateDrive.php", {
    method: "POST",
    headers: { "Authorization": "Bearer " + token },
    body: formData
  });

  const data = await res.json();
  alert(data.message);

  if(data.success){
    showManageDrives();
  }
}

async function deleteDrive(id){
  if(!confirm("Delete this drive?")) return;

  const token = localStorage.getItem("token");

  const res = await fetch("../api/tpo/deleteDrive.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({driveId: id})
  });

  const data = await res.json();
  alert(data.message);

  if(data.success){
    showManageDrives();
  }
}

async function showTpoApplications(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/tpo/viewApplications.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = `<h2> Applications Management</h2>`;

  if(!data.data || data.data.length === 0) {
    html += "<p>No applications</p>";
    document.getElementById("content").innerHTML = html;
    return;
  }

  html += `
    <div class="table-responsive">
      <table class="data-table">
        <tr>
          <th>Student Name</th>
          <th>Email</th>
          <th>Drive</th>
          <th>Status</th>
          <th>Applied On</th>
          <th>Action</th>
        </tr>
  `;

  data.data.forEach(app => {
    html += `
      <tr>
        <td>${app.name}</td>
        <td>${app.email}</td>
        <td>${app.driveTitle}</td>
        <td><span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span></td>
        <td>${new Date(app.appliedAt).toLocaleDateString()}</td>
        <td>
          <select onchange="updateApplicationStatus(${app.id}, this.value)">
            <option value="">Update Status</option>
            <option value="APPLIED">APPLIED</option>
            <option value="APTITUDE">APTITUDE</option>
            <option value="CLEARED">CLEARED</option>
            <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
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

async function updateApplicationStatus(id, status){
  if(!status) return;

  const token = localStorage.getItem("token");
  const remarks = prompt("Add remarks (optional):", "");

  const res = await fetch("../api/tpo/updateApplicationStatus.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({applicationId: id, status, remarks: remarks || ""})
  });

  const data = await res.json();
  alert(data.message);

  if(data.success){
    showTpoApplications();
  }
}
async function showEligibleStudents() {
  const token = localStorage.getItem("token");

  const res = await fetch("../api/tpo/eligibleStudents.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = "<h2>👥 Eligible Students (Unplaced)</h2>";

  if (!data.data || data.data.length === 0) {
    html += "<p>No eligible students</p>";
    document.getElementById("content").innerHTML = html;
    return;
  }

  html += `
    <div class="table-responsive">
      <table class="data-table">
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>CGPA</th>
          <th>Backlogs</th>
        </tr>
  `;

  data.data.forEach(student => {
    html += `
      <tr>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.cgpa}</td>
        <td>${student.backlogCount}</td>
      </tr>
    `;
  });

  html += `
      </table>
    </div>

    <div style="margin-top: 20px;">
      <button onclick="notifyAllStudents()" class="btn-primary">
        📧 Notify All Eligible Students
      </button>
    </div>
  `;

  document.getElementById("content").innerHTML = html;
}



async function notifyAllStudents() {

  const token = localStorage.getItem("token");

  const res = await fetch("../api/tpo/notifyEligibleStudents.php", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json();
  alert(data.message);
}
async function showScheduleInterview(){
  const token = localStorage.getItem("token");

 const drivesRes = await fetch("../api/common/drives.php", {
  headers: {
    "Authorization": "Bearer " + token
  }
});
  const drivesData = await drivesRes.json();

  let driveOptions = '<option value="">Select Drive</option>';
  if(drivesData.data) {
    drivesData.data.forEach(drive => {
      driveOptions += `<option value="${drive.id}">${drive.title}</option>`;
    });
  }

  document.getElementById("content").innerHTML = `
    <h2> Schedule Interview Slots</h2>

    <div class="card">
      <form id="scheduleForm">
        <label>Select Drive</label>
        <select id="slotDriveId" required>
          ${driveOptions}
        </select>

        <label>Start Time</label>
        <input type="datetime-local" id="slotStartTime" required>

        <label>End Time</label>
        <input type="datetime-local" id="slotEndTime" required>

        <label>Room/Location</label>
        <input type="text" id="slotRoom" placeholder="e.g., Conference Room A" required>

        <button type="submit" class="btn-primary">Schedule</button>
      </form>
    </div>
  `;

  document.getElementById("scheduleForm").onsubmit = scheduleInterview;
}

async function scheduleInterview(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const formData = {
    driveId: parseInt(document.getElementById("slotDriveId").value),
    startTime: document.getElementById("slotStartTime").value + ":00",
    endTime: document.getElementById("slotEndTime").value + ":00",
    room: document.getElementById("slotRoom").value
  };

  const res = await fetch("../api/tpo/scheduleInterview.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(formData)
  });

  const data = await res.json();
  alert(data.message);

  if(data.success) {
    document.getElementById("scheduleForm").reset();
  }
}

async function showPlacementStats(){
  const token = localStorage.getItem("token");

  const res = await fetch("../api/tpo/placementStats.php", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  let html = "<h2> Placement Statistics</h2>";

  if(data.success && data.data) {
    const stats = data.data;
    html += `
      <div class="stats-grid">
        <div class="stat-card">
          <h3>${stats.totalStudents || 0}</h3>
          <p>Total Students</p>
        </div>
        <div class="stat-card">
          <h3>${stats.placedStudents || 0}</h3>
          <p>Placed Students</p>
        </div>
        <div class="stat-card">
          <h3>${stats.unplacedStudents || 0}</h3>
          <p>Unplaced Students</p>
        </div>
        <div class="stat-card">
          <h3>${stats.placementPercentage || '0'}%</h3>
          <p>Placement Percentage</p>
        </div>
        <div class="stat-card">
          <h3>${stats.highestPackage || 'N/A'}</h3>
          <p>Highest Package</p>
        </div>
        <div class="stat-card">
          <h3>${stats.averagePackage || 'N/A'}</h3>
          <p>Average Package</p>
        </div>
      </div>
    `;
  } else {
    html += "<p>No statistics available</p>";
  }

  document.getElementById("content").innerHTML = html;
}
