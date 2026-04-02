/* script.js
   Minimal client to talk to LM Studio at 192.168.0.250:1234.
   Uses OpenAI-compatible request shape. Adjust model name and API key as needed.
*/

/* CONFIG: point to the LM Studio server shown in your app */
const API_URL = 'http://192.168.1.28:1234/v1/chat/completions';

/* If LM Studio requires an API key, set it here (or add to headers below).
   Keep keys out of public repos. */
const API_KEY = ''; // e.g. 'sk-xxxx' or leave empty if not required

/* UI elements */
const form = document.getElementById('chat-form');
const messages = document.getElementById('messages');
const statusEl = document.getElementById('sys-status');
const modelEl = document.getElementById('sys-model');
const uptimeEl = document.getElementById('sys-uptime');
const menuBtn = document.getElementById('menuBtn');
const menuPanel = document.getElementById('menuPanel');

/* Toggle simple menu (no JS frameworks) */
menuBtn.addEventListener('click', () => {
  const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
  menuBtn.setAttribute('aria-expanded', String(!expanded));
  if (menuPanel.hidden) menuPanel.hidden = false;
  else menuPanel.hidden = true;
});

/* Small helper to escape HTML in messages */
function escapeHtml(s){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

/* Append a message to the log */
function appendMessage(who, text){
  const el = document.createElement('div');
  el.className = 'msg';
  el.innerHTML = `<strong>${escapeHtml(who)}:</strong> <span style="margin-left:0.5rem">${escapeHtml(text)}</span>`;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

/* Check server status with a lightweight request.
   Some LM Studio builds accept OPTIONS; if not, we attempt a tiny POST ping.
*/
async function checkStatus(){
  try{
    // Try a tiny POST ping using the model you typically load.
    const pingBody = {
      model: "qwen2.5-coder-3b-instruct",
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 8
    };

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {})
      },
      body: JSON.stringify(pingBody),
      // short timeout not available natively; rely on browser/network
    });

    if (!res.ok) {
      statusEl.textContent = `error ${res.status}`;
      modelEl.textContent = '—';
      return;
    }

    const data = await res.json();
    statusEl.textContent = 'online';
    // Try to extract model name if present
    modelEl.textContent = data.model ?? (data.choices?.[0]?.model ?? 'unknown');
    uptimeEl.textContent = 'live';
  }catch(e){
    statusEl.textContent = 'offline';
    modelEl.textContent = '—';
    uptimeEl.textContent = '—';
  }
}

/* Initial status check */
checkStatus();

/* Chat form submit handler */
form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const input = document.getElementById('prompt');
  const userText = input.value.trim();
  if (!userText) return;
  appendMessage('You', userText);
  input.value = '';

  const body = {
    model: "meta-llama-3.1-8b-instruct", // change to the model you loaded in LM Studio
    messages: [{ role: "user", content: userText }],
    max_tokens: 512,
    temperature: 0.2
  };

  try{
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {})
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      appendMessage('System', `Error: ${res.status} ${text}`);
      return;
    }

    const data = await res.json();

    /* OpenAI-compatible responses: extract assistant text */
    const assistant = data.choices?.[0]?.message?.content ?? JSON.stringify(data);
    appendMessage('Assistant', assistant);
  }catch(err){
    appendMessage('System', 'Request failed: ' + err.message);
  }
});