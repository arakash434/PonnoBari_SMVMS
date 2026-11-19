// OWNER: Member 3
// Admin dashboard: KPI cards, charts, vendor directory, approve/block, register vendor modal.

let sectorChartInstance = null;
let tierChartInstance = null;

function renderKPIs() {
  const approvedCount = state.vendors.filter(v => v.status === 'Approved').length;
  const totalSales = state.vendors.reduce((sum, v) => sum + v.sales, 0);
  const totalCommission = Math.round(totalSales * 0.10);
  const avgKpi = state.vendors.length
    ? (state.vendors.reduce((sum, v) => sum + v.kpi, 0) / state.vendors.length).toFixed(1)
    : 0;

  const cards = [
    { label: 'Active / Total Vendors', value: `${approvedCount} / ${state.vendors.length}`, icon: 'fa-store', color: 'blue' },
    { label: 'Total Recorded Sales', value: `৳${totalSales.toLocaleString()}`, icon: 'fa-coins', color: 'emerald' },
    { label: 'Platform Commission (10%)', value: `৳${totalCommission.toLocaleString()}`, icon: 'fa-percent', color: 'indigo' },
    { label: 'Average Vendor KPI Score', value: `${avgKpi} / 100`, icon: 'fa-award', color: 'amber' }
  ];

  document.getElementById('kpi-grid').innerHTML = cards.map(c => `
    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
      <div>
        <p class="text-xs font-medium text-slate-500">${c.label}</p>
        <p class="text-xl font-extrabold text-slate-900 mt-1">${c.value}</p>
      </div>
      <div class="w-11 h-11 rounded-xl bg-${c.color}-50 text-${c.color}-600 flex items-center justify-center text-lg">
        <i class="fa-solid ${c.icon}"></i>
      </div>
    </div>
  `).join('');
}

function renderCharts() {
  if (typeof Chart === 'undefined') return; // charts need the Chart.js CDN
  const sectorTotals = SECTORS.map(sec =>
    state.vendors.filter(v => v.sector === sec).reduce((acc, v) => acc + v.sales, 0)
  );
  const shortLabels = [
    'Garments', 'Crockeries', 'Hardware', 'IT & Soft', 'Electronics', 'Grocery', 'Services'
  ];

  const ctx1 = document.getElementById('sectorChart').getContext('2d');
  if (sectorChartInstance) sectorChartInstance.destroy();
  sectorChartInstance = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: shortLabels,
      datasets: [{
        label: 'Sales (BDT)',
        data: sectorTotals,
        backgroundColor: '#2563eb',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  const approved = state.vendors.filter(v => v.status === 'Approved').length;
  const pending = state.vendors.filter(v => v.status === 'Pending').length;
  const blocked = state.vendors.filter(v => v.status === 'Blocked').length;

  const ctx2 = document.getElementById('vendorTierChart').getContext('2d');
  if (tierChartInstance) tierChartInstance.destroy();
  tierChartInstance = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['Approved', 'Pending', 'Blocked'],
      datasets: [{
        data: [approved, pending, blocked],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderVendorsTable() {
  const secFilter = document.getElementById('filter-sector').value;
  const statusFilter = document.getElementById('filter-status').value;

  const filtered = state.vendors.filter(v =>
    (secFilter === 'ALL' || v.sector === secFilter) &&
    (statusFilter === 'ALL' || v.status === statusFilter)
  );

  const badgeMap = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Blocked: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  document.getElementById('vendors-tbody').innerHTML = filtered.map(v => `
    <tr class="hover:bg-slate-50/80">
      <td class="py-3 px-3">
        <div class="font-bold text-slate-900">${v.shop}</div>
        <div class="text-[11px] text-slate-500">${v.owner} • ${v.id}</div>
      </td>
      <td class="py-3 px-3 text-slate-700">${v.sector}</td>
      <td class="py-3 px-3">
        <div class="font-semibold text-slate-800">Stall ${v.stall}</div>
        <div class="text-[11px] text-slate-500">Rent: ৳${v.rent.toLocaleString()}/mo</div>
      </td>
      <td class="py-3 px-3 font-bold text-blue-700">${v.kpi}/100</td>
      <td class="py-3 px-3">
        <div class="font-semibold text-slate-900">৳${v.sales.toLocaleString()}</div>
        <div class="text-[11px] text-emerald-700">Comm: ৳${Math.round(v.sales * 0.1).toLocaleString()}</div>
      </td>
      <td class="py-3 px-3">
        <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeMap[v.status]}">${v.status}</span>
      </td>
      <td class="py-3 px-3 text-right space-x-1 whitespace-nowrap">
        <button onclick="setVendorStatus('${v.id}', 'Approved')" class="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Approve</button>
        <button onclick="setVendorStatus('${v.id}', 'Blocked')" class="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-semibold">Block</button>
      </td>
    </tr>
  `).join('');
}

function setVendorStatus(id, status) {
  const v = state.vendors.find(item => item.id === id);
  if (!v) return;
  v.status = status;
  renderAll();
  showToast(`${v.shop} marked as ${status}`);
}

function openVendorModal() {
  document.getElementById('vendor-modal').classList.remove('hidden');
}

function closeVendorModal() {
  document.getElementById('vendor-modal').classList.add('hidden');
}

function registerVendor(e) {
  e.preventDefault();
  const owner = document.getElementById('new-v-owner').value.trim();
  const shop = document.getElementById('new-v-shop').value.trim();
  const sector = document.getElementById('new-v-sector').value;
  const stall = document.getElementById('new-v-stall').value.trim();
  const rent = Number(document.getElementById('new-v-rent').value);

  state.vendors.push({
    id: 'V-' + (101 + state.vendors.length),
    owner, shop, sector, stall, rent,
    kpi: 75, sales: 0, status: 'Pending'
  });

  closeVendorModal();
  e.target.reset();
  refreshVendorDropdowns();
  renderAll();
  showToast(`${shop} registered (Status: Pending Approval)`);
}
