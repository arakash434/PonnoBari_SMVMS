// OWNER: Member 1
// Landing/login/sign-up, demo users, session, profile panel, logout.

const USERS_KEY = 'smvms_users';
const SESSION_KEY = 'smvms_session';
let authMode = 'login';
let authRole = 'customer';

function storeGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}
function storeSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
}
function storeRemove(key) {
  try { localStorage.removeItem(key); } catch (e) { /* storage unavailable */ }
}

// Demo-only password hashing. A real deployment must hash on the server (e.g. bcrypt).
async function hashPassword(pw) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('smvms:' + pw));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return 'x' + btoa(unescape(encodeURIComponent(pw)));
  }
}

let memoryUsers = null;
function loadUsers() { return storeGet(USERS_KEY) || memoryUsers || []; }
function saveUsers(users) { memoryUsers = users; storeSet(USERS_KEY, users); }

async function seedDemoUsers() {
  if (loadUsers().length) return;
  const hash = await hashPassword('demo123');
  saveUsers(Object.keys(ROLE_CONFIG).map(role => ({
    name: ROLE_CONFIG[role].label + ' Demo',
    email: role + '@smvms.com',
    role,
    hash
  })));
}

function renderAuthRoles() {
  document.getElementById('auth-roles').innerHTML = Object.keys(ROLE_CONFIG).map(role => {
    const active = role === authRole;
    return `<button type="button" onclick="selectAuthRole('${role}')" class="text-left rounded-xl border px-3 py-2.5 transition ${active ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-300 hover:bg-slate-50'}">
      <span class="block text-xs font-bold ${active ? 'text-blue-700' : 'text-slate-900'}">${ROLE_CONFIG[role].label}</span>
      <span class="block text-[11px] text-slate-500 mt-0.5">${ROLE_CONFIG[role].desc}</span>
    </button>`;
  }).join('');
}

function selectAuthRole(role) {
  authRole = role;
  renderAuthRoles();
  showAuthError('');
}

function setAuthMode(mode) {
  authMode = mode;
  const signup = mode === 'signup';
  document.getElementById('auth-name-wrap').classList.toggle('hidden', !signup);
  document.getElementById('auth-confirm-wrap').classList.toggle('hidden', !signup);
  document.getElementById('auth-submit').textContent = signup ? 'Create Account' : 'Log In';
  document.getElementById('auth-subtitle').textContent = signup ? 'Create your account' : 'Log in to continue';
  document.getElementById('auth-password').autocomplete = signup ? 'new-password' : 'current-password';
  ['login', 'signup'].forEach(m => {
    const b = document.getElementById('auth-tab-' + m);
    b.className = 'py-2 rounded-lg transition ' + (m === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900');
  });
  showAuthError('');
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.classList.toggle('hidden', !msg);
}

async function submitAuth(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value.trim().toLowerCase();
  const password = document.getElementById('auth-password').value;
  if (!email || !password) { showAuthError('Please enter your email and password.'); return; }
  const users = loadUsers();
  const hash = await hashPassword(password);

  if (authMode === 'signup') {
    const name = document.getElementById('auth-name').value.trim();
    const confirm = document.getElementById('auth-confirm').value;
    if (!name) { showAuthError('Please enter your full name.'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { showAuthError('Please enter a valid email address.'); return; }
    if (password.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { showAuthError('Passwords do not match.'); return; }
    if (users.some(u => u.email === email)) { showAuthError('An account with this email already exists. Please log in.'); return; }
    const user = { name, email, role: authRole, hash };
    users.push(user);
    saveUsers(users);
    startSession(user);
    return;
  }

  const user = users.find(u => u.email === email);
  if (!user || user.hash !== hash) { showAuthError('Incorrect email or password.'); return; }
  if (user.role !== authRole) { showAuthError('This account is not registered under the role you selected.'); return; }
  startSession(user);
}

function startSession(user) {
  storeSet(SESSION_KEY, { email: user.email });
  applySession(user);
}

function applySession(user) {
  const cfg = ROLE_CONFIG[user.role];
  state.role = user.role;
  state.user = user;
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('app-header').classList.remove('hidden');
  document.getElementById('app-main').classList.remove('hidden');
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
  document.getElementById('profile-avatar').textContent = initials;
  document.getElementById('profile-avatar-lg').textContent = initials;
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-name-lg').textContent = user.name;
  document.getElementById('profile-email-lg').textContent = user.email;
  document.getElementById('profile-role').textContent = cfg.label;
  document.getElementById('profile-role-lg').textContent = cfg.label;
  document.getElementById('profile-panel').classList.add('hidden');

  ALL_TABS.forEach(t => document.getElementById('tab-' + t).classList.toggle('hidden', !cfg.tabs.includes(t)));
  document.getElementById('tab-nav').classList.toggle('hidden', cfg.tabs.length < 2);

  const isAdmin = user.role === 'admin';
  document.getElementById('btn-register-vendor').classList.toggle('hidden', !isAdmin);
  document.getElementById('btn-export').classList.toggle('hidden', !isAdmin);
  document.getElementById('kpi-grid').classList.toggle('hidden', !(isAdmin || user.role === 'marketing'));

  switchTab(cfg.home);
  showToast('Welcome, ' + user.name);
}

function toggleProfile(e) {
  e.stopPropagation();
  document.getElementById('profile-panel').classList.toggle('hidden');
}
document.addEventListener('click', e => {
  const panel = document.getElementById('profile-panel');
  if (panel && !panel.contains(e.target)) panel.classList.add('hidden');
});

function logout() {
  storeRemove(SESSION_KEY);
  state.user = null;
  document.getElementById('app-header').classList.add('hidden');
  document.getElementById('app-main').classList.add('hidden');
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('landing').classList.remove('hidden');
  document.getElementById('auth-form').reset();
  setAuthMode('login');
}

function showAuth(mode) {
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  setAuthMode(mode);
}

function showLanding() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('landing').classList.remove('hidden');
}

function initAuth() {
  renderAuthRoles();
  setAuthMode('login');
  seedDemoUsers().then(() => {
    const session = storeGet(SESSION_KEY);
    const user = session && loadUsers().find(u => u.email === session.email);
    if (user) applySession(user);
  });
}
