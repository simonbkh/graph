import { showNotification } from "../static/notif.js"
import { fetchUserData } from "./graphs.js"
import { loginn } from "./login.js"

export function home() {
  const loginPage = document.querySelector(".login-page")
  if (loginPage) {
    loginPage.remove()
  }
  
  const graph = document.createElement("div")
  graph.className = "graph"
  
  const userInfoPopup = `
    <section class="card user-info-popup" id="user-info-popup">
      <h2>User Info</h2>
      <p><strong>Full Name:</strong> <span id="fullname">Loading...</span></p>
      <p><strong>Created At:</strong> <span id="created-at">Loading...</span></p>
      <p><strong>Email:</strong> <span id="email">Loading...</span></p>
      <p><strong>Total XP:</strong> <span id="total-xp">Loading...</span></p>
    </section>
  `
  
  graph.innerHTML = `
    <header class="header">
      <h1>GraphQL</h1>
      <img src="https://graphql.org/img/logo.svg" alt="GraphQL Logo" class="graphql-logo" />
      <div id="user-info" class="username-container">
        <span id="username" class="username-hover">Loading...</span>
        ${userInfoPopup}
      </div>
      <button id="logout-btn" class="logout-btn">Logout</button>
    </header>
    
    <div class="dashboard">
      <!-- Audit Analytics -->
      <section class="card" id="audit-analytics">
        <h2>Audit Analytics</h2>
        <p><strong>Total Up:</strong> <span id="total-up">...</span></p>
        <p><strong>Total Down:</strong> <span id="total-down">...</span></p>
        <p><strong>Audit Ratio:</strong> <span id="audit-ratio">...</span></p>
      </section>
      
      <!-- Project -->
      <section class="card" id="project">
        <h2>Project</h2>
        <p><strong>Project Completed:</strong> <span id="project-completed">Loading...</span></p>
        <p><strong>Project Uncompeletd:</strong> <span id="project-uncompleted">Loading...</span></p>
      </section>
      
      <!-- Skills Section --> 
      <section class="card skills-section">
        <h2>Skills</h2>
        <ul id="skills-list">
          <!-- List of skills will go here -->
        </ul>
      </section>
      
      <!-- XP Progress -->
      <section class="card" id="xp-progress">
        <h2>XP Progress</h2>
        <div class="progress-barr"></div>
      </section>
    </div>
  `
  
  document.body.append(graph)
  
  const style = document.createElement('style')
  style.textContent = `
    .username-container {
      position: relative;
      display: inline-block;
    }
    
    .username-hover {
      cursor: pointer;
      border-bottom: 1px dashed #8A7BFF;
      color: #FFFFFF;
      font-weight: 500;
    }
    
    .user-info-popup {
      display: none;
      position: absolute;
      top: 120%;
      right: 0;
      z-index: 100;
      background-color: #1E1E2F;
      border: 1px solid #3B3363;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      border-radius: 8px;
      padding: 15px;
      min-width: 280px;
      color: #FFFFFF;
    }
    
    .user-info-popup h2 {
      color: #A799FF;
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 18px;
      padding-bottom: 8px;
      border-bottom: 1px solid #3B3363;
    }
    
    .info-row p {
      margin: 8px 0;
      font-size: 14px;
    }
    
    .user-info-popup strong {
      color: #A799FF;
      font-weight: 500;
    }
    
    .username-container:hover .user-info-popup {
      display: block;
      animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
  document.head.appendChild(style)

  document.getElementById("logout-btn").addEventListener("click", () => {
    showNotification("Logout Successed", "green")
    localStorage.removeItem("token")
    const grp = document.getElementsByClassName("graph")[0]
    if (grp) {
      grp.remove()  
    }
    loginn()
  })

  fetchUserData()
}