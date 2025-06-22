import { showNotification } from '../static/notif.js';
import { home } from './home.js';

export function loginn() {
  const app = document.createElement('div');
  app.className = 'login-page';
  app.innerHTML = `
    <div class="login-container">
      <form class="login-form">
        <img src="https://graphql.org/img/logo.svg" alt="GraphQL Logo" class="graphql-logo" />
        <h2>Sign In</h2>
        <input type="text" id="login" placeholder="Username or Email" required autocomplete="username" />
        <input type="password" id="password" placeholder="Password" required autocomplete="current-password" />
        <button id="sign" type="submit">Sign In</button>
      </form>
    </div>
  `;
  document.body.append(app);

  const username = document.getElementById('login');
  const password = document.getElementById('password');
  const sign = document.getElementById('sign');
  let isDisabled = false;

  sign.addEventListener('click', async (e) => {
    e.preventDefault();
    if (isDisabled) return;

    isDisabled = true;
    sign.disabled = true;
    sign.classList.add('loading');

    try {
      const user = username.value.trim();
      const pass = password.value;
      if (!user || !pass) {
        showNotification('Please fill in all fields', 'error');
        return;
      }

      const base64Credentials = btoa(`${user}:${pass}`);
      const resp = await fetch('https://learn.zone01oujda.ma/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64Credentials}`,
        },
        body: JSON.stringify({ email: user, password: pass }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data);
      app.remove();
      home();
      showNotification('Login Successful', 'success');
    } catch (error) {
      showNotification(error.message || 'Error During Login', 'error');
    } finally {
      isDisabled = false;
      sign.disabled = false;
      sign.classList.remove('loading');
    }
  });
}