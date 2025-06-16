import { home } from "./home.js"
import { loginn } from "./login.js"

document.addEventListener('DOMContentLoaded', function() {
    localStorage.getItem('token') ? home() : loginn()
})