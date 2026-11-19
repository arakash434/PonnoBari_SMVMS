// OWNER: Member 2
// Vendor workspace: earnings bar, add/remove products, messages to admin.

function renderVendorPortal() {
  const vId = document.getElementById('active-vendor-select').value;
  const vendor = state.vendors.find(v => v.id === vId) || state.vendors[0];
  if (!vendor) return;

  const comm = Math.round(vendor.sales * 0.1);
  const net = vendor.sales - comm;

  document.getElementById('vendor-earnings-bar').innerHTML = `
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <p class="text-[11px] text-slate-500">Gross Sales</p>
      <p class="text-base font-extrabold text-slate-900">৳${vendor.sales.toLocaleString()}</p>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <p class="text-[11px] text-slate-500">Commission (10%)</p>
      <p class="text-base font-extrabold text-rose-600">৳${comm.toLocaleString()}</p>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <p class="text-[11px] text-slate-500">Net Earnings</p>
      <p class="text-base font-extrabold text-emerald-600">৳${net.toLocaleString()}</p>
    </div>
  `;

  const myProducts = state.products.filter(p => p.vendorId === vendor.id);
  document.getElementById('vendor-products-tbody').innerHTML = myProducts.length
    ? myProducts.map(p => `
      <tr>
        <td class="py-2.5 px-3 font-semibold text-slate-800">${p.name}</td>
        <td class="py-2.5 px-3">৳${p.price.toLocaleString()}</td>
        <td class="py-2.5 px-3">${p.stock}</td>
        <td class="py-2.5 px-3 text-right">
          <button onclick="deleteProduct('${p.id}')" class="text-rose-600 hover:underline font-semibold">Remove</button>
        </td>
      </tr>
    `).join('')
    : `<tr><td colspan="4" class="py-4 text-center text-slate-400">No items added for ${vendor.shop} yet.</td></tr>`;
}

function addProduct(e) {
  e.preventDefault();
  const vendorId = document.getElementById('active-vendor-select').value;
  const name = document.getElementById('prod-name').value.trim();
  const price = Number(document.getElementById('prod-price').value);
  const stock = Number(document.getElementById('prod-stock').value);

  state.products.push({ id: 'P-' + Date.now(), vendorId, name, price, stock });
  document.getElementById('prod-name').value = '';
  renderVendorPortal();
  renderStorefront();
  showToast(`Published "${name}" to storefront`);
}

function deleteProduct(id) {
  state.products = state.products.filter(p => p.id !== id);
  renderVendorPortal();
  renderStorefront();
  showToast('Item removed from catalog');
}

function sendVendorMessage(e) {
  e.preventDefault();
  const vId = document.getElementById('active-vendor-select').value;
  const vendor = state.vendors.find(v => v.id === vId);
  const text = document.getElementById('vendor-msg-input').value.trim();
  state.messages.unshift({
    from: `${vendor.id} (${vendor.shop})`,
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  document.getElementById('vendor-msg-input').value = '';
  renderMessages();
  showToast('Message sent to Admin');
}

function renderMessages() {
  document.getElementById('message-feed').innerHTML = state.messages.map(m => `
    <div class="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs flex items-start justify-between gap-3">
      <div>
        <span class="font-bold text-slate-900">${m.from}:</span>
        <span class="text-slate-700 ml-1">${m.text}</span>
      </div>
      <span class="text-[11px] text-slate-400 whitespace-nowrap">${m.time}</span>
    </div>
  `).join('');
}
