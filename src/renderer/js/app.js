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
    const messageElement = appendMessage(data);
    const container = document.getElementById('message-list');
    container.appendChild(messageElement);
    setTimeout(() => messageElement.classList.add('visible'), 10);
    container.scrollTop = container.scrollHeight;
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

function addImageViewerStyles() {
  if (document.getElementById('image-viewer-styles')) return;

  const styleElement = document.createElement('style');
  styleElement.id = 'image-viewer-styles';
  document.head.appendChild(styleElement);
}

function createImageViewer() {
  if (document.getElementById('image-viewer-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'image-viewer-overlay';
  overlay.className = 'image-viewer-overlay';

  const closeButton = document.createElement('div');
  closeButton.className = 'close-button';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = closeImageViewer;

  const img = document.createElement('img');
  img.className = 'image-viewer-content';

  overlay.appendChild(img);
  overlay.appendChild(closeButton);
  overlay.onclick = closeImageViewer;

  document.body.appendChild(overlay);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeImageViewer();
  });

  return overlay;
}

function openImageViewer(src) {
  const overlay = createImageViewer();
  const img = overlay.querySelector('img');
  img.src = src;
  setTimeout(() => {
    overlay.classList.add('visible');
  }, 10);
}

function closeImageViewer() {
  const overlay = document.getElementById('image-viewer-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  setTimeout(() => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }, 300);
}

function appendMessage(msg) {
  addImageViewerStyles();

  const div = document.createElement('div');
  div.classList.add('message');
  if (msg.type) div.classList.add(msg.type);

  const contentType = msg.content_type || msg.file_type;

  function getProperFilePath(path) {
    if (!path) return '';
    if (path.startsWith('/tmp/')) {
      return 'https://savychk1.fvds.ru' + path;
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return 'https://savychk1.fvds.ru' + (path.startsWith('/') ? '' : '/') + path;
  }

  if (!contentType || contentType === 'message' || contentType === 'text') {
    div.textContent = msg.message_text || '';
  } else if (contentType === 'image') {
    const img = document.createElement('img');
    const imgSrc = getProperFilePath(msg.file_path);
    img.src = imgSrc;
    img.alt = msg.file_name || '';
    img.addEventListener('click', () => openImageViewer(imgSrc));
    div.appendChild(img);
  } else if (contentType === 'file' || contentType === 'document') {
    const a = document.createElement('a');
    a.href = getProperFilePath(msg.file_path);
    a.textContent = msg.file_name || 'Download';
    a.target = '_blank';
    div.appendChild(a);
  } else if (contentType === 'audio' || contentType === 'voice') {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = getProperFilePath(msg.file_path);
    div.appendChild(audio);
  } else if (contentType === 'video') {
    const video = document.createElement('video');
    video.controls = true;
    video.src = getProperFilePath(msg.file_path);
    video.style.maxWidth = '100%';
    div.appendChild(video);
  } else {
    if (msg.message_text) {
      div.textContent = msg.message_text;
    } else if (msg.file_path) {
      const a = document.createElement('a');
      a.href = getProperFilePath(msg.file_path);
      a.textContent = msg.file_name || 'Download file';
      a.target = '_blank';
      div.appendChild(a);
    } else {
      div.textContent = 'Неизвестный тип сообщения';
    }
  }

  const time = document.createElement('div');
  time.className = 'message-time';
  const messageTime = new Date(msg.date || msg.created_at);
  time.textContent = messageTime.toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
  div.appendChild(time);

  return div;
}

function formatDateSeparator(date) {
  return date.toLocaleDateString('ru-RU', {
    day:   'numeric',
    month: 'long',
    year:  'numeric'
  });
}

async function loadMessages(userId, withAnimation = false, animationDelay = 30) {
  const res = await fetchWithAuth(`https://savychk1.fvds.ru/api/v1/chats/messages/${userId}`);
  let msgs = await res.json();
  const container = document.getElementById('message-list');
  container.innerHTML = '';

  msgs.sort((a, b) => {
    const dateA = new Date(a.date || a.created_at);
    const dateB = new Date(b.date || b.created_at);
    return dateA - dateB;
  });

  let lastDateStr = null;
  let animationIndex = 0;
  
  msgs.forEach((msg) => {
    const msgDate = new Date(msg.date || msg.created_at);
    const dateStr = formatDateSeparator(msgDate);

    if (dateStr !== lastDateStr) {
      const sep = document.createElement('div');
      sep.className = 'date-separator';
      sep.textContent = dateStr;
      container.appendChild(sep);
      lastDateStr = dateStr;
      
      if (withAnimation) {
        setTimeout(() => sep.classList.add('visible'), animationDelay * animationIndex);
        animationIndex++;
      } else {
        sep.classList.add('visible');
      }
    }

    const messageElement = appendMessage(msg);
    container.appendChild(messageElement);

    if (withAnimation) {
      setTimeout(() => messageElement.classList.add('visible'), animationDelay * animationIndex);
      animationIndex++;
    } else {
      messageElement.classList.add('visible');
    }
  });

  container.scrollTop = container.scrollHeight;
}

document.getElementById('msg-text').addEventListener('input', function() {
  const hasText = this.value.trim().length > 0;
  document.getElementById('send-btn').classList.toggle('active', hasText);
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 150) + 'px';
});

document.getElementById('send-btn').addEventListener('click', async () => {
  if (!currentChat) return;
  const text = document.getElementById('msg-text').value.trim();
  if (!text) return;

  const messageData = {
    user_id: currentChat.id,
    message_text: text,
    content_type: 'message',
    type: 'outgoing',
    date: new Date().toISOString()
  };

  const messageElement = appendMessage(messageData);
  const container = document.getElementById('message-list');
  container.appendChild(messageElement);
  setTimeout(() => messageElement.classList.add('visible'), 10);
  container.scrollTop = container.scrollHeight;

  document.getElementById('msg-text').value = '';
  document.getElementById('send-btn').classList.remove('active');

  await fetchWithAuth('https://savychk1.fvds.ru/api/v1/chats/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: currentChat.id,
      message_text: text,
      telegram_account_id: currentChat.telegram_account_id
    })
  });
});

