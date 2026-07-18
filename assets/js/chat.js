const CHAT_SUPABASE_URL = 'https://dlcrdctaoxocixmdgfuq.supabase.co';
const CHAT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_8PVRc51Ubj8P5pw0I27rEw_SUNClBRY';

let chatClient = null;
let chatChannel = null;
let chatInitialized = false;
const renderedChatMessageIds = new Set();

function showChatStatus(message, isError) {
  const status = document.getElementById('chatStatus');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('error', !!isError);
}

function addChatMessage(message) {
  if (!message || renderedChatMessageIds.has(message.id)) return;

  const messages = document.getElementById('chatMessages');
  if (!messages) return;
  const empty = messages.querySelector('.chat-empty');
  if (empty) empty.remove();

  renderedChatMessageIds.add(message.id);
  const row = document.createElement('article');
  row.className = 'chat-message';

  const meta = document.createElement('div');
  meta.className = 'chat-message-meta';
  const name = document.createElement('strong');
  name.textContent = message.name;
  const time = document.createElement('time');
  time.dateTime = message.created_at;
  time.textContent = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  meta.append(name, time);

  const text = document.createElement('p');
  text.textContent = message.content;
  row.append(meta, text);
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
}

async function loadChatMessages() {
  showChatStatus('Loading messages…');
  const { data, error } = await chatClient
    .from('chat_messages')
    .select('id, name, content, created_at')
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    console.warn('Chat message loading failed:', error);
    showChatStatus('Chat setup needed', true);
    return;
  }

  data.forEach(addChatMessage);
  showChatStatus('Live');
}

function subscribeToChat() {
  chatChannel = chatClient
    .channel('reservoir-quest-chat')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages'
    }, payload => addChatMessage(payload.new))
    .subscribe(status => {
      if (status === 'SUBSCRIBED') showChatStatus('Live');
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        showChatStatus('Connection problem', true);
      }
    });
}

function initTeamChat() {
  if (chatInitialized) return;

  if (!window.supabase) {
    showChatStatus('Chat library could not load', true);
    return;
  }

  chatInitialized = true;
  chatClient = window.supabase.createClient(CHAT_SUPABASE_URL, CHAT_SUPABASE_PUBLISHABLE_KEY);

  const nameInput = document.getElementById('chatName');
  if (nameInput) {
    nameInput.value = localStorage.getItem('reservoirQuestChatName') || '';
    nameInput.addEventListener('change', () => {
      localStorage.setItem('reservoirQuestChatName', nameInput.value.trim());
    });
  }

  loadChatMessages();
  subscribeToChat();
}

async function sendChatMessage(event) {
  event.preventDefault();
  if (!chatInitialized || !chatClient) {
    showChatStatus('Open the Chat page first', true);
    return;
  }

  const nameInput = document.getElementById('chatName');
  const messageInput = document.getElementById('chatMessage');
  const sendButton = document.getElementById('chatSendBtn');
  const name = (nameInput.value.trim() || 'Explorer').slice(0, 32);
  const content = messageInput.value.trim();
  if (!content) return;

  localStorage.setItem('reservoirQuestChatName', name);
  sendButton.disabled = true;
  sendButton.textContent = 'Sending…';

  const { data, error } = await chatClient
    .from('chat_messages')
    .insert({ name, content })
    .select('id, name, content, created_at')
    .single();

  if (error) {
    console.warn('Chat message sending failed:', error);
    toast('Message could not be sent. Please try again.');
  } else {
    addChatMessage(data);
    messageInput.value = '';
  }

  sendButton.disabled = false;
  sendButton.innerHTML = 'Send <span aria-hidden="true">↑</span>';
}
