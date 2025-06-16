import { showNotification } from "../static/notif.js"
import {home } from "./home.js"

export function loginn(){
   let app = document.createElement("div")
   app.className= "login-page"
   app.innerHTML = `
  <div class="login-container">
    <form class="login-form">

       <img src="https://graphql.org/img/logo.svg" alt="GraphQL Logo" class="graphql-logoo" />
      <input type="name" id="login" placeholder="name or email" required />
      <input type="password" id="password" placeholder="Password" required />
      <button id="sign" type="submit">Sign In</button>
    </form>
  </div>

`
document.body.append(app)

const username = document.getElementById("login")
const password = document.getElementById('password')
const sign = document.getElementById('sign')
let isDisabled = false;
sign.addEventListener('click', async function(e) {
    e.preventDefault(); 
    if (isDisabled) {
      return;
  }
  isDisabled = true;
  sign.disabled = true;
    const user = username.value
    const pass = password.value
    const base64Credentials = btoa(user + ":" + pass);   
    const resp = await fetch('https://learn.zone01oujda.ma/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Basic " + base64Credentials
        },
        body: JSON.stringify({
          email: user,
          password: password
        }),
      });
      const data = await resp.json();
      if (!resp.ok){
        showNotification("Error During Login","error")
      }else{
        localStorage.setItem('token', data);

        home()
        showNotification("Login Successed","green")
      }
      setTimeout(() => {
        isDisabled = false;
        sign.disabled = false;
    }, 5000);

})
}