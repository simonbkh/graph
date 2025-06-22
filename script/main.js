import { home } from './home.js';
import { loginn } from './login.js';

document.addEventListener('DOMContentLoaded', () => {
  localStorage.getItem('token') ? home() : loginn();
});