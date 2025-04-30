let currentChat = null;
const socket = io('http://109.172.115.156:5000');

socket.on('connect', () => {
  console.log('✅ WebSocket connected, id:', socket.id);
});
socket.on('connect_error', err => {
  console.error('❌ WS connection error:', err);
});

socket.on('new_message', data => {
  console.log('← new_message', data);
  if (currentChat && +data.user_id === +currentChat.id) {
    appendMessage(data);
  }
  loadMessages(currentChat.id, false);
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'login.html';
});

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('access_token');
  options.headers = { ...options.headers, 'Authorization': 'Bearer ' + token };
  let res = await fetch(url, options);
  if (res.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    const r = await fetch('https://savychk1.fvds.ru/api/v1/authorization/refresh', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + refreshToken }
    });
    if (r.ok) {
      const tokens = await r.json();
      localStorage.setItem('access_token', tokens.access_token);
      res = await fetch(url, options);
    } else {
      localStorage.clear();
      window.location.href = 'login.html';
      throw new Error('Session expired');
    }
  }
  return res;
}

async function loadChats() {
  const res = await fetchWithAuth('https://savychk1.fvds.ru/api/v1/chats');
  const chats = await res.json();
  const list = document.getElementById('chat-list');
  list.innerHTML = '';

  if (currentChat === null) {
    document.getElementById('message-input').style.display = 'none';
  }

  chats.forEach(chat => {
    const li = document.createElement('li');
    li.innerText = chat.user_name;
    
    li.addEventListener('click', () => {
      const activeChat = document.querySelector('#chat-list li.active');
      if (activeChat) activeChat.classList.remove('active');
      
      li.classList.add('active');
      
      currentChat = chat;
      if (currentChat !== null) {
        document.getElementById('message-input').style.display = 'flex';
      }
    
      loadMessages(chat.id, true);
    });
    
    list.appendChild(li);
  });
}

async function loadMessages(userId, withAnimation = false) {
  const res = await fetchWithAuth(`https://savychk1.fvds.ru/api/v1/chats/messages/${userId}`);
  const msgs = await res.json();
  const container = document.getElementById('message-list');
  container.innerHTML = '';

  msgs.forEach((m, idx) => {
    const div = document.createElement('div');
    div.classList.add('message', m.type);
    div.innerText = m.message_text;
    container.appendChild(div);

    if (withAnimation) {
      setTimeout(() => {
        div.classList.add('visible');
      }, 30 * idx); 
    } else {
      div.classList.add('visible'); 
    }
  });

  container.scrollTop = container.scrollHeight;
}

document.getElementById('msg-text').addEventListener('input', function() {
  const hasText = this.value.trim().length > 0;

  if (hasText) {
    document.getElementById('send-btn').classList.add('active');
  } else {
    document.getElementById('send-btn').classList.remove('active');
  }
});

document.getElementById('send-btn').addEventListener('click', async () => {
  if (!currentChat) return;
  const text = document.getElementById('msg-text').value.trim();
  if (!text) return;
  await fetchWithAuth('https://savychk1.fvds.ru/api/v1/chats/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: currentChat.id,
      message_text: text,
      telegram_account_id: currentChat.telegram_account_id
    })
  });
  document.getElementById('msg-text').value = '';
  document.getElementById('send-btn').classList.remove('active');
  
  loadMessages(currentChat.id, false); 
});

document.getElementById('msg-text').addEventListener('input', function () {
  this.style.height = 'auto'; 
  this.style.height = Math.min(this.scrollHeight, 150) + 'px'; 
});

window.onload = loadChats;