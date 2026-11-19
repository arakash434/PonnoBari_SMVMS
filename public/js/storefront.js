// OWNER: Member 1
// Customer storefront: product grid, purchase, receipt.

function renderStorefront() {
  const sec = document.getElementById('storefront-sector').value;
  const approvedIds = new Set(state.vendors.filter(v => v.status === 'Approved').map(v => v.id));

  const items = state.products.filter(p => {
    if (!approvedIds.has(p.vendorId) || p.stock <= 0) return false;
    const v = state.vendors.find(vend => vend.id === p.vendorId);
    return sec === 'ALL' || (v && v.sector === sec);
  });

  document.getElementById('storefront-grid').innerHTML = items.length
    ? items.map(p => {
      const v = state.vendors.find(vend => vend.id === p.vendorId);
      return `
        <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span class="font-semibold text-blue-600">${v.shop}</span>
              <span>Stock: ${p.stock}</span>
            </div>
            <h3 class="text-sm font-bold text-slate-900">${p.name}</h3>
            <p class="text-[11px] text-slate-500 mt-0.5">${v.sector}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-base font-extrabold text-slate-900">৳${p.price.toLocaleString()}</span>
            <button onclick="buyItem('${p.id}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition">
              Purchase Now
            </button>
          </div>
        </div>
      `;
    }).join('')
    : `<div class="col-span-full bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">No items available for the selected sector.</div>`;
}

function buyItem(prodId) {
  const prod = state.products.find(p => p.id === prodId);
  const vendor = state.vendors.find(v => v.id === prod.vendorId);
  if (!prod || !vendor || prod.stock <= 0) return;

  prod.stock -= 1;
  vendor.sales += prod.price;
  const txnId = 'TXN-' + Math.floor(1000 + Math.random() * 9000);
  state.ledger.unshift({ id: txnId, vendorId: vendor.id, desc: `${prod.name} (x1)`, gross: prod.price });

  const comm = Math.round(prod.price * 0.1);
  document.getElementById('rec-id').textContent = txnId;
  document.getElementById('rec-body').innerHTML = `
    <div class="flex justify-between"><span class="text-slate-500">Shop:</span><span class="font-semibold">${vendor.shop}</span></div>
    <div class="flex justify-between"><span class="text-slate-500">Item:</span><span class="font-semibold">${prod.name}</span></div>
    <div class="flex justify-between"><span class="text-slate-500">Amount Paid:</span><span class="font-bold text-slate-900">৳${prod.price.toLocaleString()}</span></div>
    <div class="flex justify-between"><span class="text-slate-500">Platform Comm. (10%):</span><span>৳${comm.toLocaleString()}</span></div>
  `;
  document.getElementById('receipt-modal').classList.remove('hidden');
  renderAll();
}
