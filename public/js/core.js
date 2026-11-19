// OWNER: Member 1
// Shared core: sectors, app state, role config, tab switching, toast, home tiles, renderAll. Ask the team before changing this file.

const SECTORS = [
  "Garments and Fashion Shops",
  "Crockeries and Household Items",
  "Hardware and Construction Materials",
  "Software and IT Solutions",
  "Electronics and Mobile Accessories",
  "Grocery and Daily Necessities",
  "Service-Based Vendors"
];

const state = {
  role: 'admin',
  tab: 'overview',
  vendors: [
    { id: 'V-101', owner: 'Rafiqul Islam', shop: 'Dhaka Thread & Style', sector: 'Garments and Fashion Shops', stall: 'A-12', rent: 9500, kpi: 88, sales: 145000, status: 'Approved' },
    { id: 'V-102', owner: 'Nusrat Jahan', shop: 'Apex IT & Cloud Care', sector: 'Software and IT Solutions', stall: 'C-04', rent: 12000, kpi: 92, sales: 210000, status: 'Approved' },
    { id: 'V-103', owner: 'Kamrul Hasan', shop: 'VoltEdge Mobile Hub', sector: 'Electronics and Mobile Accessories', stall: 'B-19', rent: 10000, kpi: 79, sales: 118000, status: 'Approved' },
    { id: 'V-104', owner: 'Farhana Yasmin', shop: 'FreshBasket Daily Mart', sector: 'Grocery and Daily Necessities', stall: 'G-02', rent: 8500, kpi: 85, sales: 96000, status: 'Approved' },
    { id: 'V-105', owner: 'Mahmudul Haque', shop: 'BuildStrong Hardware', sector: 'Hardware and Construction Materials', stall: 'D-07', rent: 11000, kpi: 70, sales: 54000, status: 'Pending' },
    { id: 'V-106', owner: 'Sadia Afrin', shop: 'FixIt Pro Maintenance', sector: 'Service-Based Vendors', stall: 'S-03', rent: 6500, kpi: 62, sales: 28000, status: 'Blocked' }
  ],
  campaigns: [
    { id: 'CMP-1', title: 'Festive Apparel Spotlight', vendorId: 'V-101', budget: 40000, spent: 28500 },
    { id: 'CMP-2', title: 'Enterprise IT Audit Drive', vendorId: 'V-102', budget: 50000, spent: 46000 },
    { id: 'CMP-3', title: 'Smart Gadget Week', vendorId: 'V-103', budget: 30000, spent: 31500 }
  ],
  products: [
    { id: 'P-1', vendorId: 'V-101', name: 'Premium Panjabi Collection', price: 1850, stock: 30 },
    { id: 'P-2', vendorId: 'V-102', name: 'Web & ERP Security Audit', price: 15000, stock: 12 },
    { id: 'P-3', vendorId: 'V-103', name: '65W GaN Fast Charger', price: 2200, stock: 45 },
    { id: 'P-4', vendorId: 'V-104', name: 'Organic Basmati Rice (5kg)', price: 780, stock: 60 },
    { id: 'P-5', vendorId: 'V-105', name: 'Heavy Duty Drill Bits Set', price: 1450, stock: 20 }
  ],
  ledger: [
    { id: 'TXN-9001', vendorId: 'V-101', desc: 'Premium Panjabi Collection (x2)', gross: 3700 },
    { id: 'TXN-9002', vendorId: 'V-102', desc: 'Web & ERP Security Audit (x1)', gross: 15000 },
    { id: 'TXN-9003', vendorId: 'V-103', desc: '65W GaN Fast Charger (x3)', gross: 6600 }
  ],
  messages: [
    { from: 'V-101 (Dhaka Thread & Style)', text: 'Uploaded updated trade license & requested festive campaign banner.', time: '10:15 AM' },
    { from: 'Admin (Market Authority)', text: 'Approved stall A-12 monthly commission schedule. Welcome to Q4 campaign.', time: '11:05 AM' }
  ]
};

function initSelects() {
  const sectorFilter = document.getElementById('filter-sector');
  const storefrontSector = document.getElementById('storefront-sector');
  const newVSector = document.getElementById('new-v-sector');

  storefrontSector.innerHTML = `<option value="ALL">All Verified Sectors</option>` +
    SECTORS.map(s => `<option value="${s}">${s}</option>`).join('');

  sectorFilter.innerHTML = `<option value="ALL">All Sectors (7)</option>` +
    SECTORS.map(s => `<option value="${s}">${s}</option>`).join('');

  newVSector.innerHTML = SECTORS.map(s => `<option value="${s}">${s}</option>`).join('');
}

