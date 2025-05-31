import { Config } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('access_token');
  if (token) {
    window.location.href = 'app.html';
  }
});

document.getElementById('login-btn').addEventListener('click', async () => {
  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;
  try {
    const res = await fetch(Config.apiBaseUrl + Config.endpoints.authorization, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password })
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('login', login);
    window.location.href = 'app.html';
  } catch (e) {
    const errorElement = document.getElementById('login-error');
    errorElement.style.display = 'flex';
    
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 1000);
  }
});

document.getElementById('password').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    document.getElementById('login-btn').click(); 
  }
});