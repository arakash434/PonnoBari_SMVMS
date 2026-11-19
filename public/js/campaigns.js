// OWNER: Member 3
// Campaign list and budget bars, create campaign, KPI scoring form.

function renderCampaigns() {
  document.getElementById('campaigns-list').innerHTML = state.campaigns.map(c => {
    const vendor = state.vendors.find(v => v.id === c.vendorId);
    const pct = Math.min(100, Math.round((c.spent / c.budget) * 100));
    const overBudget = c.spent > c.budget;
    return `
      <div class="border border-slate-200 rounded-xl p-3.5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <span class="font-bold text-slate-900 text-xs">${c.title}</span>
            <span class="text-[11px] text-slate-500 ml-2">• ${vendor ? vendor.shop : c.vendorId}</span>
          </div>
          <span class="text-xs font-bold ${overBudget ? 'text-rose-600' : 'text-slate-700'}">
            ৳${c.spent.toLocaleString()} / ৳${c.budget.toLocaleString()} (${pct}%)
          </span>
        </div>
        <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full ${overBudget ? 'bg-rose-500' : 'bg-blue-600'}" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function addCampaign(e) {
  e.preventDefault();
  const title = document.getElementById('camp-title').value.trim();
  const vendorId = document.getElementById('camp-vendor').value;
  const budget = Number(document.getElementById('camp-budget').value);
  const spent = Number(document.getElementById('camp-spent').value);

  state.campaigns.unshift({ id: 'CMP-' + (state.campaigns.length + 1), title, vendorId, budget, spent });
  e.target.reset();
  renderCampaigns();
  showToast(`Campaign "${title}" added`);
}

function submitKpiScore(e) {
  e.preventDefault();
  const vendorId = document.getElementById('kpi-vendor').value;
  const d = Number(document.getElementById('kpi-delivery').value);
  const q = Number(document.getElementById('kpi-quality').value);
  const c = Number(document.getElementById('kpi-cost').value);
  const transparency = 20;
  const total = Math.min(100, d + q + c + transparency);

  const v = state.vendors.find(item => item.id === vendorId);
  if (v) {
    v.kpi = total;
    renderAll();
    showToast(`Updated ${v.shop} KPI score to ${total}/100`);
  }
}
