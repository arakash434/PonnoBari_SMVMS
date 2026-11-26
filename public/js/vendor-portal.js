window.SMVMSVendorPortal = {
  getSelectedVendorId() {
    const selectEl = document.getElementById('active-vendor-select');
    return selectEl ? selectEl.value : null;
  },

  calculateSummary(vendor) {
    const grossSales = Number(vendor?.sales || 0);
    const commission = Math.round(grossSales * 0.10);
    const netEarnings = grossSales - commission;
    return { grossSales, commission, netEarnings };
  },

  renderEarnings(containerEl, vendor) {
    if (!containerEl || !vendor) return;
    const { grossSales, commission, netEarnings } = this.calculateSummary(vendor);
    containerEl.innerHTML = `
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <p class="text-[11px] text-slate-500">Gross Sales</p>
        <p class="text-base font-extrabold text-slate-900">৳${grossSales.toLocaleString()}</p>
      </div>
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <p class="text-[11px] text-slate-500">Commission (10%)</p>
        <p class="text-base font-extrabold text-rose-600">৳${commission.toLocaleString()}</p>
      </div>
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <p class="text-[11px] text-slate-500">Net Earnings</p>
        <p class="text-base font-extrabold text-emerald-600">৳${netEarnings.toLocaleString()}</p>
      </div>
    `;
  }
};