const imageInput = document.createElement('input');
imageInput.type = 'file';
imageInput.accept = 'image/*';
imageInput.style.display = 'none';
document.body.appendChild(imageInput);

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

document.getElementById('image-btn').addEventListener('click', () => {
  if (!currentChat) return alert('Select a chat first');
  imageInput.click();
});
imageInput.addEventListener('change', async () => {
  if (!currentChat || imageInput.files.length === 0) return;
  const file = imageInput.files[0];
  await sendFileMessage(file, 'image');
  imageInput.value = '';
});

document.getElementById('file-btn').addEventListener('click', () => {
  if (!currentChat) return alert('Select a chat first');
  fileInput.click();
});
fileInput.addEventListener('change', async () => {
  if (!currentChat || fileInput.files.length === 0) return;
  const file = fileInput.files[0];
  await sendFileMessage(file, 'file');
  fileInput.value = '';
});

async function sendFileMessage(file, contentType) {
  const tempMsg = {
    user_id: currentChat.id,
    file_path: URL.createObjectURL(file),
    file_name: file.name,
    content_type: contentType,
    type: 'outgoing',
    date: new Date().toISOString()
  };
  const messageElement = appendMessage(tempMsg);
  const container = document.getElementById('message-list');
  container.appendChild(messageElement);
  setTimeout(() => messageElement.classList.add('visible'), 10);
  container.scrollTop = container.scrollHeight;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', currentChat.id);
  formData.append('telegram_account_id', currentChat.telegram_account_id);

  try {
    await fetchWithAuth('https://savychk1.fvds.ru/api/v1/chats/messages/send', {
      method: 'POST',
      body: formData
    });
  } catch (err) {
    console.error('File send error', err);
  }
}

window.onload = loadChats;
