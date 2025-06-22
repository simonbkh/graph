import { showNotification } from '../static/notif.js';
import { fetchUserData } from './graphs.js';
import { loginn } from './login.js';

export function home() {
  const loginPage = document.querySelector('.login-page');
  if (loginPage) loginPage.remove();

  const graph = document.createElement('div');
  graph.className = 'graph';
  graph.innerHTML = `
    <header class="header">
      <div class="header-title">
        <img src="https://graphql.org/img/logo.svg" alt="GraphQL Logo" class="graphql-logo" />
        <h1>GraphQL</h1>
      </div>
      <div id="user-info" class="username-container">
          <span id="username" class="username-hover">Loading...</span>
          <section class="user-info-popup" id="user-info-popup">
            <h2>User Profile</h2>
            <p><strong>Full Name:</strong> <span id="fullname">Loading...</span></p>
            <p><strong>Created At:</strong> <span id="created-at">Loading...</span></p>
            <p><strong>Email:</strong> <span id="email">Loading...</span></p>
            <p><strong>Total XP:</strong> <span id="total-xp">Loading...</span></p>
          </section>
        </div>
        <div class="user-controls">
        <button id="logout-btn" class="logout-btn">Logout</button>
      </div>
    </header>
    <div class="dashboard">
      <section class="card" id="audit-analytics">
        <h2>Audit & Level</h2>
        <div id="level-container" class="level-container"></div>
        <p><strong>Audit Ratio:</strong> <span id="audit-ratio">Loading...</span></p>
        <p><strong>Total Up:</strong> <span id="total-up">Loading...</span></p>
        <p><strong>Total Down:</strong> <span id="total-down">Loading...</span></p>
      </section>
      <section class="card" id="project">
        <h2>Projects</h2>
        <p><strong>Completed:</strong> <span id="project-completed">Loading...</span></p>
        <p><strong>Uncompleted:</strong> <span id="project-uncompleted">Loading...</span></p>
      </section>
      <section class="card skills-section">
        <h2>Skills</h2>
        <div id="skills-list" class="skills-grid"></div>
      </section>
      <section class="card" id="xp-progress">
        <h2>XP Progress</h2>
        <div class="progress-bar"></div>
      </section>
    </div>
  `;

  document.body.append(graph);

  document.getElementById('logout-btn').addEventListener('click', () => {
    showNotification('Logged out successfully', 'success');
    localStorage.removeItem('token');
    const graph = document.querySelector('.graph');
    if (graph) graph.remove();
    loginn();
  });

  fetchUserData();
}