function refreshVendorDropdowns() {
  const campVendor = document.getElementById('camp-vendor');
  const kpiVendor = document.getElementById('kpi-vendor');
  const activeVendorSelect = document.getElementById('active-vendor-select');

  const options = state.vendors.map(v => `<option value="${v.id}">${v.shop} (${v.id})</option>`).join('');
  campVendor.innerHTML = options;
  kpiVendor.innerHTML = options;

  const prevActive = activeVendorSelect.value;
  activeVendorSelect.innerHTML = options;
  if (prevActive && state.vendors.some(v => v.id === prevActive)) {
    activeVendorSelect.value = prevActive;
  }
}

const ROLE_CONFIG = {
  admin:     { label: 'Admin',     desc: 'Approve vendors, view analytics & billing', tabs: ['overview', 'vendors', 'campaigns', 'billing'], home: 'overview' },
  marketing: { label: 'Marketing', desc: 'Run campaigns, budgets & vendor scoring',   tabs: ['campaigns'],                                   home: 'campaigns' },
  vendor:    { label: 'Vendor',    desc: 'Manage your shop catalog & earnings',       tabs: ['vendor-portal'],                               home: 'vendor-portal' },
  customer:  { label: 'Customer',  desc: 'Browse shops and place orders',             tabs: ['storefront'],                                  home: 'storefront' }
};
const ALL_TABS = ['overview', 'vendors', 'campaigns', 'vendor-portal', 'storefront', 'billing'];
function switchTab(tab) {
  state.tab = tab;
  const tabs = ['overview', 'vendors', 'campaigns', 'vendor-portal', 'storefront', 'billing'];
  tabs.forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('active', t === tab);
    document.getElementById(`view-${t}`).classList.toggle('hidden', t !== tab);
  });
  renderAll();
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
}

function renderHome() {
  const user = state.user;
  if (!user) return;
  const atHome = state.tab === ROLE_CONFIG[user.role].home;
  document.getElementById('home-section').classList.toggle('hidden', !atHome);
  document.getElementById('home-messages-card').classList.toggle('hidden', !(atHome && user.role === 'admin'));
  document.getElementById('home-greeting').textContent = 'Good to see you, ' + user.name;
  const subs = {
    admin: 'Here is what needs you today.',
    marketing: 'Here is what needs you today.',
    vendor: 'Manage your shop and stay in touch with the market admin.',
    customer: 'Find something from verified vendors.'
  };
  document.getElementById('home-sub').textContent = subs[user.role];

  const pending = state.vendors.filter(v => v.status === 'Pending').length;
  const approved = state.vendors.filter(v => v.status === 'Approved').length;
  const over = state.campaigns.filter(c => c.spent > c.budget).length;
  const budgetSub = over ? over + ' over budget' : 'All within budget';
  const tiles = {
    admin: [
      ['Approve vendors', pending + ' waiting', 'vendors'],
      ['Campaign budgets', budgetSub, 'campaigns'],
      ['Vendor KPI scores', state.vendors.length + ' vendors', 'campaigns'],
      ['Billing & ledger', state.ledger.length + ' transactions', 'billing']
    ],
    marketing: [
      ['Campaigns', state.campaigns.length + ' running', 'campaigns'],
      ['Budget alerts', budgetSub, 'campaigns'],
      ['Vendor KPI scores', state.vendors.length + ' vendors', 'campaigns']
    ],
    vendor: [
      ['My catalog', 'Add or update products and services', 'vendor-portal'],
      ['Messages', state.messages.length + ' in the thread', 'vendor-portal']
    ],
    customer: [
      ['Browse stores', approved + ' verified stores', 'storefront'],
      ['Market sectors', SECTORS.length + ' to explore', 'storefront']
    ]
  };
  document.getElementById('home-tiles').innerHTML = tiles[user.role].map(t => `
    <button type="button" onclick="switchTab('${t[2]}')" class="text-left bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition">
      <span class="block w-8 h-1.5 rounded bg-amber-400 mb-3"></span>
      <span class="block text-base font-extrabold text-slate-900">${t[0]}</span>
      <span class="block text-xs text-slate-500 mt-1">${t[1]}</span>
    </button>`).join('');

  document.getElementById('home-messages').innerHTML = state.messages.slice(0, 2).map(m => `
    <div class="border-t border-slate-100 pt-2.5 first:border-0 first:pt-0">
      <p class="text-[11px] font-semibold text-slate-500">${m.from} &middot; ${m.time}</p>
      <p class="text-sm text-slate-800 mt-0.5">${m.text}</p>
    </div>`).join('');
}

function renderAll() {
  renderKPIs();
  renderCharts();
  renderVendorsTable();
  renderCampaigns();
  renderVendorPortal();
  renderStorefront();
  renderLedger();
  renderMessages();
  renderHome();
}
